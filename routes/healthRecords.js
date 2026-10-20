import { Router } from "express";
import {
  searchHealthRecords,
  getUpcomingAppointments,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
} from "../db/healthRecords.js";
import { getPetById } from "../db/pets.js";
import { validateHealthRecord, RECORD_TYPES } from "../validation/healthRecord.js";

const router = Router();

const isId = (value) => /^[0-9a-f]{24}$/i.test(value);

router.param("id", (req, res, next, id) => {
  if (!isId(id)) return res.status(404).json({ error: "Health record not found." });
  next();
});

function toPositiveInt(value, fallback, max) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number) || number < 1) return fallback;
  return Math.min(number, max);
}

async function ownsPet(ownerId, petId) {
  if (!isId(petId)) return false;
  const pet = await getPetById(petId);
  return Boolean(pet) && pet.ownerId === ownerId;
}

router.get("/upcoming", async (req, res) => {
  const { ownerId } = req.query;
  if (!ownerId) return res.status(400).json({ error: "ownerId is required." });

  try {
    res.json(await getUpcomingAppointments(ownerId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch upcoming appointments." });
  }
});

router.get("/", async (req, res) => {
  const { ownerId, petId, type, q } = req.query;
  if (!ownerId) return res.status(400).json({ error: "ownerId is required." });

  try {
    const result = await searchHealthRecords({
      ownerId,
      petId: petId || "",
      type: RECORD_TYPES.includes(type) ? type : "",
      q: q ? String(q).trim().slice(0, 100) : "",
      page: toPositiveInt(req.query.page, 1, 100000),
      limit: toPositiveInt(req.query.limit, 10, 50),
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch health records." });
  }
});

router.post("/", async (req, res) => {
  const { valid, errors } = validateHealthRecord(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    if (!(await ownsPet(req.body.ownerId, req.body.petId))) {
      return res.status(400).json({ errors: ["petId must be one of your pets."] });
    }
    const created = await createHealthRecord(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create health record." });
  }
});

router.put("/:id", async (req, res) => {
  const { valid, errors } = validateHealthRecord(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    if (!(await ownsPet(req.body.ownerId, req.body.petId))) {
      return res.status(400).json({ errors: ["petId must be one of your pets."] });
    }
    const updated = await updateHealthRecord(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Health record not found." });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update health record." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteHealthRecord(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Health record not found." });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete health record." });
  }
});

export default router;
