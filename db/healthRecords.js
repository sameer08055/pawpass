import { ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "healthRecords";

async function collection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

function recordFields(record) {
  return {
    petId: record.petId,
    type: record.type,
    title: record.title.trim(),
    date: record.date,
    notes: record.notes || "",
    completed: record.type === "appointment" && record.completed === true,
  };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchHealthRecords({ ownerId, petId, type, q, page, limit }) {
  const col = await collection();
  const filter = { ownerId };
  if (petId) filter.petId = petId;
  if (type) filter.type = type;
  if (q) {
    const pattern = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ title: pattern }, { notes: pattern }];
  }

  const items = await col
    .find(filter)
    .sort({ date: -1, _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();
  const total = await col.countDocuments(filter);
  return { items, total, page, limit };
}

export async function getUpcomingAppointments(ownerId) {
  const col = await collection();
  return col
    .find({ ownerId, type: "appointment", completed: { $ne: true } })
    .sort({ date: 1 })
    .limit(10)
    .toArray();
}

export async function createHealthRecord(record) {
  const col = await collection();
  const doc = {
    ownerId: record.ownerId,
    ...recordFields(record),
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updateHealthRecord(id, updates) {
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: recordFields(updates) },
    { returnDocument: "after" },
  );
}

export async function deleteHealthRecord(id) {
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function deleteHealthRecordsByPetId(petId) {
  const col = await collection();
  await col.deleteMany({ petId });
}
