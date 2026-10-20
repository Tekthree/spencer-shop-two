export interface ArtworkImage {
  url: string;
  alt: string;
  type: 'main' | 'hover' | 'detail';
}

export interface ArtworkSize {
  size: string;
  price: number;
  edition_limit: number;
  editions_sold: number;
}

export interface Artwork {
  id: string;
  slug?: string;
  title: string;
  description: string;
  year?: number;
  medium?: string;
  collection_id?: string;
  featured?: boolean;
  images: ArtworkImage[] | string[] | string | { main?: string; hover?: string; [key: string]: string | undefined };
  sizes?: ArtworkSize[];
  created_at?: string;
  requires_shipping?: boolean;
}

export interface FormattedArtwork {
  id: string;
  slug?: string;
  title: string;
  description: string;
  year?: number;
  medium?: string;
  collection_id?: string;
  featured?: boolean;
  images: ArtworkImage[];
  sizes?: ArtworkSize[];
  created_at?: string;
}

export interface OrderItem {
  artwork_id: string;
  size: string;
  price: number;
  edition_number: number;
  edition_numbers?: number[];
  edition_limit?: number;
  quantity: number;
  title?: string;
  image_url?: string;
  requires_shipping?: boolean;
  artwork?: Artwork;
}

export interface Order {
  id: string;
  order_number: number;
  customer_info: {
    name: string;
    email: string;
    phone?: string | null;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    } | null;
  };
  items: OrderItem[];
  total: number;
  status: string;
  payment_intent: string;
  created_at: string;
  updated_at?: string;
  requires_shipping: boolean;
  tracking_number?: string | null;
  carrier?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
  cancelled_at?: string | null;
  refunded_at?: string | null;
  stripe_refund_id?: string | null;
  status_history?: Array<{ status: string; at: string; source: string }>;
  artworks?: Record<string, Artwork>;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  featured: boolean;
  cover_image: string;
  order: number;
  created_at: string;
}
