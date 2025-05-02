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
  title: string;
  description: string;
  year?: number;
  medium?: string;
  collection_id?: string;
  featured?: boolean;
  images: ArtworkImage[] | string[] | string | { main?: string; hover?: string; [key: string]: string | undefined };
  sizes?: ArtworkSize[];
  created_at?: string;
}

export interface FormattedArtwork {
  id: string;
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
  artwork?: Artwork;
}

export interface Order {
  id: string;
  customer_info: {
    name: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
  items: OrderItem[];
  total: number;
  status: string;
  payment_intent: string;
  created_at: string;
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