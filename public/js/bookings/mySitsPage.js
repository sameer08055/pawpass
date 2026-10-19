import { CURRENT_SITTER_ID } from "../config.js";
import { fetchMyProfile } from "../sitterProfile/sitterProfileApi.js";
import {
  fetchMyBookings,
  createBooking,
  updateBooking,
  updateBookingStatus,
  deleteBooking,
} from "./bookingsApi.js";
import {
  renderBookings,
  renderDashboard,
  renderCustomers,
  showStatusMessage,
} from "./bookingsView.js";
import {
  readBookingFormValues,
  fillBookingForm,
  resetBookingForm,
  setFormMode,
} from "./bookingForm.js";

let bookings = [];
let editingId = null;

// ---- sidebar / panel switching ----
function showPanel(panelName) {
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".sidebar__item")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`panel-${panelName}`).classList.add("active");
  const navBtn = document.querySelector(`.sidebar__item[data-panel="${panelName}"]`);
  if (navBtn) navBtn.classList.add("active");
}
document.querySelectorAll(".sidebar__item").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.panel));
});

async function loadMap() {
  try {
    const profile = await fetchMyProfile(CURRENT_SITTER_ID);
    const mapWrap = document.getElementById("mapWrap");
    const mapHint = document.getElementById("mapHint");

    if (!profile?.lat || !profile?.lon) {
      mapWrap.style.display = "none";
      mapHint.style.display = "block";
      return;
    }

    const { lat, lon } = profile;
    const bbox = {
      minLon: lon - 0.03,
      maxLon: lon + 0.03,
      minLat: lat - 0.02,
      maxLat: lat + 0.02,
    };
    const frame = document.getElementById("mapFrame");
    frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox.minLon}%2C${bbox.minLat}%2C${bbox.maxLon}%2C${bbox.maxLat}&layer=mapnik&marker=${lat}%2C${lon}`;
    mapWrap.style.display = "block";
    mapHint.style.display = "none";
  } catch (err) {
    // if the profile can't be loaded, just leave the hint message showing
  }
}

async function loadBookings() {
  try {
    bookings = await fetchMyBookings(CURRENT_SITTER_ID);
    renderBookings(bookings);
    renderDashboard(bookings);
    renderCustomers(bookings);
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
loadMap();
