import { CURRENT_OWNER_ID, fetchMyPets } from "../pets/petsApi.js";
import { showStatusMessage } from "../pets/petsView.js";
import {
  fetchRecords,
  fetchUpcoming,
  createRecord,
  updateRecord,
  deleteRecord,
} from "./healthApi.js";
import { renderUpcoming, renderRecords, renderPager } from "./healthView.js";
import {
  fillPetOptions,
  readRecordFormValues,
  fillRecordForm,
  resetRecordForm,
  toggleCompletedRow,
  setRecordFormMode,
} from "./healthForm.js";

const LIMIT = 10;

let pets = [];
let records = [];
let upcoming = [];
let editingId = null;
let page = 1;

const petName = (id) => pets.find((p) => p._id === id)?.name ?? "Unknown pet";

function currentFilters() {
  return {
    ownerId: CURRENT_OWNER_ID,
    petId: document.getElementById("filterPet").value,
    type: document.getElementById("filterType").value,
    q: document.getElementById("searchText").value.trim(),
    page,
    limit: LIMIT,
  };
}

async function loadUpcoming() {
  upcoming = await fetchUpcoming(CURRENT_OWNER_ID);
  renderUpcoming(upcoming, petName);
}

async function loadRecords() {
  const result = await fetchRecords(currentFilters());
  records = result.items;
  renderRecords(records, petName);
  renderPager(result);
}

async function loadAll() {
  try {
    await Promise.all([loadUpcoming(), loadRecords()]);
  } catch (err) {
    showStatusMessage("recordsStatus", "Couldn't load records: " + err.message, true);
  }
}

function toPayload(record, overrides = {}) {
  return {
    ownerId: CURRENT_OWNER_ID,
    petId: record.petId,
    type: record.type,
    title: record.title,
    date: record.date,
    notes: record.notes,
    completed: record.completed,
    ...overrides,
  };
}

document.getElementById("recordForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const values = { ownerId: CURRENT_OWNER_ID, ...readRecordFormValues() };

  try {
    if (editingId) {
      await updateRecord(editingId, values);
      showStatusMessage("recordsStatus", "Record updated.");
    } else {
      await createRecord(values);
      showStatusMessage("recordsStatus", "Record added.");
    }
    editingId = null;
    setRecordFormMode("create");
    resetRecordForm();
    await loadAll();
  } catch (err) {
    showStatusMessage("recordsStatus", err.message, true);
  }
});

document.getElementById("recordType").addEventListener("change", toggleCompletedRow);

document.getElementById("cancelRecordEditBtn").addEventListener("click", () => {
  editingId = null;
  setRecordFormMode("create");
  resetRecordForm();
});

document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  page = 1;
  loadAll();
});

["filterPet", "filterType"].forEach((id) => {
  document.getElementById(id).addEventListener("change", () => {
    page = 1;
    loadAll();
  });
});

document.getElementById("pager").addEventListener("click", (e) => {
  if (!e.target.classList.contains("pager-btn")) return;
  page = Number(e.target.dataset.page);
  loadAll();
});

document.getElementById("upcomingList").addEventListener("click", async (e) => {
  if (!e.target.classList.contains("done-record-btn")) return;
  const record = upcoming.find((r) => r._id === e.target.dataset.id);
  if (!record) return;

  try {
    await updateRecord(record._id, toPayload(record, { completed: true }));
    showStatusMessage("recordsStatus", "Appointment marked done.");
    await loadAll();
  } catch (err) {
    showStatusMessage("recordsStatus", err.message, true);
  }
});

document.getElementById("recordsList").addEventListener("click", async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

  try {
    if (e.target.classList.contains("edit-record-btn")) {
      const record = records.find((r) => r._id === id);
      if (!record) return;
      fillRecordForm(record);
      editingId = id;
      setRecordFormMode("edit");
      document.getElementById("recordForm").scrollIntoView({ behavior: "smooth" });
    }

    if (e.target.classList.contains("delete-record-btn")) {
      if (!confirm("Delete this record? This can't be undone.")) return;
      await deleteRecord(id);
      showStatusMessage("recordsStatus", "Record deleted.");
      await loadAll();
    }
  } catch (err) {
    showStatusMessage("recordsStatus", err.message, true);
  }
});

async function init() {
  try {
    pets = await fetchMyPets(CURRENT_OWNER_ID);
  } catch (err) {
    showStatusMessage("recordsStatus", "Couldn't load pets: " + err.message, true);
    return;
  }

  if (pets.length === 0) {
    showStatusMessage("recordsStatus", "Add a pet on the My Pets page first.", true);
    document.getElementById("recordFormSubmitBtn").disabled = true;
  }

  fillPetOptions("recordPet", pets);
  fillPetOptions("filterPet", pets, "All pets");
  const petId = new window.URLSearchParams(window.location.search).get("petId");
  if (petId) document.getElementById("filterPet").value = petId;

  toggleCompletedRow();
  await loadAll();
}

init();
