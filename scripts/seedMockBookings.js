import { readFileSync } from "fs";
import { getDb, closeDb } from "../db/connection.js";

const CURRENT_SITTER_ID = "sam-demo";
const RAW_DATA_PATH = new URL("./mockBookings.json", import.meta.url);

function parseDate(str) {
  // Mockaroo exports as "M/D/YYYY"
  return new Date(str);
}

function fixDateRange(startStr, endStr) {
  let start = parseDate(startStr);
  let end = parseDate(endStr);

  if (end < start) {
    [start, end] = [end, start];
  }
  if (start.getTime() === end.getTime()) {
    end = new Date(start.getTime() + 2 * 24 * 60 * 60 * 1000); // +2 days
  }
  return { start, end };
}

// Mockaroo's "Sentences" field type generates generic Latin filler text by
// default — these are realistic sitting notes used in its place instead.
const REALISTIC_NOTES = [
  "Needs a walk twice a day, morning and evening.",
  "Please leave treats on the counter for them.",
  "A bit shy with new people at first — give them space.",
  "Loves belly rubs once they warm up to you.",
  "Feeding instructions are on the fridge.",
  "Please lock the back gate when going outside.",
  "They're on a special diet, no table scraps please.",
  "Very food-motivated, great for training reminders.",
  "",
  "",
  "",
];

function pickRealisticNotes() {
  return REALISTIC_NOTES[Math.floor(Math.random() * REALISTIC_NOTES.length)];
}

function computeStatus(start, end, today) {
  if (end < today) {
    // a handful of past sits get marked cancelled instead of completed,
    // just so the status column isn't 100% one value for every past row
    return Math.random() < 0.15 ? "cancelled" : "completed";
  }

  const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  if (start <= twoWeeksFromNow) {
    return "confirmed";
  }

  return "requested";
}

async function seed() {
  const raw = JSON.parse(readFileSync(RAW_DATA_PATH, "utf-8"));
  const today = new Date();

  const documents = raw.map((row) => {
    const { start, end } = fixDateRange(row.startDate, row.endDate);
    const status = computeStatus(start, end, today);

    return {
      sitterId: CURRENT_SITTER_ID,
      petName: row.petName,
      ownerContact: row.ownerContact || "",
      quickFactsLink: "",
      dateRange: {
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
      },
      status,
      notes: pickRealisticNotes(),
      createdAt: new Date(),
    };
  });

  console.log(`Prepared ${documents.length} mock bookings for sitterId "${CURRENT_SITTER_ID}".`);

  const db = await getDb();
  const collection = db.collection("bookings");

  // clear out any previously seeded mock data for this sitter before re-inserting,
  // so this script is safe to run more than once
  const deleted = await collection.deleteMany({ sitterId: CURRENT_SITTER_ID });
  console.log(`Removed ${deleted.deletedCount} existing bookings for this sitter.`);

  const result = await collection.insertMany(documents);
  console.log(`Inserted ${result.insertedCount} mock bookings.`);

  const statusCounts = documents.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  console.log("Status breakdown:", statusCounts);

  await closeDb();
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});