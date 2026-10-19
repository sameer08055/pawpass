export function readProfileFormValues() {
  return {
    name: document.getElementById("name").value.trim(),
    bio: document.getElementById("bio").value.trim(),
    location: document.getElementById("location").value.trim(),
    pincode: document.getElementById("pincode").value.trim(),
  };
}

export function readServiceFormValues() {
  const species = document.getElementById("newServiceSpecies").value;
  const rate = Number(document.getElementById("newServiceRate").value);
  const location = document.getElementById("newServiceLocation").value;
  const notes = document.getElementById("newServiceNotes").value.trim();
  return { species, rate, location, notes };
}

export function fillServiceForm(service) {
  document.getElementById("newServiceSpecies").value = service.species;
  document.getElementById("newServiceRate").value = service.rate;
  document.getElementById("newServiceLocation").value = service.location || "Either";
  document.getElementById("newServiceNotes").value = service.notes || "";
}

export function clearServiceForm() {
  document.getElementById("newServiceRate").value = "";
  document.getElementById("newServiceLocation").value = "Either";
  document.getElementById("newServiceNotes").value = "";
}

export function setServiceFormMode(mode) {
  const submitBtn = document.getElementById("serviceFormSubmitBtn");
  const cancelBtn = document.getElementById("cancelServiceEditBtn");

  if (mode === "edit") {
    submitBtn.textContent = "Save Service";
    cancelBtn.classList.remove("hidden");
  } else {
    submitBtn.textContent = "Add Service";
    cancelBtn.classList.add("hidden");
  }
}
