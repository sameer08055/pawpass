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
import {
  readPetFormValues,
  fillPetForm,
  resetPetForm,
  setFormMode,
} from "./petForm.js";

let pets = [];
let editingId = null;

async function loadPets() {
  try {
    pets = await fetchMyPets(CURRENT_OWNER_ID);
    renderPets(pets);
  } catch (err) {
    showStatusMessage("petsStatus", "Couldn't load pets: " + err.message, true);
  }
}

async function showSharedPet(token) {
  document.getElementById("ownerView").hidden = true;
  document.getElementById("sharedView").hidden = false;
  try {
    renderSharedPet(await fetchSharedPet(token));
  } catch (err) {
    document.getElementById("sharedStatus").textContent = err.message;
  }
}

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
    editingId = null;
    setFormMode("create");
    resetPetForm();
    await loadPets();
  } catch (err) {
    showStatusMessage("petsStatus", err.message, true);
  }
});

document.getElementById("cancelEditBtn").addEventListener("click", () => {
  editingId = null;
  setFormMode("create");
  resetPetForm();
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
      document.getElementById("petForm").scrollIntoView({ behavior: "smooth" });
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

const shareToken = new window.URLSearchParams(window.location.search).get("share");
if (shareToken) {
  showSharedPet(shareToken);
} else {
  loadPets();
}
