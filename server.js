// Run with: node --env-file=.env server.js

import express from "express";
import { getDb } from "./db/connection.js";
import sitterProfilesRouter from "./routes/sitterProfiles.js";
import bookingsRouter from "./routes/bookings.js";
import petsRouter from "./routes/pets.js";
import healthRecordsRouter from "./routes/healthRecords.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.use("/api/sitter-profiles", sitterProfilesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/pets", petsRouter);
app.use("/api/health-records", healthRecordsRouter);

// quick health check — confirms both the server and the database are reachable
app.get("/api/health", async (req, res) => {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "error", message: err.message });
  }
});

// 404 for any unmatched API route
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found." });
});

// generic error handler (catches anything thrown/passed to next() that
// wasn't already handled inside a route)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong." });
});

app.listen(PORT, () => {
  console.log(`PawPass server running at http://localhost:${PORT}`);
});
