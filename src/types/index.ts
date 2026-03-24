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

export type BoatListingType = "motorboat" | "sailboat" | "rib" | "catamaran" | "jetski" | "gulet" | "without-licence" | "yacht";
export type SkipperOption = "with-skipper" | "without-skipper" | "both";
export type EngineType = "inboard" | "outboard" | "electric" | "none";
export type BookingMode = "instant" | "confirmation";
export type FuelCost = "included" | "not-included" | "by-arrangement";

export interface PricePeriod {
  startDate: string;
  endDate: string;
  pricePerDay: number;
}

export interface UnavailabilityPeriod {
  startDate: string;
  endDate: string;
  reason: string;
}

export interface Discount {
  type: "first-booking" | "early-bird" | "last-minute" | "length-of-stay" | "custom";
  percentage: number;
  label?: string;
  minDays?: number;
}

export interface Extra {
  name: string;
  pricePerDay: number;
  mandatory: boolean;
}

/** Timestamp type — always a Date after Supabase migration */
export type FirestoreTimestamp = Date;

export interface BoatListing {
  // Existing fields
  boatType: BoatListingType;
  city: string;
  harbour: string;
  professional: "yes" | "no";
  manufacturer: string;
  model: string;
  skipper: SkipperOption;
  capacity: number;
  length: number;
  company: string;
  website: string;
  images: string[];
  ownerId: string;
  createdAt: FirestoreTimestamp;
  status: "draft" | "pending" | "published";
  updatedAt: FirestoreTimestamp;

  // General
  boatName?: string;

  // Description
  languages?: string[];
  listingTitle?: string;
  description?: string;
  listingTitle_el?: string;
  description_el?: string;

  // Photos
  boatPlanImages?: string[];

  // Price
  pricePerDay?: number;
  currency?: string;
  pricePeriods?: PricePeriod[];
  reservationMinDays?: number;
  reservationMaxDays?: number;

  // Booking
  bookingMode?: BookingMode;
  checkInTime?: string;
  checkOutTime?: string;
  checkInTimeDayRental?: string;
  checkOutTimeDayRental?: string;
  downpaymentPercentage?: number;
  daysBeforeBalancePayment?: number;
  fuelCost?: FuelCost;
  licenceRequired?: "yes" | "no";

  // Documents
  securityDeposit?: number;
  insuranceCertificateUrl?: string;
  ownershipCertificateUrl?: string;
  yachtInsured?: "yes" | "no";

  // Calendar
  unavailabilityPeriods?: UnavailabilityPeriod[];

  // Equipment
  equipment?: string[];

  // Extras
  extras?: Extra[];

  // Other / Technical
  engineType?: EngineType;
  horsepower?: number;
  width?: number;
  draft?: number;
  equippedOffshore?: "yes" | "no";
  crewMembers?: number;
  tenderHorsepower?: number;
  yearOfConstruction?: number;
  renovated?: "yes" | "no";
  fuel?: number;
  speed?: number;
  cabins?: number;
  berths?: number;
  bathrooms?: number;

  // Discounts
  discounts?: Discount[];

  // Meta
  completedSections?: string[];
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

export type BilingualText = { en: string; el: string } | string;

export interface Article {
  id: string;
  title: BilingualText;
  slug: string;
  image: string;
  summary: BilingualText;
  content: BilingualText;
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

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  photoURL: string | null;
  type: "user" | "owner" | "admin";
  createdAt: FirestoreTimestamp;
  lastLoginAt: FirestoreTimestamp;
}

export interface SupabaseProfile {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  photo_url: string | null;
  user_type: "user" | "owner" | "admin";
  created_at: string;
  last_login_at: string;
}

export interface Order {
  id: string;
  boatId: string;
  boatTitle: string;
  renterId: string;
  renterName: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: FirestoreTimestamp;
}

export type BoatType = Boat["type"] | "luxury" | "party";

export interface BoatCardListing {
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
  priceUnit: string;
  instantBooking: boolean;
  discountOffer: boolean;
  isNew: boolean;
  capacity: number;
  cabins: number;
  berths: number;
  length: number;
  enginePower: number;
  year: number;
  superOwner: boolean;
  idealFor: string[];
  equipment: string[];
  ownerId?: string;
}

export interface SearchParams {
  location?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
  skipper?: boolean;
}
