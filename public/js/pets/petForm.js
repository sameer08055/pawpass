const FIELDS = [
  "name",
  "species",
  "breed",
  "feeding",
  "allergies",
  "medications",
  "vetName",
  "vetPhone",
  "notes",
];

export function readPetFormValues() {
  const values = {};
  FIELDS.forEach((field) => {
    values[field] = document.getElementById(field).value.trim();
  });
  return values;
}

export function fillPetForm(pet) {
  FIELDS.forEach((field) => {
    document.getElementById(field).value = pet[field] || "";
  });
}

export function resetPetForm() {
  document.getElementById("petForm").reset();
}

export function setFormMode(mode) {
  const submitBtn = document.getElementById("petFormSubmitBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const heading = document.getElementById("petFormHeading");

  if (mode === "edit") {
    submitBtn.textContent = "Save Changes";
    cancelBtn.hidden = false;
    heading.textContent = "Edit Pet";
  } else {
    submitBtn.textContent = "Add Pet";
    cancelBtn.hidden = true;
    heading.textContent = "Add a Pet";
  }
}
