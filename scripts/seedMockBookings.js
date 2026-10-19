// scripts/seedMockBookings.js
//
// Imports demo booking data generated with Mockaroo (scripts/mockBookings.json)
// into the bookings collection. Mockaroo generated startDate/endDate as two
// independently random fields, so this script:
//   1. Fixes any row where endDate ended up before startDate (swaps them),
//      and nudges endDate forward a couple of days if they landed on the
//      same date.
//   2. Computes a realistic status based on where each date falls relative
//      to today, rather than trusting a random status value — a sit that
//      already happened should say "completed", not "requested".
//
// Run once with: node --env-file=.env scripts/seedMockBookings.js
//
// IMPORTANT: CURRENT_SITTER_ID below must match public/js/config.js exactly,
// since that's how the frontend looks up "my" bookings.

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
      notes: row.notes || "",
      createdAt: new Date(),
    };
  });

  console.log(
    `Prepared ${documents.length} mock bookings for sitterId "${CURRENT_SITTER_ID}".`,
  );

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
