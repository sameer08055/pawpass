// Seeds the pets and healthRecords collections with demo data for one owner.
// Run with: node --env-file=.env scripts/seedPets.js

import { getDb, closeDB } from "../db/connection.js";

const OWNER_ID = "priya-demo";
const PET_COUNT = 12;
const RECORD_COUNT = 1000;

const NAMES = [
  "Luna", "Milo", "Bella", "Charlie", "Daisy", "Max", "Coco", "Rocky", "Willow",
  "Oliver", "Nala", "Teddy",
];
const SPECIES = ["Dog", "Dog", "Dog", "Cat", "Cat", "Rabbit", "Other"];
const BREEDS = {
  Dog: ["Golden Retriever", "Labrador", "Beagle", "Corgi", "Poodle", "Mixed"],
  Cat: ["Tabby", "Siamese", "Maine Coon", "Bengal", "Domestic Shorthair"],
  Rabbit: ["Holland Lop", "Mini Rex", "Netherland Dwarf"],
  Other: ["Guinea pig", "Hamster", "Bearded dragon"],
};
const FEEDING = {
  Dog: "Dry kibble, 1.5 cups, morning and evening",
  Cat: "Wet and dry mix, twice a day",
  Rabbit: "Hay and pellets, fresh greens daily",
  Other: "Species-specific pellets, once a day",
};
const ALLERGIES = ["None known", "Chicken", "Grain", "Pollen", "Fleas"];
const VETS = [
  ["Dr. Okafor", "617-555-0142"],
  ["Dr. Lindqvist", "617-555-0178"],
  ["Dr. Ramos", "617-555-0119"],
  ["Dr. Tanaka", "617-555-0165"],
];
const TYPES = ["vet visit", "vaccine", "weight", "medication", "appointment"];
const TITLES = {
  "vet visit": ["Annual checkup", "Limping", "Ear infection", "Dental cleaning"],
  vaccine: ["Rabies booster", "Distemper", "Bordetella", "FVRCP"],
  medication: ["Flea and tick prevention", "Heartworm prevention", "Joint supplement"],
  appointment: ["Checkup", "Vaccine booster", "Dental cleaning", "Follow-up visit"],
  weight: ["Weight check"],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];
const int = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function dateFromToday(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function buildPet(_, index) {
  const species = pick(SPECIES);
  const [vetName, vetPhone] = pick(VETS);
  return {
    ownerId: OWNER_ID,
    name: NAMES[index],
    species,
    breed: pick(BREEDS[species]),
    feeding: FEEDING[species],
    allergies: pick(ALLERGIES),
    medications: "",
    vetName,
    vetPhone,
    notes: "",
    shareToken: null,
    createdAt: new Date(),
  };
}

function buildRecord(petId) {
  const type = pick(TYPES);
  const record = {
    ownerId: OWNER_ID,
    petId,
    type,
    title: pick(TITLES[type]),
    date: dateFromToday(-int(1, 1000)),
    notes: type === "weight" ? `${(Math.random() * 30 + 2).toFixed(1)} kg` : "",
    completed: false,
    createdAt: new Date(),
  };

  if (type === "appointment") {
    const roll = Math.random();
    if (roll < 0.2) {
      record.date = dateFromToday(int(0, 45));
    } else if (roll < 0.22) {
      record.date = dateFromToday(-int(1, 10));
    } else {
      record.completed = true;
    }
  }
  return record;
}

async function seed() {
  const db = await getDb();
  const pets = db.collection("pets");
  const records = db.collection("healthRecords");

  await records.deleteMany({ ownerId: OWNER_ID });
  await pets.deleteMany({ ownerId: OWNER_ID });

  const petDocs = Array.from({ length: PET_COUNT }, buildPet);
  const { insertedIds } = await pets.insertMany(petDocs);
  const petIds = Object.values(insertedIds).map(String);

  const recordDocs = Array.from({ length: RECORD_COUNT }, () =>
    buildRecord(pick(petIds)),
  );
  await records.insertMany(recordDocs);

  console.log(`Seeded ${PET_COUNT} pets and ${RECORD_COUNT} health records.`);
  await closeDB();
}

seed().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
