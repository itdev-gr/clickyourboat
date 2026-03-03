import { db, storage } from "./firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  doc,
  setDoc,
  serverTimestamp,
  type WhereFilterOp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Boat, BoatListing, Destination, Review, Article, SearchParams } from "../types";

// --- Boats ---
export async function searchBoats(params: SearchParams, maxResults = 20): Promise<Boat[]> {
  const boatsRef = collection(db, "boats");
  const constraints: Parameters<typeof query>[1][] = [];

  if (params.type) {
    constraints.push(where("type", "==", params.type));
  }
  if (params.skipper) {
    constraints.push(where("skipperAvailable", "==", true));
  }
  if (params.location) {
    constraints.push(where("location.city", "==", params.location));
  }

  constraints.push(orderBy("rating", "desc"));
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
    orderBy("rating", "desc"),
    limit(count)
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
  data: Omit<BoatListing, "images" | "createdAt">,
  files: File[]
): Promise<string> {
  const docRef = doc(collection(db, "boats"));
  const imageUrls = files.length > 0 ? await uploadBoatPhotos(docRef.id, files) : [];
  await setDoc(docRef, {
    ...data,
    images: imageUrls,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
