import { db, storage } from "./firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type WhereFilterOp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Boat, BoatListing, Destination, Review, Article, SearchParams, UserProfile } from "../types";

// --- Boats ---
export async function searchBoats(params: SearchParams, maxResults = 20): Promise<Boat[]> {
  const boatsRef = collection(db, "boats");
  const constraints: Parameters<typeof query>[1][] = [];

  // Only return published boats
  constraints.push(where("status", "==", "published"));

  if (params.type) {
    constraints.push(where("type", "==", params.type));
  }
  if (params.skipper) {
    constraints.push(where("skipperAvailable", "==", true));
  }
  if (params.location) {
    constraints.push(where("location.city", "==", params.location));
  }

  constraints.push(orderBy("createdAt", "desc"));
  constraints.push(limit(maxResults));

  const q = query(boatsRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Boat[];
}

export async function getFeaturedBoats(count = 6): Promise<Boat[]> {
  const q = query(
    collection(db, "boats"),
    where("status", "==", "published"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Boat[];
}

export async function getOwnerBoats(ownerId: string, maxResults = 20): Promise<Boat[]> {
  const q = query(
    collection(db, "boats"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Boat[];
}

// --- Destinations ---
export async function getTopDestinations(count = 8): Promise<Destination[]> {
  const q = query(
    collection(db, "destinations"),
    orderBy("boatCount", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Destination[];
}

export async function searchDestinations(searchTerm: string): Promise<Destination[]> {
  const q = query(
    collection(db, "destinations"),
    orderBy("name"),
    limit(10)
  );
  const snapshot = await getDocs(q);
  const all = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Destination[];

  return all.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// --- Reviews ---
export async function getTopReviews(count = 6): Promise<Review[]> {
  const q = query(
    collection(db, "reviews"),
    orderBy("rating", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Review[];
}

// --- Articles ---
export async function getLatestArticles(count = 3): Promise<Article[]> {
  const q = query(
    collection(db, "articles"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
  })) as Article[];
}

// --- Favorites ---
export async function addFavorite(userId: string, boatId: string, boatData: Record<string, any>): Promise<void> {
  const favRef = doc(db, "users", userId, "favorites", boatId);
  await setDoc(favRef, {
    boatId,
    title: boatData.title || "",
    image: boatData.image || "",
    location: boatData.location || "",
    price: boatData.price || 0,
    priceUnit: boatData.priceUnit || "/ day",
    type: boatData.type || "",
    rating: boatData.rating || 0,
    reviewCount: boatData.reviewCount || 0,
    addedAt: serverTimestamp(),
  });
}

export async function removeFavorite(userId: string, boatId: string): Promise<void> {
  const favRef = doc(db, "users", userId, "favorites", boatId);
  await deleteDoc(favRef);
}

export async function isBoatFavorited(userId: string, boatId: string): Promise<boolean> {
  const favRef = doc(db, "users", userId, "favorites", boatId);
  const snap = await getDoc(favRef);
  return snap.exists();
}

export async function getUserFavorites(userId: string): Promise<any[]> {
  const q = query(
    collection(db, "users", userId, "favorites"),
    orderBy("addedAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    addedAt: d.data().addedAt?.toDate(),
  }));
}

// --- Newsletter ---
export async function subscribeNewsletter(email: string): Promise<void> {
  await addDoc(collection(db, "subscribers"), {
    email,
    createdAt: serverTimestamp(),
  });
}

// --- Boat Listings ---
export async function uploadBoatPhotos(docId: string, files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const storageRef = ref(storage, `boats/${docId}/${Date.now()}-${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push(url);
  }
  return urls;
}

export async function createBoatListing(
  data: Omit<BoatListing, "images" | "createdAt" | "updatedAt">,
  files: File[],
  ownerId?: string
): Promise<string> {
  const docRef = doc(collection(db, "boats"));
  const imageUrls = files.length > 0 ? await uploadBoatPhotos(docRef.id, files) : [];
  await setDoc(docRef, {
    ...data,
    ...(ownerId ? { ownerId } : {}),
    images: imageUrls,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBoatListing(
  boatId: string,
  data: Partial<Omit<BoatListing, "images" | "createdAt" | "updatedAt">>,
  newFiles: File[],
  existingImageUrls: string[]
): Promise<void> {
  const docRef = doc(db, "boats", boatId);
  const newImageUrls = newFiles.length > 0 ? await uploadBoatPhotos(boatId, newFiles) : [];
  const allImages = [...existingImageUrls, ...newImageUrls];
  await updateDoc(docRef, {
    ...data,
    images: allImages,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBoatListing(boatId: string): Promise<void> {
  const docRef = doc(db, "boats", boatId);
  await deleteDoc(docRef);
}

// --- Wizard draft/section helpers ---

export async function createEmptyDraft(ownerId: string): Promise<string> {
  const docRef = doc(collection(db, "boats"));
  await setDoc(docRef, {
    ownerId,
    status: "draft",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateBoatSection(
  boatId: string,
  sectionData: Record<string, any>
): Promise<void> {
  const docRef = doc(db, "boats", boatId);
  await updateDoc(docRef, {
    ...sectionData,
    updatedAt: serverTimestamp(),
  });
}

export async function uploadBoatDocument(
  boatId: string,
  file: File,
  docType: string
): Promise<string> {
  const storageRef = ref(storage, `boats/${boatId}/documents/${docType}-${Date.now()}-${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getBoatListing(boatId: string): Promise<any | null> {
  const docRef = doc(db, "boats", boatId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// --- Admin functions ---

export async function isUserAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() && snap.data()?.type === "admin";
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    uid: d.id,
    ...d.data(),
  })) as UserProfile[];
}

export async function getAllListings(): Promise<(BoatListing & { id: string })[]> {
  const q = query(collection(db, "boats"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (BoatListing & { id: string })[];
}

export async function getListingsByStatus(status: string): Promise<(BoatListing & { id: string })[]> {
  const q = query(
    collection(db, "boats"),
    where("status", "==", status),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (BoatListing & { id: string })[];
}

export async function updateListingStatus(boatId: string, status: string): Promise<void> {
  await updateDoc(doc(db, "boats", boatId), { status, updatedAt: serverTimestamp() });
}

export async function updateUserType(uid: string, type: "user" | "admin"): Promise<void> {
  await updateDoc(doc(db, "users", uid), { type });
}

export async function adminDeleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}

// --- Orders ---

export async function createOrder(orderData: {
  boatId: string;
  boatTitle: string;
  boatImage?: string;
  renterId: string;
  renterName: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserOrders(userId: string): Promise<any[]> {
  const q = query(
    collection(db, "orders"),
    where("renterId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
  }));
}

export async function getOwnerOrders(ownerId: string): Promise<any[]> {
  const q = query(
    collection(db, "orders"),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
  }));
}

export async function getAllOrders(): Promise<any[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
  }));
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
}

export async function cancelOrder(orderId: string): Promise<void> {
  await updateOrderStatus(orderId, "cancelled");
}

// --- Reviews (boat-specific) ---

export async function getBoatReviews(boatId: string): Promise<any[]> {
  const q = query(
    collection(db, "reviews"),
    where("boatId", "==", boatId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
    createdAt: d.data().createdAt?.toDate?.() || null,
  }));
}

export async function createReview(reviewData: {
  boatId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, "reviews"), {
    ...reviewData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function hasUserReviewedBoat(userId: string, boatId: string): Promise<boolean> {
  const q = query(
    collection(db, "reviews"),
    where("boatId", "==", boatId),
    where("userId", "==", userId),
    limit(1)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

// --- Booking notification ---

export async function sendBookingNotification(
  renterId: string,
  renterName: string,
  ownerId: string,
  boatId: string,
  boatTitle: string,
  startDate: string,
  endDate: string
): Promise<void> {
  // Find existing conversation between renter and owner for this boat, or create one
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", renterId)
  );
  const snapshot = await getDocs(q);
  let conversationId: string | null = null;

  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.participants?.includes(ownerId)) {
      conversationId = d.id;
      break;
    }
  }

  const messageText = `Hi! I've just booked "${boatTitle}" from ${startDate} to ${endDate}. Looking forward to the trip!`;

  if (!conversationId) {
    // Create new conversation
    const renterDoc = await getDoc(doc(db, "users", renterId));
    const ownerDoc = await getDoc(doc(db, "users", ownerId));
    const renterData = renterDoc.data() || {};
    const ownerData = ownerDoc.data() || {};

    const convRef = await addDoc(collection(db, "conversations"), {
      participants: [renterId, ownerId],
      participantDetails: {
        [renterId]: {
          displayName: renterData.displayName || renterName,
          photoURL: renterData.photoURL || null,
          firstName: renterData.firstName || "",
          lastName: renterData.lastName || "",
        },
        [ownerId]: {
          displayName: ownerData.displayName || "Owner",
          photoURL: ownerData.photoURL || null,
          firstName: ownerData.firstName || "",
          lastName: ownerData.lastName || "",
        },
      },
      lastMessage: {
        text: messageText,
        senderId: renterId,
        timestamp: serverTimestamp(),
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      boatId,
      boatTitle,
      unreadCount: { [ownerId]: 1, [renterId]: 0 },
    });
    conversationId = convRef.id;
  } else {
    // Update existing conversation
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessage: {
        text: messageText,
        senderId: renterId,
        timestamp: serverTimestamp(),
      },
      updatedAt: serverTimestamp(),
    });
  }

  // Add message to conversation
  await addDoc(collection(db, "conversations", conversationId, "messages"), {
    text: messageText,
    senderId: renterId,
    senderName: renterName,
    timestamp: serverTimestamp(),
    readBy: [renterId],
  });
}
