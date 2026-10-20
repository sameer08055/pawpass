import {
  CURRENT_OWNER_ID,
  fetchMyPets,
  createPet,
  updatePet,
  deletePet,
  createShareLink,
  removeShareLink,
  fetchSharedPet,
} from "./petsApi.js";
import { renderPets, renderSharedPet, showStatusMessage } from "./petsView.js";
import { readPetFormValues, fillPetForm, resetPetForm, setFormMode } from "./petForm.js";

let pets = [];
let editingId = null;

function showPanel(panelName) {
  document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".sidebar__item")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`panel-${panelName}`).classList.add("active");
  const navBtn = document.querySelector(`.sidebar__item[data-panel="${panelName}"]`);
  if (navBtn) navBtn.classList.add("active");
}

function startCreate() {
  editingId = null;
  setFormMode("create");
  resetPetForm();
}

async function loadPets() {
  try {
    pets = await fetchMyPets(CURRENT_OWNER_ID);
    renderPets(pets);
  } catch (err) {
    showStatusMessage("petsStatus", "Couldn't load pets: " + err.message, true);
  }
}

async function showSharedPet(token) {
  document.getElementById("ownerView").classList.add("hidden");
  document.getElementById("sharedView").classList.remove("hidden");
  try {
    renderSharedPet(await fetchSharedPet(token));
  } catch (err) {
    document.getElementById("sharedStatus").textContent = err.message;
  }
}

document.querySelectorAll(".sidebar__item").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.panel === "form" && editingId) startCreate();
    showPanel(btn.dataset.panel);
  });
});

document.getElementById("petForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = { ownerId: CURRENT_OWNER_ID, ...readPetFormValues() };

  try {
    if (editingId) {
      await updatePet(editingId, values);
      showStatusMessage("petsStatus", "Pet updated.");
    } else {
      await createPet(values);
      showStatusMessage("petsStatus", "Pet added.");
    }
    startCreate();
    showPanel("pets");
    await loadPets();
  } catch (err) {
    showStatusMessage("petFormStatus", err.message, true);
  }
});

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  startCreate();
  showPanel("pets");
});

document.getElementById("petsList").addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  try {
    if (e.target.classList.contains("edit-pet-btn")) {
      const pet = pets.find((p) => p._id === id);
      if (!pet) return;
      fillPetForm(pet);
      editingId = id;
      setFormMode("edit");
      showPanel("form");
    }

    if (e.target.classList.contains("delete-pet-btn")) {
      if (!confirm("Delete this pet and its records? This can't be undone.")) return;
      await deletePet(id);
      showStatusMessage("petsStatus", "Pet deleted.");
      await loadPets();
    }

    if (e.target.classList.contains("create-link-btn")) {
      await createShareLink(id);
      showStatusMessage("petsStatus", "Link created.");
      await loadPets();
    }

    if (e.target.classList.contains("remove-link-btn")) {
      await removeShareLink(id);
      showStatusMessage("petsStatus", "Link turned off.");
      await loadPets();
    }
  } catch (err) {
    showStatusMessage("petsStatus", err.message, true);
  }
});

const shareToken = new URLSearchParams(window.location.search).get("share");
if (shareToken) {
  showSharedPet(shareToken);
} else {
  loadPets();
}
