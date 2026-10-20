import { ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "sitterProfiles";

async function collection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

export async function getAllSitterProfiles() {
  const col = await collection();
  return col.find().toArray();
}

export async function getSitterProfileById(id) {
  const col = await collection();
  return col.findOne({ _id: new ObjectId(id) });
}

export async function getSitterProfileBySitterId(sitterId) {
  const col = await collection();
  return col.findOne({ sitterId });
}

export async function createSitterProfile(profile) {
  const col = await collection();
  const doc = {
    sitterId: profile.sitterId,
    name: profile.name,
    bio: profile.bio || "",
    location: profile.location || "",
    pincode: profile.pincode || "",
    lat: profile.lat ?? null,
    lon: profile.lon ?? null,
    services: profile.services || [],
    availableDays: profile.availableDays || [],
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updateSitterProfile(id, updates) {
  const col = await collection();
  const result = await col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updates },
    { returnDocument: "after" },
  );
  return result;
}

export async function deleteSitterProfile(id) {
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

// --- service helpers (add/edit/remove one entry from the services array) ---

export async function addService(id, service) {
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $push: { services: service } },
    { returnDocument: "after" },
  );
}

export async function updateService(id, oldSpecies, newService) {
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id), "services.species": oldSpecies },
    { $set: { "services.$": newService } },
    { returnDocument: "after" },
  );
}

export async function removeService(id, species) {
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $pull: { services: { species } } },
    { returnDocument: "after" },
  );
}

// --- availability helpers ---

export async function setAvailableDays(id, availableDays) {
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { availableDays } },
    { returnDocument: "after" },
  );
}
