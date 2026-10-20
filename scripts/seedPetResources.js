import { getDb, closeDb } from "../db/connection.js";

// Scoped to California via OSM's own administrative boundary (ISO 3166-2
// code), rather than a hand-drawn bounding box this comfortably returns
// well over 1,000 combined records. Swap "US-CA" for another state's code
// if a different region is preferred.
const OVERPASS_QUERY = `
[out:json][timeout:180];
area["ISO3166-2"="US-CA"]->.searchArea;
(
  node["amenity"="veterinary"](area.searchArea);
  way["amenity"="veterinary"](area.searchArea);
  node["shop"="pet"](area.searchArea);
  way["shop"="pet"](area.searchArea);
  node["leisure"="dog_park"](area.searchArea);
);
out center tags;
`;

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const BATCH_SIZE = 500;

function classify(tags) {
  if (tags.amenity === "veterinary") return "vet";
  if (tags.shop === "pet") return "pet_store";
  if (tags.leisure === "dog_park") return "dog_park";
  return "other";
}

function toDocument(element) {
  const tags = element.tags || {};
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (lat === undefined || lon === undefined) return null;

  return {
    osmId: `${element.type}/${element.id}`,
    category: classify(tags),
    name: tags.name || "Unnamed",
    lat,
    lon,
    address: [tags["addr:housenumber"], tags["addr:street"], tags["addr:city"]]
      .filter(Boolean)
      .join(" "),
    phone: tags.phone || tags["contact:phone"] || null,
    source: "OpenStreetMap",
    fetchedAt: new Date(),
  };
}

async function fetchOverpassData() {
  console.log(
    "Querying Overpass API — this can take a minute or two for a state-sized region...",
  );

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      // Overpass's servers reject requests without a descriptive User-Agent
      // as a basic anti-bot measure — same requirement as Nominatim.
      "User-Agent":
        "PawPass-ClassProject/1.0 (Northeastern University Web Dev course project)",
    },
    body: OVERPASS_QUERY,
  });

  if (!res.ok) {
    throw new Error(`Overpass API responded with ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  console.log(`Received ${data.elements.length} raw elements from OpenStreetMap.`);
  return data.elements;
}

async function seed() {
  const elements = await fetchOverpassData();
  const documents = elements.map(toDocument).filter(Boolean);

  console.log(`Prepared ${documents.length} documents to insert.`);
  if (documents.length < 1000) {
    console.warn(
      "Fewer than 1,000 documents were prepared — consider widening the region " +
        "(e.g. a larger state, or multiple states) if this needs to clear that threshold.",
    );
  }

  const db = await getDb();
  const collection = db.collection("petResources");

  await collection.deleteMany({ source: "OpenStreetMap" });

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    await collection.insertMany(batch);
    console.log(
      `Inserted ${Math.min(i + BATCH_SIZE, documents.length)} / ${documents.length}`,
    );
  }

  console.log("Done. petResources collection seeded.");
  await closeDb();
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
