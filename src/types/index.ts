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

export interface Conversation {
  id: string;
  participants: string[];
  participantDetails: {
    [uid: string]: {
      displayName: string;
      photoURL: string | null;
      firstName: string;
      lastName: string;
    };
  };
  lastMessage: {
    text: string;
    senderId: string;
    timestamp: Date;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  boatId: string | null;
  boatTitle: string | null;
  unreadCount: { [uid: string]: number };
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: Date;
  readBy: string[];
}

export type BoatType = Boat["type"] | "luxury" | "party";

export interface SearchParams {
  location?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  skipper?: boolean;
}
