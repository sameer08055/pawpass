// public/js/bookings/mySitsPage.js

import { CURRENT_SITTER_ID } from "../config.js";
import {
  fetchMyBookings,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
} from "./bookingsApi.js";
import { renderBookings, showStatusMessage } from "./bookingsView.js";
import {
  readBookingFormValues,
  fillBookingForm,
  resetBookingForm,
  setFormMode,
} from "./bookingForm.js";

let bookings = [];
let editingId = null;

async function loadBookings() {
  try {
    bookings = await fetchMyBookings(CURRENT_SITTER_ID);
    renderBookings(bookings);
  } catch (err) {
    showStatusMessage("bookingsStatus", "Couldn't load sits: " + err.message, true);
  }
}

document.getElementById("bookingForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = readBookingFormValues();

  try {
    if (editingId) {
      await updateBooking(editingId, values);
      showStatusMessage("bookingsStatus", "Sit updated.");
    } else {
      await createBooking({ sitterId: CURRENT_SITTER_ID, ...values });
      showStatusMessage("bookingsStatus", "Sit logged.");
    }
    editingId = null;
    setFormMode("create");
    resetBookingForm();
    await loadBookings();
  } catch (err) {
    showStatusMessage("bookingsStatus", err.message, true);
  }
});

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  editingId = null;
  setFormMode("create");
  resetBookingForm();
});

document.getElementById("bookingsList").addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("edit-booking-btn")) {
    const booking = bookings.find((b) => b._id === id);
    if (!booking) return;
    fillBookingForm(booking);
    editingId = id;
    setFormMode("edit");
    document.getElementById("bookingForm").scrollIntoView({ behavior: "smooth" });
  }

  if (e.target.classList.contains("delete-booking-btn")) {
    if (!confirm("Delete this sit? This can't be undone.")) return;
    try {
      await deleteBooking(id);
      showStatusMessage("bookingsStatus", "Sit deleted.");
      await loadBookings();
    } catch (err) {
      showStatusMessage("bookingsStatus", err.message, true);
    }
  }
});

document.getElementById("bookingsList").addEventListener("change", async (e) => {
  if (!e.target.classList.contains("status-select")) return;
  const id = e.target.dataset.id;
  const status = e.target.value;

  try {
    await updateBookingStatus(id, status);
    showStatusMessage("bookingsStatus", "Status updated.");
    await loadBookings();
  } catch (err) {
    showStatusMessage("bookingsStatus", err.message, true);
  }
});

loadBookings();
