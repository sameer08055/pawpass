// { _id, sitterId, petName, ownerContact, quickFactsLink,
//   dateRange: { start, end },     // ISO date strings
//   status,                        // "requested" | "confirmed" | "completed" | "cancelled"
//   notes, createdAt }

// Note: petName, ownerContact, and quickFactsLink are plain fields filled in
// by whoever creates the booking — this collection never reads from the
// pets/healthRecords collections directly, keeping the two sides independent.

import { ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "bookings";
const VALID_STATUSES = ["requested", "confirmed", "completed", "cancelled"];

async function collection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function getAllBookings() {
  const col = await collection();
  return col.find().sort({ "dateRange.start": 1 }).toArray();
}

export async function getBookingsBySitterId(sitterId) {
  const col = await collection();
  return col.find({ sitterId }).sort({ "dateRange.start": 1 }).toArray();
}

export async function getBookingById(id) {
  const col = await collection();
  return col.findOne({ _id: new ObjectId(id) });
}

export async function createBooking(booking) {
  const col = await collection();
  const doc = {
    sitterId: booking.sitterId,
    petName: booking.petName,
    ownerContact: booking.ownerContact || "",
    quickFactsLink: booking.quickFactsLink || "",
    dateRange: booking.dateRange,
    status: "requested",
    notes: booking.notes || "",
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updateBooking(id, updates) {
  const col = await collection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  return result;
}

export async function updateBookingStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(
      `Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(", ")}`,
    );
  }
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status } },
    { returnDocument: "after" },
  );
}

export async function deleteBooking(id) {
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
