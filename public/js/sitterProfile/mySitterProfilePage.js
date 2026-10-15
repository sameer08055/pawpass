import { CURRENT_SITTER_ID } from "../config.js";
import {
  fetchMyProfile,
  createProfile,
  updateProfile,
  addService,
  removeService,
  updateAvailability,
} from "./sitterProfileApi.js";
import {
  renderProfileForm,
  renderServices,
  renderAvailabilityCalendar,
  showStatusMessage,
} from "./sitterProfileView.js";
import {
  readProfileFormValues,
  readNewServiceValues,
  clearNewServiceForm,
} from "./sitterProfileForm.js";

let currentProfile = null;
let pendingAvailableDays = [];

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
  renderServices(currentProfile?.services);
  renderAvailabilityCalendar(pendingAvailableDays);

  document
    .getElementById("servicesSection")
    .classList.toggle("disabled", !currentProfile);
  document
    .getElementById("availabilitySection")
    .classList.toggle("disabled", !currentProfile);
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = readProfileFormValues();

  try {
    if (currentProfile) {
      currentProfile = await updateProfile(currentProfile._id, values);
      showStatusMessage("profileStatus", "Profile updated.");
    } else {
      currentProfile = await createProfile({ sitterId: CURRENT_SITTER_ID, ...values });
      showStatusMessage("profileStatus", "Profile created.");
      document.getElementById("servicesSection").classList.remove("disabled");
      document.getElementById("availabilitySection").classList.remove("disabled");
    }
  } catch (err) {
    showStatusMessage("profileStatus", err.message, true);
  }
});

document.getElementById("addServiceForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentProfile) return;

  const service = readNewServiceValues();
  try {
    currentProfile = await addService(currentProfile._id, service);
    renderServices(currentProfile.services);
    clearNewServiceForm();
    showStatusMessage("servicesStatus", "Service added.");
  } catch (err) {
    showStatusMessage("servicesStatus", err.message, true);
  }
});

document.getElementById("servicesList").addEventListener("click", async (e) => {
  if (!e.target.classList.contains("remove-service-btn")) return;
  const species = e.target.dataset.species;

  try {
    currentProfile = await removeService(currentProfile._id, species);
    renderServices(currentProfile.services);
    showStatusMessage("servicesStatus", "Service removed.");
  } catch (err) {
    showStatusMessage("servicesStatus", err.message, true);
  }
});

document.getElementById("availabilityGrid").addEventListener("click", (e) => {
  if (!e.target.classList.contains("day-cell")) return;
  const date = e.target.dataset.date;

  if (pendingAvailableDays.includes(date)) {
    pendingAvailableDays = pendingAvailableDays.filter((d) => d !== date);
    e.target.classList.remove("available");
  } else {
    pendingAvailableDays.push(date);
    e.target.classList.add("available");
  }
});

document.getElementById("saveAvailabilityBtn").addEventListener("click", async () => {
  if (!currentProfile) return;

  try {
    currentProfile = await updateAvailability(currentProfile._id, pendingAvailableDays);
    showStatusMessage("availabilityStatus", "Availability saved.");
  } catch (err) {
    showStatusMessage("availabilityStatus", err.message, true);
  }
});

init();
