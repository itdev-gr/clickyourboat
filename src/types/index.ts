export interface Boat {
  id: string;
  title: string;
  description: string;
  location: {
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  pricePerDay: number;
  type: "sailing" | "motor" | "catamaran" | "yacht";
  skipperAvailable: boolean;
  rating: number;
  reviewCount: number;
  images: string[];
  ownerId: string;
  createdAt: Date;
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  boatCount: number;
}

export interface Review {
  id: string;
  boatId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  boatName: string;
  location: string;
  createdAt: Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  image: string;
  summary: string;
  content: string;
  createdAt: Date;
}

export interface Subscriber {
  email: string;
  createdAt: Date;
}

export type BoatType = Boat["type"] | "luxury" | "party";

export interface SearchParams {
  location?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  skipper?: boolean;
}
