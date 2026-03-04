export interface BoatListing {
  id: string;
  type: "motor" | "sailing" | "catamaran" | "yacht" | "luxury" | "party";
  location: string;
  rating: number;
  reviewCount: number;
  title: string;
  images: string[];
  tags: { label: string; icon: "skipper" | "no-skipper" | "boat-type" | "super-owner" | "no-licence" }[];
  specs: string;
  perks: ("fuel" | "free-cancel" | "flexible-cancel")[];
  price: number;
  priceUnit: string; // "" or "/ day"
  instantBooking: boolean;
  discountOffer: boolean;
  isNew: boolean;
}

export const trendingBoats: BoatListing[] = [
  {
    id: "t1",
    type: "motor",
    location: "Agios Sostis Harbour, Zakynthos",
    rating: 4.9,
    reviewCount: 163,
    title: "3in1 half Day Cruise – Discover the Beautiful Coast",
    images: [
      "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=500&q=80&auto=format",
      "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=500&q=80&auto=format",
      "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=500&q=80&auto=format",
    ],
    tags: [
      { label: "Skipper included", icon: "skipper" },
      { label: "Super owner", icon: "super-owner" },
      { label: "Motorboat", icon: "boat-type" },
    ],
    specs: "3 hours · For groups of up to 8 people",
    perks: ["fuel", "free-cancel"],
    price: 375,
    priceUnit: "",
    instantBooking: true,
    discountOffer: false,
    isNew: false,
  },
];

export const allBoats: BoatListing[] = [];
