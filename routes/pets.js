import { Router } from "express";
import {
  getPetsByOwnerId,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  createShareToken,
  clearShareToken,
  getPetByShareToken,
} from "../db/pets.js";
import { deleteHealthRecordsByPetId } from "../db/healthRecords.js";
import { validatePet } from "../validation/pet.js";

const router = Router();

router.param("id", (req, res, next, id) => {
  if (!/^[0-9a-f]{24}$/i.test(id)) {
    return res.status(404).json({ error: "Pet not found." });
  }
  next();
});

router.get("/", async (req, res) => {
  const { ownerId } = req.query;
  if (!ownerId) return res.status(400).json({ error: "ownerId is required." });

  try {
    res.json(await getPetsByOwnerId(ownerId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pets." });
  }
});

router.get("/shared/:token", async (req, res) => {
  try {
    const pet = await getPetByShareToken(req.params.token);
    if (!pet) {
      return res.status(404).json({ error: "This link is not valid or was turned off." });
    }
    res.json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch shared pet." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const pet = await getPetById(req.params.id);
    if (!pet) return res.status(404).json({ error: "Pet not found." });
    res.json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pet." });
  }
});

router.post("/", async (req, res) => {
  const { valid, errors } = validatePet(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const created = await createPet(req.body);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create pet." });
  }
});

router.put("/:id", async (req, res) => {
  const { valid, errors } = validatePet(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const updated = await updatePet(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Pet not found." });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update pet." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deletePet(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Pet not found." });
    await deleteHealthRecordsByPetId(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete pet." });
  }
});

router.post("/:id/share", async (req, res) => {
  try {
    const token = await createShareToken(req.params.id);
    if (!token) return res.status(404).json({ error: "Pet not found." });
    res.status(201).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create share link." });
  }
});

router.delete("/:id/share", async (req, res) => {
  try {
    const found = await clearShareToken(req.params.id);
    if (!found) return res.status(404).json({ error: "Pet not found." });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to turn off share link." });
  }
});

export default router;
