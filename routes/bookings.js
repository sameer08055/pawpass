import { Router } from "express";
import {
  getAllBookings,
  getBookingsBySitterId,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
} from "../db/bookings.js";
import { validateBooking, validateStatus } from "../validation/booking.js";

const router = Router();

// GET /api/bookings — list all bookings
// GET /api/bookings?sitterId=xyz — list bookings for one sitter
router.get("/", async (req, res) => {
  try {
    const { sitterId } = req.query;
    const bookings = sitterId
      ? await getBookingsBySitterId(sitterId)
      : await getAllBookings();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch bookings." });
  }
});

// GET /api/bookings/:id
router.get("/:id", async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);
    if (!booking) return res.status(404).json({ error: "Booking not found." });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch booking." });
  }
});

// POST /api/bookings — create a new booking (always starts as "requested")
router.post("/", async (req, res) => {
  const { valid, errors } = validateBooking(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const created = await createBooking(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: "Failed to create booking." });
  }
});

// PUT /api/bookings/:id — update booking details (not status — see PATCH below)
router.put("/:id", async (req, res) => {
  const { valid, errors } = validateBooking(req.body);
  if (!valid) return res.status(400).json({ errors });

  try {
    const updated = await updateBooking(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Booking not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking." });
  }
});

// PATCH /api/bookings/:id/status — update just the status
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  const { valid, errors } = validateStatus(status);
  if (!valid) return res.status(400).json({ errors });

  try {
    const updated = await updateBookingStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Booking not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update booking status." });
  }
});

// DELETE /api/bookings/:id — cancel/remove a booking
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await deleteBooking(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Booking not found." });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete booking." });
  }
});

export default router;
