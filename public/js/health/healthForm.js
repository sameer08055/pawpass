import { escapeHTML } from "../pets/petsView.js";

export function fillPetOptions(selectId, pets, allLabel) {
  const options = pets.map((p) => {
    const label = `${escapeHTML(p.name)} (${escapeHTML(p.species)})`;
    return `<option value="${p._id}">${label}</option>`;
  });
  if (allLabel) options.unshift(`<option value="">${allLabel}</option>`);
  document.getElementById(selectId).innerHTML = options.join("");
}

export function readRecordFormValues() {
  return {
    petId: document.getElementById("recordPet").value,
    type: document.getElementById("recordType").value,
    title: document.getElementById("recordTitle").value.trim(),
    date: document.getElementById("recordDate").value,
    notes: document.getElementById("recordNotes").value.trim(),
    completed: document.getElementById("recordCompleted").checked,
  };
}

export function fillRecordForm(record) {
  document.getElementById("recordPet").value = record.petId;
  document.getElementById("recordType").value = record.type;
  document.getElementById("recordTitle").value = record.title || "";
  document.getElementById("recordDate").value = record.date || "";
  document.getElementById("recordNotes").value = record.notes || "";
  document.getElementById("recordCompleted").checked = record.completed === true;
  toggleCompletedRow();
}

export function resetRecordForm() {
  document.getElementById("recordForm").reset();
  toggleCompletedRow();
}

export function toggleCompletedRow() {
  const isAppointment = document.getElementById("recordType").value === "appointment";
  document.getElementById("completedRow").classList.toggle("hidden", !isAppointment);
}

export function setRecordFormMode(mode) {
  const submitBtn = document.getElementById("recordFormSubmitBtn");
  const cancelBtn = document.getElementById("cancelRecordEditBtn");
  const heading = document.getElementById("recordFormHeading");
  const petSelect = document.getElementById("recordPet");

  if (mode === "edit") {
    submitBtn.textContent = "Save Changes";
    cancelBtn.classList.remove("hidden");
    heading.textContent = "Edit Record";
    petSelect.disabled = true;
  } else {
    submitBtn.textContent = "Add Record";
    cancelBtn.classList.add("hidden");
    heading.textContent = "Add a Record";
    petSelect.disabled = false;
  }
}
