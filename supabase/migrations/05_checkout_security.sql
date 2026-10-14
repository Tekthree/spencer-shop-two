-- Make Stripe checkout fulfillment atomic and safe to retry.

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_payment_intent_unique
  ON public.orders (payment_intent)
  WHERE payment_intent IS NOT NULL;

CREATE OR REPLACE FUNCTION public.fulfill_checkout_order(
  p_customer_info JSONB,
  p_items JSONB,
  p_total INTEGER,
  p_payment_intent TEXT
)
RETURNS TABLE(order_data JSONB, created BOOLEAN)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order_id UUID;
  v_existing_order public.orders%ROWTYPE;
  v_item JSONB;
  v_artwork_id UUID;
  v_size TEXT;
  v_quantity INTEGER;
  v_sizes JSONB;
  v_updated_sizes JSONB;
  v_title TEXT;
  v_edition_limit INTEGER;
  v_editions_sold INTEGER;
  v_final_items JSONB := '[]'::JSONB;
BEGIN
  IF p_payment_intent IS NULL OR btrim(p_payment_intent) = '' THEN
    RAISE EXCEPTION 'Payment intent is required';
  END IF;

  IF p_total IS NULL OR p_total <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive';
  END IF;

  IF p_customer_info IS NULL OR jsonb_typeof(p_customer_info) <> 'object' THEN
    RAISE EXCEPTION 'Customer information must be an object';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Order items must be a non-empty array';
  END IF;

  -- Claim the payment intent first. The partial unique index makes concurrent
  -- webhook deliveries wait for the winner and then take the duplicate path.
  INSERT INTO public.orders (
    customer_info,
    items,
    total,
    status,
    payment_intent
  )
  VALUES (
    p_customer_info,
    '[]'::JSONB,
    p_total,
    'processing',
    p_payment_intent
  )
  ON CONFLICT (payment_intent) WHERE payment_intent IS NOT NULL DO NOTHING
  RETURNING id INTO v_order_id;

  IF v_order_id IS NULL THEN
    SELECT *
    INTO v_existing_order
    FROM public.orders
    WHERE payment_intent = p_payment_intent;

    order_data := to_jsonb(v_existing_order);
    created := FALSE;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Lock artwork rows in a stable order to avoid deadlocks when two paid
  -- checkouts contain the same set of artworks in a different order.
  FOR v_item IN
    SELECT item
    FROM jsonb_array_elements(p_items) AS requested(item)
    ORDER BY item->>'artwork_id', item->>'size'
  LOOP
    BEGIN
      v_artwork_id := (v_item->>'artwork_id')::UUID;
      v_quantity := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN invalid_text_representation THEN
      RAISE EXCEPTION 'Order item contains invalid identifiers or quantity';
    END;

    v_size := v_item->>'size';

    IF v_size IS NULL OR btrim(v_size) = '' OR v_quantity IS NULL OR v_quantity < 1 THEN
      RAISE EXCEPTION 'Order item contains invalid size or quantity';
    END IF;

    SELECT sizes, title
    INTO v_sizes, v_title
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

    IF v_editions_sold + v_quantity > v_edition_limit THEN
      RAISE EXCEPTION 'Insufficient inventory for artwork % in size %', v_artwork_id, v_size;
    END IF;

    SELECT jsonb_agg(
      CASE
        WHEN size_entry->>'size' = v_size THEN
          jsonb_set(
            size_entry,
            '{editions_sold}',
            to_jsonb(v_editions_sold + v_quantity),
            FALSE
          )
        ELSE size_entry
      END
      ORDER BY position
    )
    INTO v_updated_sizes
    FROM jsonb_array_elements(v_sizes) WITH ORDINALITY AS sizes(size_entry, position);

    UPDATE public.artworks
    SET sizes = v_updated_sizes
    WHERE id = v_artwork_id;

    v_final_items := v_final_items || jsonb_build_array(
      v_item || jsonb_build_object(
        'title', v_title,
        'edition_number', v_editions_sold + 1
      )
    );
  END LOOP;

  UPDATE public.orders
  SET items = v_final_items,
      status = 'paid'
  WHERE id = v_order_id
  RETURNING to_jsonb(orders) INTO order_data;

  created := TRUE;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_checkout_order(JSONB, JSONB, INTEGER, TEXT) FROM PUBLIC;
