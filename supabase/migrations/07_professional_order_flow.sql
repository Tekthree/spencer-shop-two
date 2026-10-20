-- Harden checkout inventory, fulfillment, and post-payment operations.

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1001;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number BIGINT,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
  ADD COLUMN IF NOT EXISTS requires_shipping BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS tracking_number TEXT,
  ADD COLUMN IF NOT EXISTS carrier TEXT,
  ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT,
  ADD COLUMN IF NOT EXISTS status_history JSONB NOT NULL DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.orders
  ALTER COLUMN order_number SET DEFAULT nextval('public.order_number_seq');

UPDATE public.orders
SET order_number = nextval('public.order_number_seq')
WHERE order_number IS NULL;

SELECT setval(
  'public.order_number_seq',
  GREATEST(COALESCE((SELECT MAX(order_number) FROM public.orders), 1000), 1000),
  TRUE
);

ALTER TABLE public.orders
  ALTER COLUMN order_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number_unique
  ON public.orders (order_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_checkout_session_unique
  ON public.orders (stripe_checkout_session_id)
  WHERE stripe_checkout_session_id IS NOT NULL;

UPDATE public.orders AS o
SET requires_shipping = COALESCE((
  SELECT bool_or(a.requires_shipping)
  FROM jsonb_array_elements(o.items) AS ordered(item)
  JOIN public.artworks AS a ON a.id::TEXT = ordered.item->>'artwork_id'
), TRUE);

UPDATE public.orders
SET status = 'processing'
WHERE status = 'pending';

ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'paid';

UPDATE public.orders
SET status_history = jsonb_build_array(
  jsonb_build_object(
    'status', status,
    'at', created_at,
    'source', 'migration'
  )
)
WHERE status_history = '[]'::JSONB;

-- Preserve complete edition details on legacy line items. Older fulfillment
-- recorded only the first edition number even when quantity was greater than 1.
UPDATE public.orders AS o
SET items = (
  SELECT jsonb_agg(
    ordered.item || jsonb_strip_nulls(jsonb_build_object(
      'title', COALESCE(ordered.item->>'title', artwork.title),
      'quantity', COALESCE((ordered.item->>'quantity')::INTEGER, 1),
      'edition_limit', COALESCE((ordered.item->>'edition_limit')::INTEGER, (size_info.entry->>'edition_limit')::INTEGER),
      'edition_numbers', COALESCE(
        ordered.item->'edition_numbers',
        CASE WHEN ordered.item->>'edition_number' IS NOT NULL THEN (
          SELECT jsonb_agg(number ORDER BY number)
          FROM generate_series(
            (ordered.item->>'edition_number')::INTEGER,
            (ordered.item->>'edition_number')::INTEGER + COALESCE((ordered.item->>'quantity')::INTEGER, 1) - 1
          ) AS number
        ) END
      ),
      'requires_shipping', artwork.requires_shipping
    ))
    ORDER BY ordered.position
  ) AS items
  FROM jsonb_array_elements(o.items) WITH ORDINALITY AS ordered(item, position)
  LEFT JOIN public.artworks AS artwork ON artwork.id::TEXT = ordered.item->>'artwork_id'
  LEFT JOIN LATERAL (
    SELECT size_entry AS entry
    FROM jsonb_array_elements(artwork.sizes) AS sizes(size_entry)
    WHERE size_entry->>'size' = ordered.item->>'size'
    LIMIT 1
  ) AS size_info ON TRUE
)
WHERE EXISTS (
  SELECT 1 FROM jsonb_array_elements(o.items) AS existing(item)
  WHERE item->'edition_numbers' IS NULL OR item->>'edition_limit' IS NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_allowed'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_status_allowed
      CHECK (status IN ('paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'));
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.checkout_reservations (
  id UUID PRIMARY KEY,
  stripe_session_id TEXT UNIQUE,
  items JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'fulfilled', 'released', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkout_reservations_active
  ON public.checkout_reservations (status, expires_at);

CREATE OR REPLACE FUNCTION public.reserve_checkout_inventory(
  p_reservation_id UUID,
  p_items JSONB,
  p_expires_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item JSONB;
  v_artwork_id UUID;
  v_size TEXT;
  v_quantity INTEGER;
  v_sizes JSONB;
  v_edition_limit INTEGER;
  v_editions_sold INTEGER;
  v_reserved INTEGER;
BEGIN
  IF p_reservation_id IS NULL THEN
    RAISE EXCEPTION 'Reservation ID is required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Reservation items must be a non-empty array';
  END IF;

  IF p_expires_at <= now() THEN
    RAISE EXCEPTION 'Reservation expiry must be in the future';
  END IF;

  FOR v_item IN
    SELECT item
    FROM jsonb_array_elements(p_items) AS requested(item)
    ORDER BY item->>'artwork_id', item->>'size'
  LOOP
    BEGIN
      v_artwork_id := (v_item->>'artwork_id')::UUID;
      v_quantity := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Reservation item contains invalid identifiers or quantity';
    END;

    v_size := v_item->>'size';

    IF v_size IS NULL OR btrim(v_size) = '' OR v_quantity IS NULL OR v_quantity < 1 THEN
      RAISE EXCEPTION 'Reservation item contains invalid size or quantity';
    END IF;

    SELECT sizes
    INTO v_sizes
    FROM public.artworks
    WHERE id = v_artwork_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Artwork % was not found', v_artwork_id;
    END IF;

    SELECT
      (size_entry->>'edition_limit')::INTEGER,
      (size_entry->>'editions_sold')::INTEGER
    INTO v_edition_limit, v_editions_sold
    FROM jsonb_array_elements(v_sizes) AS sizes(size_entry)
    WHERE size_entry->>'size' = v_size
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Size % was not found for artwork %', v_size, v_artwork_id;
    END IF;

    SELECT COALESCE(SUM((reserved_item->>'quantity')::INTEGER), 0)::INTEGER
    INTO v_reserved
    FROM public.checkout_reservations AS reservation
    CROSS JOIN LATERAL jsonb_array_elements(reservation.items) AS held(reserved_item)
    WHERE reservation.status = 'open'
      AND reserved_item->>'artwork_id' = v_artwork_id::TEXT
      AND reserved_item->>'size' = v_size;

    IF v_editions_sold + v_reserved + v_quantity > v_edition_limit THEN
      RAISE EXCEPTION 'Insufficient inventory for artwork % in size %', v_artwork_id, v_size;
    END IF;
  END LOOP;

  INSERT INTO public.checkout_reservations (id, items, expires_at)
  VALUES (p_reservation_id, p_items, p_expires_at);
END;
$$;

CREATE OR REPLACE FUNCTION public.attach_checkout_session(
  p_reservation_id UUID,
  p_session_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.checkout_reservations
  SET stripe_session_id = p_session_id, updated_at = now()
  WHERE id = p_reservation_id AND status = 'open';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Open checkout reservation was not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_checkout_reservation(
  p_reservation_id UUID,
  p_status TEXT DEFAULT 'released'
)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_status NOT IN ('released', 'expired') THEN
    RAISE EXCEPTION 'Invalid reservation release status';
  END IF;

  UPDATE public.checkout_reservations
  SET status = p_status, updated_at = now()
  WHERE id = p_reservation_id AND status = 'open';
END;
$$;

CREATE OR REPLACE FUNCTION public.fulfill_reserved_checkout_order(
  p_customer_info JSONB,
  p_items JSONB,
  p_total INTEGER,
  p_payment_intent TEXT,
  p_checkout_session_id TEXT,
  p_reservation_id UUID
)
RETURNS TABLE(order_data JSONB, created BOOLEAN)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id UUID;
  v_existing_order public.orders%ROWTYPE;
  v_reservation public.checkout_reservations%ROWTYPE;
  v_item JSONB;
  v_reserved_item JSONB;
  v_artwork_id UUID;
  v_size TEXT;
  v_quantity INTEGER;
  v_sizes JSONB;
  v_updated_sizes JSONB;
  v_title TEXT;
  v_images JSONB;
  v_requires_shipping BOOLEAN;
  v_order_requires_shipping BOOLEAN := FALSE;
  v_edition_limit INTEGER;
  v_editions_sold INTEGER;
  v_edition_numbers JSONB;
  v_final_items JSONB := '[]'::JSONB;
BEGIN
  IF p_payment_intent IS NULL OR btrim(p_payment_intent) = '' THEN
    RAISE EXCEPTION 'Payment intent is required';
  END IF;

  IF p_checkout_session_id IS NULL OR btrim(p_checkout_session_id) = '' THEN
    RAISE EXCEPTION 'Checkout session ID is required';
  END IF;

  SELECT * INTO v_existing_order
  FROM public.orders
  WHERE payment_intent = p_payment_intent;

  IF FOUND THEN
    order_data := to_jsonb(v_existing_order);
    created := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT * INTO v_reservation
  FROM public.checkout_reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  IF NOT FOUND OR v_reservation.status <> 'open' THEN
    RAISE EXCEPTION 'Open checkout reservation was not found';
  END IF;

  IF v_reservation.stripe_session_id IS DISTINCT FROM p_checkout_session_id THEN
    RAISE EXCEPTION 'Checkout session does not match its reservation';
  END IF;

  INSERT INTO public.orders (
    customer_info,
    items,
    total,
    status,
    payment_intent,
    stripe_checkout_session_id,
    requires_shipping,
    status_history
  )
  VALUES (
    p_customer_info,
    '[]'::JSONB,
    p_total,
    'processing',
    p_payment_intent,
    p_checkout_session_id,
    FALSE,
    jsonb_build_array(jsonb_build_object('status', 'processing', 'at', now(), 'source', 'stripe'))
  )
  ON CONFLICT (payment_intent) WHERE payment_intent IS NOT NULL DO NOTHING
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    SELECT * INTO v_existing_order
    FROM public.orders
    WHERE payment_intent = p_payment_intent;

    order_data := to_jsonb(v_existing_order);
    created := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  FOR v_item IN
    SELECT item
    FROM jsonb_array_elements(p_items) AS requested(item)
    ORDER BY item->>'artwork_id', item->>'size'
  LOOP
    v_artwork_id := (v_item->>'artwork_id')::UUID;
    v_quantity := (v_item->>'quantity')::INTEGER;
    v_size := v_item->>'size';

    SELECT reserved_item
    INTO v_reserved_item
    FROM jsonb_array_elements(v_reservation.items) AS held(reserved_item)
    WHERE reserved_item->>'artwork_id' = v_artwork_id::TEXT
      AND reserved_item->>'size' = v_size
      AND (reserved_item->>'quantity')::INTEGER = v_quantity
    LIMIT 1;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Paid item does not match the checkout reservation';
    END IF;

    SELECT sizes, title, images, requires_shipping
    INTO v_sizes, v_title, v_images, v_requires_shipping
    FROM public.artworks
    WHERE id = v_artwork_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Artwork % was not found', v_artwork_id;
    END IF;

    SELECT
      (size_entry->>'edition_limit')::INTEGER,
      (size_entry->>'editions_sold')::INTEGER
    INTO v_edition_limit, v_editions_sold
    FROM jsonb_array_elements(v_sizes) AS sizes(size_entry)
    WHERE size_entry->>'size' = v_size
    LIMIT 1;

    IF NOT FOUND OR v_editions_sold + v_quantity > v_edition_limit THEN
      RAISE EXCEPTION 'Reserved inventory is unavailable for artwork % in size %', v_artwork_id, v_size;
    END IF;

    SELECT jsonb_agg(number ORDER BY number)
    INTO v_edition_numbers
    FROM generate_series(v_editions_sold + 1, v_editions_sold + v_quantity) AS number;

    SELECT jsonb_agg(
      CASE
        WHEN size_entry->>'size' = v_size THEN
          jsonb_set(size_entry, '{editions_sold}', to_jsonb(v_editions_sold + v_quantity), FALSE)
        ELSE size_entry
      END
      ORDER BY position
    )
    INTO v_updated_sizes
    FROM jsonb_array_elements(v_sizes) WITH ORDINALITY AS sizes(size_entry, position);

    UPDATE public.artworks
    SET sizes = v_updated_sizes
    WHERE id = v_artwork_id;

    v_order_requires_shipping := v_order_requires_shipping OR v_requires_shipping;

    v_final_items := v_final_items || jsonb_build_array(
      v_item || jsonb_build_object(
        'title', v_title,
        'edition_number', v_editions_sold + 1,
        'edition_numbers', v_edition_numbers,
        'edition_limit', v_edition_limit,
        'requires_shipping', v_requires_shipping,
        'image_url', CASE
          WHEN jsonb_typeof(v_images) = 'array' THEN COALESCE(
            (SELECT image->>'url' FROM jsonb_array_elements(v_images) AS images(image) WHERE image->>'type' = 'main' LIMIT 1),
            (SELECT CASE WHEN jsonb_typeof(image) = 'string' THEN trim(both '"' from image::TEXT) ELSE image->>'url' END
             FROM jsonb_array_elements(v_images) AS images(image) LIMIT 1)
          )
          WHEN jsonb_typeof(v_images) = 'object' THEN COALESCE(v_images->>'main', v_images->>'hover')
          WHEN jsonb_typeof(v_images) = 'string' THEN trim(both '"' from v_images::TEXT)
          ELSE NULL
        END
      )
    );
  END LOOP;

  UPDATE public.orders
  SET items = v_final_items,
      status = 'paid',
      requires_shipping = v_order_requires_shipping,
      status_history = status_history || jsonb_build_array(
        jsonb_build_object('status', 'paid', 'at', now(), 'source', 'stripe')
      ),
      updated_at = now()
  WHERE id = v_order_id
  RETURNING to_jsonb(orders) INTO order_data;

  UPDATE public.checkout_reservations
  SET status = 'fulfilled', updated_at = now()
  WHERE id = p_reservation_id;

  created := TRUE;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.cancel_order_and_restock(
  p_order_id UUID,
  p_refund_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_item JSONB;
  v_artwork_id UUID;
  v_size TEXT;
  v_quantity INTEGER;
  v_sizes JSONB;
  v_current_sold INTEGER;
  v_updated_sizes JSONB;
  v_result JSONB;
BEGIN
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order was not found';
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN to_jsonb(v_order);
  END IF;

  IF v_order.status NOT IN ('paid', 'processing') THEN
    RAISE EXCEPTION 'Only paid or processing orders can be cancelled';
  END IF;

  FOR v_item IN
    SELECT item
    FROM jsonb_array_elements(v_order.items) AS ordered(item)
    ORDER BY item->>'artwork_id', item->>'size'
  LOOP
    v_artwork_id := (v_item->>'artwork_id')::UUID;
    v_size := v_item->>'size';
    v_quantity := (v_item->>'quantity')::INTEGER;

    SELECT sizes INTO v_sizes
    FROM public.artworks
    WHERE id = v_artwork_id
    FOR UPDATE;

    IF FOUND THEN
      SELECT (size_entry->>'editions_sold')::INTEGER
      INTO v_current_sold
      FROM jsonb_array_elements(v_sizes) AS sizes(size_entry)
      WHERE size_entry->>'size' = v_size
      LIMIT 1;

      IF FOUND THEN
        SELECT jsonb_agg(
          CASE
            WHEN size_entry->>'size' = v_size THEN
              jsonb_set(size_entry, '{editions_sold}', to_jsonb(GREATEST(v_current_sold - v_quantity, 0)), FALSE)
            ELSE size_entry
          END
          ORDER BY position
        )
        INTO v_updated_sizes
        FROM jsonb_array_elements(v_sizes) WITH ORDINALITY AS sizes(size_entry, position);

        UPDATE public.artworks SET sizes = v_updated_sizes WHERE id = v_artwork_id;
      END IF;
    END IF;
  END LOOP;

  UPDATE public.orders
  SET status = 'cancelled',
      stripe_refund_id = p_refund_id,
      refunded_at = now(),
      cancelled_at = now(),
      updated_at = now(),
      status_history = status_history || jsonb_build_array(
        jsonb_build_object('status', 'cancelled', 'at', now(), 'source', 'admin', 'refund_id', p_refund_id)
      )
  WHERE id = p_order_id
  RETURNING to_jsonb(orders) INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_checkout_inventory(UUID, JSONB, TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.attach_checkout_session(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.release_checkout_reservation(UUID, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.fulfill_reserved_checkout_order(JSONB, JSONB, INTEGER, TEXT, TEXT, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_order_and_restock(UUID, TEXT) FROM PUBLIC;
