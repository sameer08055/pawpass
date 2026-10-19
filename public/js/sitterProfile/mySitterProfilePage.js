// public/js/sitterProfile/mySitterProfilePage.js

import { CURRENT_SITTER_ID } from "../config.js";
import {
  fetchMyProfile,
  createProfile,
  updateProfile,
  addService,
  updateService,
  removeService,
  updateAvailability,
} from "./sitterProfileApi.js";
import {
  renderProfileForm,
  renderServices,
  renderAvailabilityCalendar,
  renderDayEditor,
  renderDashboard,
  showStatusMessage,
} from "./sitterProfileView.js";
import {
  readProfileFormValues,
  readServiceFormValues,
  fillServiceForm,
  clearServiceForm,
  setServiceFormMode,
} from "./sitterProfileForm.js";

let currentProfile = null;
let pendingAvailableDays = [];
let editingServiceSpecies = null;

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();
let editingDate = null; // the date string currently open in the day editor

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
document.querySelectorAll("[data-goto]").forEach((btn) => {
  btn.addEventListener("click", () => showPanel(btn.dataset.goto));
});

// ---- data loading / rendering ----

function refreshAll() {
  renderDashboard(currentProfile);
  renderServices(currentProfile?.services);
  renderCalendar();
  document
    .getElementById("servicesSection")
    .classList.toggle("disabled", !currentProfile);
}

function renderCalendar() {
  renderAvailabilityCalendar(viewYear, viewMonth, pendingAvailableDays, editingDate);
}

async function init() {
  try {
    currentProfile = await fetchMyProfile(CURRENT_SITTER_ID);
  } catch (err) {
    showStatusMessage("profileStatus", "Couldn't load profile: " + err.message, true);
    return;
  }

  pendingAvailableDays = currentProfile?.availableDays
    ? [...currentProfile.availableDays]
    : [];
  renderProfileForm(currentProfile);
  refreshAll();
}

// ---- profile form ----

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = readProfileFormValues();

  try {
    if (currentProfile) {
      currentProfile = await updateProfile(currentProfile._id, {
        sitterId: CURRENT_SITTER_ID,
        ...values,
      });
      showStatusMessage("profileStatus", "Profile updated.");
    } else {
      currentProfile = await createProfile({ sitterId: CURRENT_SITTER_ID, ...values });
      showStatusMessage("profileStatus", "Profile created.");
    }
    refreshAll();
  } catch (err) {
    showStatusMessage("profileStatus", err.message, true);
  }
});

// ---- services ----

document.getElementById("addServiceForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentProfile) return;

  const service = readServiceFormValues();
  try {
    if (editingServiceSpecies) {
      currentProfile = await updateService(
        currentProfile._id,
        editingServiceSpecies,
        service,
      );
      showStatusMessage("servicesStatus", "Service updated.");
    } else {
      currentProfile = await addService(currentProfile._id, service);
      showStatusMessage("servicesStatus", "Service added.");
    }
    editingServiceSpecies = null;
    setServiceFormMode("add");
    clearServiceForm();
    refreshAll();
  } catch (err) {
    showStatusMessage("servicesStatus", err.message, true);
  }
});

document.getElementById("cancelServiceEditBtn").addEventListener("click", () => {
  editingServiceSpecies = null;
  setServiceFormMode("add");
  clearServiceForm();
});

document.getElementById("servicesList").addEventListener("click", async (e) => {
  const species = e.target.dataset.species;
  if (!species) return;

  if (e.target.classList.contains("edit-service-btn")) {
    const service = currentProfile.services.find((s) => s.species === species);
    if (!service) return;
    fillServiceForm(service);
    editingServiceSpecies = species;
    setServiceFormMode("edit");
    document.getElementById("addServiceForm").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (e.target.classList.contains("remove-service-btn")) {
    try {
      currentProfile = await removeService(currentProfile._id, species);
      showStatusMessage("servicesStatus", "Service removed.");
      refreshAll();
    } catch (err) {
      showStatusMessage("servicesStatus", err.message, true);
    }
  }
});

// ---- calendar: month navigation ----

document.getElementById("prevMonthBtn").addEventListener("click", () => {
  viewMonth -= 1;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear -= 1;
  }
  editingDate = null;
  renderDayEditor(null);
  renderCalendar();
});

document.getElementById("nextMonthBtn").addEventListener("click", () => {
  viewMonth += 1;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear += 1;
  }
  editingDate = null;
  renderDayEditor(null);
  renderCalendar();
});

// ---- calendar: clicking a day opens the day editor ----

document.getElementById("availabilityGrid").addEventListener("click", (e) => {
  if (!e.target.classList.contains("day-cell")) return;
  const date = e.target.dataset.date;

  editingDate = date;
  const entry = pendingAvailableDays.find((d) => d.date === date);
  renderDayEditor(date, entry);
  renderCalendar();
});

document.getElementById("dayModeAllDay").addEventListener("change", () => {
  document.getElementById("dayTimeInputs").classList.add("hidden");
});
document.getElementById("dayModeCustom").addEventListener("change", () => {
  document.getElementById("dayTimeInputs").classList.remove("hidden");
});

document.getElementById("applyDayBtn").addEventListener("click", () => {
  if (!editingDate) return;

  const isCustom = document.getElementById("dayModeCustom").checked;
  const newEntry = isCustom
    ? {
        date: editingDate,
        allDay: false,
        startTime: document.getElementById("dayStartTime").value,
        endTime: document.getElementById("dayEndTime").value,
      }
    : { date: editingDate, allDay: true };

  const existingIndex = pendingAvailableDays.findIndex((d) => d.date === editingDate);
  if (existingIndex >= 0) {
    pendingAvailableDays[existingIndex] = newEntry;
  } else {
    pendingAvailableDays.push(newEntry);
  }

  editingDate = null;
  renderDayEditor(null);
  renderCalendar();
});

document.getElementById("removeDayBtn").addEventListener("click", () => {
  if (!editingDate) return;
  pendingAvailableDays = pendingAvailableDays.filter((d) => d.date !== editingDate);
  editingDate = null;
  renderDayEditor(null);
  renderCalendar();
});

document.getElementById("saveAvailabilityBtn").addEventListener("click", async () => {
  if (!currentProfile) {
    showStatusMessage("availabilityStatus", "Create your profile first.", true);
    return;
  }

  try {
    currentProfile = await updateAvailability(currentProfile._id, pendingAvailableDays);
    showStatusMessage("availabilityStatus", "Availability saved.");
    renderDashboard(currentProfile);
  } catch (err) {
    showStatusMessage("availabilityStatus", err.message, true);
  }
});

init();
