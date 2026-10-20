import { readFileSync } from "fs";
import { getDb, closeDb } from "../db/connection.js";

const OWNER_ID = "priya-demo";
const RAW_DATA_PATH = new URL("./datarecords.json", import.meta.url);

const PETS = [
  {
    name: "Buddy",
    species: "Dog",
    breed: "Golden Retriever",
    feeding: "2 cups of dry kibble, morning and evening",
    allergies: "Chicken",
    medications: "Joint supplement daily",
    vetName: "Dr. Okafor",
    vetPhone: "617-555-0142",
    notes: "Pulls on the leash near squirrels",
  },
  {
    name: "Max",
    species: "Dog",
    breed: "German Shepherd",
    feeding: "2 cups of kibble, morning and evening",
    allergies: "None known",
    medications: "",
    vetName: "Dr. Ramos",
    vetPhone: "617-555-0119",
    notes: "Needs a slow introduction to visitors",
  },
  {
    name: "Bella",
    species: "Dog",
    breed: "Labrador",
    feeding: "1.5 cups of kibble twice a day",
    allergies: "Grain",
    medications: "",
    vetName: "Dr. Ramos",
    vetPhone: "617-555-0119",
    notes: "Eats too fast, use the slow feeder",
  },
  {
    name: "Charlie",
    species: "Cat",
    breed: "Tabby",
    feeding: "Half a can of wet food twice a day",
    allergies: "None known",
    medications: "",
    vetName: "Dr. Lindqvist",
    vetPhone: "617-555-0178",
    notes: "Indoor only, hides during thunderstorms",
  },
  {
    name: "Lucy",
    species: "Cat",
    breed: "Siamese",
    feeding: "Wet food in the morning, dry food at night",
    allergies: "Fish",
    medications: "",
    vetName: "Dr. Lindqvist",
    vetPhone: "617-555-0178",
    notes: "Very vocal and wants company",
  },
  {
    name: "Daisy",
    species: "Dog",
    breed: "Beagle",
    feeding: "1 cup of kibble twice a day",
    allergies: "Fleas",
    medications: "Allergy tablet when needed",
    vetName: "Dr. Okafor",
    vetPhone: "617-555-0142",
    notes: "Escapes the yard if the gate is open",
  },
  {
    name: "Rocky",
    species: "Dog",
    breed: "Boxer",
    feeding: "2 cups of kibble, morning and evening",
    allergies: "Pollen",
    medications: "Heartworm prevention monthly",
    vetName: "Dr. Tanaka",
    vetPhone: "617-555-0165",
    notes: "Nervous around strangers at first",
  },
  {
    name: "Molly",
    species: "Cat",
    breed: "Maine Coon",
    feeding: "Wet food twice a day, dry food available",
    allergies: "None known",
    medications: "",
    vetName: "Dr. Okafor",
    vetPhone: "617-555-0142",
    notes: "Needs brushing twice a week",
  },
  {
    name: "Bailey",
    species: "Dog",
    breed: "Corgi",
    feeding: "1 cup of kibble, morning and night",
    allergies: "None known",
    medications: "",
    vetName: "Dr. Tanaka",
    vetPhone: "617-555-0165",
    notes: "Friendly with other dogs",
  },
  {
    name: "Sadie",
    species: "Dog",
    breed: "Poodle",
    feeding: "1 cup of kibble, morning and evening",
    allergies: "None known",
    medications: "",
    vetName: "Dr. Tanaka",
    vetPhone: "617-555-0165",
    notes: "Loves car rides",
  },
];

const TITLES = {
  "vet visit": [
    "Annual checkup",
    "Ear infection",
    "Dental cleaning",
    "Skin irritation",
    "Upset stomach",
    "Limping",
  ],
  appointment: ["Checkup", "Dental cleaning", "Follow-up visit", "Blood test"],
  weight: ["Weight check"],
  vaccine: {
    Dog: ["Rabies booster", "Distemper", "Bordetella", "Leptospirosis"],
    Cat: ["Rabies booster", "FVRCP", "Feline leukemia"],
  },
  medication: {
    Dog: ["Flea and tick prevention", "Heartworm prevention", "Joint supplement"],
    Cat: ["Flea treatment", "Dewormer", "Hairball remedy"],
  },
};

function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function pickTitle(row, species) {
  const options = TITLES[row.recordType];
  const list = Array.isArray(options) ? options : options[species];
  return list[row.id % list.length];
}

function buildRecord(row, pet, petId) {
  const isAppointment = row.recordType === "appointment";
  const isFuture = row.daysFromToday > 0;
  const days = !isAppointment && isFuture ? -row.daysFromToday : row.daysFromToday;

  return {
    ownerId: OWNER_ID,
    petId,
    type: row.recordType,
    title: pickTitle(row, pet.species),
    date: dateFromToday(days),
    notes: row.notes || "",
    completed: isAppointment && days < -10,
    createdAt: new Date(),
  };
}

async function seed() {
  const rows = JSON.parse(readFileSync(RAW_DATA_PATH, "utf-8"));
  const db = await getDb();
  const petsCollection = db.collection("pets");
  const recordsCollection = db.collection("healthRecords");

  await recordsCollection.deleteMany({ ownerId: OWNER_ID });
  await petsCollection.deleteMany({ ownerId: OWNER_ID });

  const petDocs = PETS.map((pet) => ({
    ownerId: OWNER_ID,
    ...pet,
    shareToken: null,
    createdAt: new Date(),
  }));
  const { insertedIds } = await petsCollection.insertMany(petDocs);

  const petsByName = new Map(
    PETS.map((pet, index) => [pet.name, { pet, id: String(insertedIds[index]) }]),
  );

  const recordDocs = rows.map((row) => {
    const match = petsByName.get(row.petName);
    if (!match) throw new Error(`Row ${row.id} has an unknown pet: ${row.petName}`);
    return buildRecord(row, match.pet, match.id);
  });
  await recordsCollection.insertMany(recordDocs);

  console.log(`Seeded ${petDocs.length} pets and ${recordDocs.length} health records.`);
  await closeDb();
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
