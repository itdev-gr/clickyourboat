import { supabase } from "./supabase";
import type { Boat, BoatListing, Destination, Review, Article, SearchParams, UserProfile, Order } from "../types";

// --- Boats ---
export async function searchBoats(
  params: SearchParams,
  maxResults = 20,
  lastCreatedAt?: string | null
): Promise<{ boats: Boat[]; lastCreatedAt: string | null }> {
  let q = supabase
    .from("boats")
    .select("*")
    .eq("status", "published");

  if (params.type) q = q.eq("boat_type", params.type);
  if (params.skipper) q = q.eq("skipper_available", true);
  if (params.location) q = q.eq("city", params.location);

  q = q.order("created_at", { ascending: false });
  if (lastCreatedAt) q = q.lt("created_at", lastCreatedAt);
  q = q.limit(maxResults);

  const { data, error } = await q;
  if (error) throw error;

  const boats = (data || []).map(mapBoatRow);
  const last = boats.length > 0 ? data![data!.length - 1].created_at : null;

  return { boats, lastCreatedAt: last };
}

export async function getFeaturedBoats(count = 6): Promise<Boat[]> {
  const { data, error } = await supabase
    .from("boats")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(count);
  if (error) throw error;
  return (data || []).map(mapBoatRow);
}

export async function getOwnerBoats(ownerId: string, maxResults = 20, statusFilter?: string): Promise<Boat[]> {
  let q = supabase
    .from("boats")
    .select("*")
    .eq("owner_id", ownerId);

  if (statusFilter) q = q.eq("status", statusFilter);
  q = q.order("created_at", { ascending: false }).limit(maxResults);

  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapBoatRow);
}

// --- Destinations ---
export async function getTopDestinations(count = 8): Promise<Destination[]> {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("boat_count", { ascending: false })
    .limit(count);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    image: d.image,
    description: d.description,
    boatCount: d.boat_count,
  }));
}

export async function searchDestinations(searchTerm: string): Promise<Destination[]> {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .order("name")
    .limit(10);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    image: d.image,
    description: d.description,
    boatCount: d.boat_count,
  }));
}

// --- Reviews ---
export async function getTopReviews(count = 6): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("rating", { ascending: false })
    .limit(count);
  if (error) throw error;
  return (data || []).map(mapReviewRow);
}

// --- Articles ---
export async function getLatestArticles(count = 3): Promise<Article[]> {
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(count);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    image: d.image,
    summary: d.summary,
    content: d.content,
    createdAt: d.created_at ? new Date(d.created_at) : new Date(),
  }));
}

// --- Favorites ---
export async function addFavorite(userId: string, boatId: string, boatData: Record<string, any>): Promise<void> {
  const { error } = await supabase.from("favorites").upsert({
    user_id: userId,
    boat_id: boatId,
    title: boatData.title || "",
    image: boatData.image || "",
    location: boatData.location || "",
    price: boatData.price || 0,
    price_unit: boatData.priceUnit || "/ day",
    type: boatData.type || "",
    rating: boatData.rating || 0,
    review_count: boatData.reviewCount || 0,
    added_at: new Date().toISOString(),
  }, { onConflict: "user_id,boat_id" });
  if (error) throw error;
}

export async function removeFavorite(userId: string, boatId: string): Promise<void> {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("boat_id", boatId);
  if (error) throw error;
}

export async function isBoatFavorited(userId: string, boatId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("boat_id", boatId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function getUserFavorites(userId: string): Promise<Record<string, any>[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((d: any) => ({
    id: d.boat_id,
    boatId: d.boat_id,
    title: d.title,
    image: d.image,
    location: d.location,
    price: d.price,
    priceUnit: d.price_unit,
    type: d.type,
    rating: d.rating,
    reviewCount: d.review_count,
    addedAt: d.added_at ? new Date(d.added_at) : new Date(),
  }));
}

// --- Newsletter ---
export async function subscribeNewsletter(email: string): Promise<void> {
  const { error } = await supabase.from("subscribers").insert({
    email,
    created_at: new Date().toISOString(),
  });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

// --- Boat Listings ---
export async function uploadBoatPhotos(docId: string, files: File[], ownerId?: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File "${file.name}" exceeds 10MB limit.`);
    }
    const basePath = ownerId ? `${ownerId}/${docId}` : docId;
    const safeName = file.name.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_");
    const filePath = `${basePath}/${Date.now()}-${safeName}`;
    try {
      const { error } = await supabase.storage
        .from("boat-assets")
        .upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage
        .from("boat-assets")
        .getPublicUrl(filePath);
      urls.push(urlData.publicUrl);
    } catch (err) {
      console.error(`Failed to upload "${file.name}":`, err);
    }
  }
  return urls;
}

export async function createBoatListing(
  data: Omit<BoatListing, "images" | "createdAt" | "updatedAt">,
  files: File[],
  ownerId?: string
): Promise<string> {
  if (!ownerId) throw new Error("ownerId is required");
  if (data.pricePerDay !== undefined && data.pricePerDay < 0) throw new Error("Price cannot be negative");

  // First create the row to get the ID
  const { data: inserted, error } = await supabase
    .from("boats")
    .insert({
      owner_id: ownerId,
      status: data.status || "draft",
      ...mapBoatToRow(data),
      images: [],
    })
    .select("id")
    .single();
  if (error) throw error;

  const boatId = inserted.id;

  // Upload files if any
  if (files.length > 0) {
    const imageUrls = await uploadBoatPhotos(boatId, files, ownerId);
    await supabase.from("boats").update({ images: imageUrls }).eq("id", boatId);
  }

  return boatId;
}

export async function updateBoatListing(
  boatId: string,
  data: Partial<Omit<BoatListing, "images" | "createdAt" | "updatedAt">>,
  newFiles: File[],
  existingImageUrls: string[],
  ownerId?: string
): Promise<void> {
  const newImageUrls = newFiles.length > 0 ? await uploadBoatPhotos(boatId, newFiles, ownerId) : [];
  const allImages = [...existingImageUrls, ...newImageUrls];
  const { error } = await supabase
    .from("boats")
    .update({ ...mapBoatToRow(data), images: allImages })
    .eq("id", boatId);
  if (error) throw error;
}

export async function deleteBoatListing(boatId: string): Promise<void> {
  const { error } = await supabase.from("boats").delete().eq("id", boatId);
  if (error) throw error;
}

// --- Wizard draft/section helpers ---

export async function createEmptyDraft(ownerId: string): Promise<string> {
  const { data, error } = await supabase
    .from("boats")
    .insert({ owner_id: ownerId, status: "draft" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateBoatSection(
  boatId: string,
  sectionData: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from("boats")
    .update(mapBoatToRow(sectionData))
    .eq("id", boatId);
  if (error) throw error;
}

export async function uploadBoatDocument(
  boatId: string,
  file: File,
  docType: string,
  ownerId?: string
): Promise<string> {
  const basePath = ownerId ? `${ownerId}/${boatId}` : boatId;
  const safeName = file.name.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_");
  const filePath = `${basePath}/documents/${docType}-${Date.now()}-${safeName}`;
  const { error } = await supabase.storage
    .from("boat-assets")
    .upload(filePath, file);
  if (error) throw error;
  const { data } = supabase.storage.from("boat-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function getBoatListing(boatId: string): Promise<(BoatListing & { id: string }) | null> {
  const { data, error } = await supabase
    .from("boats")
    .select("*")
    .eq("id", boatId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapRowToBoatListing(data);
}

// --- Admin functions ---

export async function isUserAdmin(uid: string): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", uid)
    .maybeSingle();
  return data?.user_type === "admin";
}

export async function getAllUsers(maxResults = 500): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(maxResults);
  if (error) throw error;
  return (data || []).map((d: any) => ({
    uid: d.id,
    email: d.email,
    displayName: d.display_name,
    firstName: d.first_name,
    lastName: d.last_name,
    photoURL: d.photo_url,
    type: d.user_type,
    createdAt: d.created_at ? new Date(d.created_at) : new Date(),
    lastLoginAt: d.last_login_at ? new Date(d.last_login_at) : new Date(),
  })) as UserProfile[];
}

export async function getAllListings(maxResults = 500): Promise<(BoatListing & { id: string })[]> {
  const { data, error } = await supabase
    .from("boats")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(maxResults);
  if (error) throw error;
  return (data || []).map(mapRowToBoatListing);
}

export async function getListingsByStatus(status: string): Promise<(BoatListing & { id: string })[]> {
  const { data, error } = await supabase
    .from("boats")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRowToBoatListing);
}

export async function updateListingStatus(boatId: string, status: string): Promise<void> {
  const { error } = await supabase.from("boats").update({ status }).eq("id", boatId);
  if (error) throw error;
}

export async function updateUserType(uid: string, type: "user" | "owner" | "admin"): Promise<void> {
  const { error } = await supabase.from("profiles").update({ user_type: type }).eq("id", uid);
  if (error) throw error;
}

export async function promoteToOwnerIfNeeded(boatId: string): Promise<void> {
  const { data: boat } = await supabase.from("boats").select("owner_id").eq("id", boatId).maybeSingle();
  if (!boat?.owner_id) return;
  const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", boat.owner_id).maybeSingle();
  if (profile?.user_type === "user") {
    await supabase.from("profiles").update({ user_type: "owner" }).eq("id", boat.owner_id);
  }
}

export async function adminDeleteUser(uid: string): Promise<void> {
  const { error } = await supabase.from("profiles").delete().eq("id", uid);
  if (error) throw error;
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
  if (!orderData.boatId || !orderData.renterId || !orderData.ownerId) {
    throw new Error("Missing required order fields");
  }
  if (orderData.totalPrice <= 0) {
    throw new Error("Total price must be positive");
  }
  if (!orderData.startDate || !orderData.endDate) {
    throw new Error("Missing date fields");
  }

  const { data, error } = await supabase
    .from("orders")
    .insert({
      boat_id: orderData.boatId,
      boat_title: orderData.boatTitle,
      boat_image: orderData.boatImage || null,
      renter_id: orderData.renterId,
      renter_name: orderData.renterName,
      owner_id: orderData.ownerId,
      start_date: orderData.startDate,
      end_date: orderData.endDate,
      total_price: orderData.totalPrice,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("renter_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrderRow);
}

export async function getOwnerOrders(ownerId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapOrderRow);
}

export async function getAllOrders(maxResults = 500): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(maxResults);
  if (error) throw error;
  return (data || []).map(mapOrderRow);
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", orderId);
  if (error) throw error;
}

export async function cancelOrder(orderId: string): Promise<void> {
  await updateOrderStatus(orderId, "cancelled");
}

// --- Charges / Platform Settings ---

export interface ChargeSettings {
  commissionPercent: number;
  serviceFee: number;
  platformFeePercent: number;
}

export async function getChargeSettings(): Promise<ChargeSettings> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "charges")
    .maybeSingle();
  if (data?.value) {
    const v = data.value as any;
    return {
      commissionPercent: v.commissionPercent ?? 0,
      serviceFee: v.serviceFee ?? 0,
      platformFeePercent: v.platformFeePercent ?? 0,
    };
  }
  return { commissionPercent: 0, serviceFee: 0, platformFeePercent: 0 };
}

export async function saveChargeSettings(settings: ChargeSettings): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "charges", value: settings, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// --- Reviews (boat-specific) ---

export async function getBoatReviews(boatId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("boat_id", boatId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapReviewRow);
}

export async function createReview(reviewData: {
  boatId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      boat_id: reviewData.boatId,
      user_id: reviewData.userId,
      user_name: reviewData.userName,
      rating: reviewData.rating,
      comment: reviewData.comment,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function hasUserReviewedBoat(userId: string, boatId: string): Promise<boolean> {
  const { data } = await supabase
    .from("reviews")
    .select("id")
    .eq("boat_id", boatId)
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  return !!data;
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
  // Find existing conversation between renter and owner
  const { data: convs } = await supabase
    .from("conversations")
    .select("*")
    .contains("participants", [renterId]);

  let conversationId: string | null = null;
  if (convs) {
    for (const c of convs) {
      if ((c.participants as string[])?.includes(ownerId)) {
        conversationId = c.id;
        break;
      }
    }
  }

  const messageText = `Hi! I've just booked "${boatTitle}" from ${startDate} to ${endDate}. Looking forward to the trip!`;
  const now = new Date().toISOString();

  if (!conversationId) {
    // Get participant details from profiles
    const { data: renterProfile } = await supabase
      .from("profiles")
      .select("display_name, photo_url, first_name, last_name")
      .eq("id", renterId)
      .maybeSingle();
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("display_name, photo_url, first_name, last_name")
      .eq("id", ownerId)
      .maybeSingle();

    const { data: newConv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        participants: [renterId, ownerId],
        participant_details: {
          [renterId]: {
            displayName: renterProfile?.display_name || renterName,
            photoURL: renterProfile?.photo_url || null,
            firstName: renterProfile?.first_name || "",
            lastName: renterProfile?.last_name || "",
          },
          [ownerId]: {
            displayName: ownerProfile?.display_name || "Owner",
            photoURL: ownerProfile?.photo_url || null,
            firstName: ownerProfile?.first_name || "",
            lastName: ownerProfile?.last_name || "",
          },
        },
        last_message: { text: messageText, senderId: renterId, timestamp: now },
        boat_id: boatId,
        boat_title: boatTitle,
        unread_count: { [ownerId]: 1, [renterId]: 0 },
      })
      .select("id")
      .single();
    if (convErr) throw convErr;
    conversationId = newConv.id;
  } else {
    await supabase
      .from("conversations")
      .update({
        last_message: { text: messageText, senderId: renterId, timestamp: now },
        updated_at: now,
      })
      .eq("id", conversationId);
  }

  // Add message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    text: messageText,
    sender_id: renterId,
    sender_name: renterName,
    read_by: [renterId],
  });
}

// ═══ Row mapping helpers ═══

/** Map a Supabase boat row to the frontend Boat type */
function mapBoatRow(row: any): Boat {
  return {
    id: row.id,
    title: row.listing_title || row.boat_name || row.title || "",
    description: row.description || "",
    location: row.location || { city: row.city || "", country: "Greece", lat: 0, lng: 0 },
    pricePerDay: row.price_per_day || row.price || 0,
    type: row.boat_type || row.type || "motor",
    skipperAvailable: row.skipper_available || false,
    rating: row.rating || 0,
    reviewCount: row.review_count || 0,
    images: row.images || [],
    ownerId: row.owner_id,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    // Pass through all extra fields for boat-detail/listing pages
    ...mapRowToBoatListingFields(row),
  };
}

/** Map a Supabase row to BoatListing & { id } */
function mapRowToBoatListing(row: any): BoatListing & { id: string } {
  return {
    id: row.id,
    ...mapRowToBoatListingFields(row),
  } as BoatListing & { id: string };
}

/** Map Supabase snake_case columns to camelCase BoatListing fields */
function mapRowToBoatListingFields(row: any): Partial<BoatListing> {
  return {
    boatType: row.boat_type,
    city: row.city,
    harbour: row.harbour,
    professional: row.professional,
    manufacturer: row.manufacturer,
    model: row.model,
    skipper: row.skipper,
    capacity: row.capacity,
    length: row.length,
    width: row.width,
    draft: row.draft,
    company: row.company,
    website: row.website,
    images: row.images || [],
    ownerId: row.owner_id,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    status: row.status,
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    boatName: row.boat_name,
    languages: row.languages,
    listingTitle: row.listing_title,
    description: row.description,
    listingTitle_el: row.listing_title_el,
    description_el: row.description_el,
    boatPlanImages: row.boat_plan_images,
    pricePerDay: row.price_per_day,
    currency: row.currency,
    pricePeriods: row.price_periods,
    reservationMinDays: row.reservation_min_days,
    reservationMaxDays: row.reservation_max_days,
    bookingMode: row.booking_mode,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    checkInTimeDayRental: row.check_in_time_day_rental,
    checkOutTimeDayRental: row.check_out_time_day_rental,
    downpaymentPercentage: row.downpayment_percentage,
    daysBeforeBalancePayment: row.days_before_balance_payment,
    fuelCost: row.fuel_cost,
    licenceRequired: row.licence_required,
    securityDeposit: row.security_deposit,
    insuranceCertificateUrl: row.insurance_certificate_url,
    ownershipCertificateUrl: row.ownership_certificate_url,
    yachtInsured: row.yacht_insured,
    unavailabilityPeriods: row.unavailability_periods,
    equipment: row.equipment,
    extras: row.extras,
    discounts: row.discounts,
    completedSections: row.completed_sections,
    engineType: row.engine_type,
    horsepower: row.horsepower,
    speed: row.speed,
    fuel: row.fuel,
    cabins: row.cabins,
    berths: row.berths,
    bathrooms: row.bathrooms,
    yearOfConstruction: row.year_of_construction,
    renovated: row.renovated,
    crewMembers: row.crew_members,
    tenderHorsepower: row.tender_horsepower,
    equippedOffshore: row.equipped_offshore,
  };
}

/** Map camelCase BoatListing fields to snake_case Supabase columns */
function mapBoatToRow(data: Record<string, any>): Record<string, any> {
  const map: Record<string, string> = {
    boatType: "boat_type", boatName: "boat_name",
    listingTitle: "listing_title", listingTitle_el: "listing_title_el",
    description_el: "description_el",
    boatPlanImages: "boat_plan_images",
    pricePerDay: "price_per_day", pricePeriods: "price_periods",
    reservationMinDays: "reservation_min_days", reservationMaxDays: "reservation_max_days",
    bookingMode: "booking_mode",
    checkInTime: "check_in_time", checkOutTime: "check_out_time",
    checkInTimeDayRental: "check_in_time_day_rental", checkOutTimeDayRental: "check_out_time_day_rental",
    downpaymentPercentage: "downpayment_percentage", daysBeforeBalancePayment: "days_before_balance_payment",
    fuelCost: "fuel_cost", licenceRequired: "licence_required",
    securityDeposit: "security_deposit",
    insuranceCertificateUrl: "insurance_certificate_url",
    ownershipCertificateUrl: "ownership_certificate_url",
    yachtInsured: "yacht_insured",
    unavailabilityPeriods: "unavailability_periods",
    completedSections: "completed_sections",
    engineType: "engine_type", yearOfConstruction: "year_of_construction",
    crewMembers: "crew_members", tenderHorsepower: "tender_horsepower",
    equippedOffshore: "equipped_offshore",
    skipperAvailable: "skipper_available",
    reviewCount: "review_count",
  };

  const row: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    const col = map[key] || key;
    // Skip fields that shouldn't be written directly
    if (["id", "createdAt", "updatedAt", "ownerId"].includes(key)) continue;
    row[col] = value;
  }
  return row;
}

function mapOrderRow(row: any): Order {
  return {
    id: row.id,
    boatId: row.boat_id,
    boatTitle: row.boat_title,
    renterId: row.renter_id,
    renterName: row.renter_name,
    ownerId: row.owner_id,
    startDate: row.start_date,
    endDate: row.end_date,
    totalPrice: row.total_price,
    status: row.status,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}

function mapReviewRow(row: any): Review {
  return {
    id: row.id,
    boatId: row.boat_id,
    userId: row.user_id,
    userName: row.user_name,
    rating: row.rating,
    comment: row.comment,
    boatName: row.boat_name,
    location: row.location,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
  };
}
