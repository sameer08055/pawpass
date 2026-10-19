import { Router } from "express";
import {
  getAllSitterProfiles,
  getSitterProfileById,
  getSitterProfileBySitterId,
  createSitterProfile,
  updateSitterProfile,
  deleteSitterProfile,
  addService,
  updateService,
  removeService,
  setAvailableDays,
} from "../db/sitterProfiles.js";
import { validateSitterProfile } from "../validation/sitterProfile.js";
import { geocodePincode } from "../utils/geocodePincode.js";

const router = Router();

// GET /api/sitter-profiles — list all sitters
// GET /api/sitter-profiles?sitterId=xyz — the one profile belonging to that sitter
router.get("/", async (req, res) => {
  try {
    const { sitterId } = req.query;
    if (sitterId) {
      const profile = await getSitterProfileBySitterId(sitterId);
      return res.json(profile ? [profile] : []);
    }
    const profiles = await getAllSitterProfiles();
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sitter profiles." });
  }
});

// GET /api/sitter-profiles/:id — one sitter
router.get("/:id", async (req, res) => {
  try {
    const profile = await getSitterProfileById(req.params.id);
    if (!profile) return res.status(404).json({ error: "Sitter profile not found." });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch sitter profile." });
  }
});

// POST /api/sitter-profiles — create a new sitter profile
// If a pincode is given, we geocode it server-side into lat/lon so the
// sitter never has to type raw coordinates themselves.
router.post("/", async (req, res) => {
  const { valid, errors } = validateSitterProfile(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const body = { ...req.body };
    if (body.pincode) {
      const coords = await geocodePincode(body.pincode);
      if (coords) {
        body.lat = coords.lat;
        body.lon = coords.lon;
      }
    }
    const created = await createSitterProfile(body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create sitter profile." });
  }
});

// PUT /api/sitter-profiles/:id — update a sitter profile
router.put("/:id", async (req, res) => {
  const { valid, errors } = validateSitterProfile(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const body = { ...req.body };
    if (body.pincode) {
      const coords = await geocodePincode(body.pincode);
      if (coords) {
        body.lat = coords.lat;
        body.lon = coords.lon;
      }
    }
    const updated = await updateSitterProfile(req.params.id, body);
    if (!updated) return res.status(404).json({ error: "Sitter profile not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update sitter profile." });
  }
});

// DELETE /api/sitter-profiles/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteSitterProfile(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Sitter profile not found." });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete sitter profile." });
  }
});

// POST /api/sitter-profiles/:id/services — add a service
router.post("/:id/services", async (req, res) => {
  const { species, rate, notes, location } = req.body;
  if (!species || typeof rate !== "number") {
    return res
      .status(400)
      .json({ error: "species (string) and rate (number) are required." });
  }
  try {
    const updated = await addService(req.params.id, {
      species,
      rate,
      location: location || "Either",
      notes: notes || "",
    });
    if (!updated) return res.status(404).json({ error: "Sitter profile not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to add service." });
  }
});

// PUT /api/sitter-profiles/:id/services/:species — edit an existing service
router.put("/:id/services/:species", async (req, res) => {
  const { species, rate, notes, location } = req.body;
  if (!species || typeof rate !== "number") {
    return res
      .status(400)
      .json({ error: "species (string) and rate (number) are required." });
  }
  try {
    const updated = await updateService(req.params.id, req.params.species, {
      species,
      rate,
      location: location || "Either",
      notes: notes || "",
    });
    if (!updated)
      return res.status(404).json({ error: "Sitter profile or service not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update service." });
  }
});

// DELETE /api/sitter-profiles/:id/services/:species — remove a service
router.delete("/:id/services/:species", async (req, res) => {
  try {
    const updated = await removeService(req.params.id, req.params.species);
    if (!updated) return res.status(404).json({ error: "Sitter profile not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to remove service." });
  }
});

// PUT /api/sitter-profiles/:id/availability — replace the available days list
router.put("/:id/availability", async (req, res) => {
  const { availableDays } = req.body;
  if (!Array.isArray(availableDays)) {
    return res
      .status(400)
      .json({ error: "availableDays must be an array of date strings." });
  }
  try {
    const updated = await setAvailableDays(req.params.id, availableDays);
    if (!updated) return res.status(404).json({ error: "Sitter profile not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update availability." });
  }
});

export default router;
