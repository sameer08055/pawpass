import { readFile } from "node:fs/promises";
import { getDb, closeDB } from "../db/connection.js";

const OWNER_ID = "priya-demo";
const DATA_FILE = new URL("../data/datarecords.json", import.meta.url);

function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function seed() {
  const { pets, healthRecords } = JSON.parse(await readFile(DATA_FILE, "utf8"));
  const db = await getDb();
  const petsCollection = db.collection("pets");
  const recordsCollection = db.collection("healthRecords");

  await recordsCollection.deleteMany({ ownerId: OWNER_ID });
  await petsCollection.deleteMany({ ownerId: OWNER_ID });

  const petDocs = pets.map((pet) => ({
    ownerId: OWNER_ID,
    ...pet,
    shareToken: null,
    createdAt: new Date(),
  }));
  const { insertedIds } = await petsCollection.insertMany(petDocs);

  const recordDocs = healthRecords.map((record) => ({
    ownerId: OWNER_ID,
    petId: String(insertedIds[record.petKey - 1]),
    type: record.type,
    title: record.title,
    date: dateFromToday(record.dayOffset),
    notes: record.notes,
    completed: record.completed,
    createdAt: new Date(),
  }));
  await recordsCollection.insertMany(recordDocs);

  console.log(`Seeded ${petDocs.length} pets and ${recordDocs.length} health records.`);
  await closeDB();
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
