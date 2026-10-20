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
