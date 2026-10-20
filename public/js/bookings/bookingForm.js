export function readBookingFormValues() {
  return {
    petName: document.getElementById("petName").value.trim(),
    ownerContact: document.getElementById("ownerContact").value.trim(),
    quickFactsLink: document.getElementById("quickFactsLink").value.trim(),
    dateRange: {
      start: document.getElementById("startDate").value,
      end: document.getElementById("endDate").value,
    },
    notes: document.getElementById("notes").value.trim(),
  };
}

export function fillBookingForm(booking) {
  document.getElementById("petName").value = booking.petName || "";
  document.getElementById("ownerContact").value = booking.ownerContact || "";
  document.getElementById("quickFactsLink").value = booking.quickFactsLink || "";
  document.getElementById("startDate").value =
    booking.dateRange?.start?.slice(0, 10) || "";
  document.getElementById("endDate").value = booking.dateRange?.end?.slice(0, 10) || "";
  document.getElementById("notes").value = booking.notes || "";
}

export function resetBookingForm() {
  document.getElementById("bookingForm").reset();
}

export function setFormMode(mode) {
  const submitBtn = document.getElementById("bookingFormSubmitBtn");
  const cancelBtn = document.getElementById("cancelEditBtn");
  const heading = document.getElementById("bookingFormHeading");

  if (mode === "edit") {
    submitBtn.textContent = "Save Changes";
    cancelBtn.classList.remove("hidden");
    heading.textContent = "Edit Sit";
  } else {
    submitBtn.textContent = "Log Sit";
    cancelBtn.classList.add("hidden");
    heading.textContent = "Log a New Sit";
  }
}
