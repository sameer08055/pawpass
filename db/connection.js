// Single shared MongoClient for the whole app's lifetime
// The connection is made once and resused everywhere,
// instead of opening a fresh connection on every request
// and exhauting connection pools and add latency on every single cell

import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Run the app with: node --env-file=.env server.js",
  );
}

const client = new MongoClient(uri);
let dbInstance = null;

export async function getDb() {
  if (dbInstance) return dbInstance;
  await client.connect();
  dbInstance = client.db(); // uses the database name already in the connection string
  return dbInstance;
}

export async function closeDb() {
  await client.close();
  dbInstance = null;
}
