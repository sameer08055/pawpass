import { randomUUID } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "./connection.js";

const COLLECTION = "pets";

async function collection() {
  const db = await getDb();
  return db.collection(COLLECTION);
}

function petFields(pet) {
  return {
    name: pet.name.trim(),
    species: pet.species,
    breed: pet.breed || "",
    feeding: pet.feeding || "",
    allergies: pet.allergies || "",
    medications: pet.medications || "",
    vetName: pet.vetName || "",
    vetPhone: pet.vetPhone || "",
    notes: pet.notes || "",
  };
}

export async function getPetsByOwnerId(ownerId) {
  const col = await collection();
  return col.find({ ownerId }).sort({ name: 1 }).toArray();
}

export async function getPetById(id) {
  const col = await collection();
  return col.findOne({ _id: new ObjectId(id) });
}

export async function createPet(pet) {
  const col = await collection();
  const doc = {
    ownerId: pet.ownerId,
    ...petFields(pet),
    shareToken: null,
    createdAt: new Date(),
  };
  const result = await col.insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updatePet(id, updates) {
  const col = await collection();
  return col.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: petFields(updates) },
    { returnDocument: "after" },
  );
}

export async function deletePet(id) {
  const col = await collection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}

export async function createShareToken(id) {
  const col = await collection();
  const pet = await col.findOne({ _id: new ObjectId(id) });
  if (!pet) return null;
  if (pet.shareToken) return pet.shareToken;
  const token = randomUUID();
  await col.updateOne({ _id: pet._id }, { $set: { shareToken: token } });
  return token;
}

export async function clearShareToken(id) {
  const col = await collection();
  const result = await col.updateOne(
    { _id: new ObjectId(id) },
    { $set: { shareToken: null } },
  );
  return result.matchedCount > 0;
}

export async function getPetByShareToken(token) {
  const col = await collection();
  return col.findOne(
    { shareToken: token },
    {
      projection: {
        _id: 0,
        name: 1,
        species: 1,
        breed: 1,
        feeding: 1,
        allergies: 1,
        medications: 1,
        vetName: 1,
        vetPhone: 1,
        notes: 1,
      },
    },
  );
}
