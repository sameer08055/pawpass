// public/js/sitterProfile/sitterProfileView.js

function escapeHTML(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function renderProfileForm(profile) {
  document.getElementById("name").value = profile?.name || "";
  document.getElementById("bio").value = profile?.bio || "";
  document.getElementById("location").value = profile?.location || "";
  document.getElementById("lat").value = profile?.lat ?? "";
  document.getElementById("lon").value = profile?.lon ?? "";
}

export function renderServices(services) {
  const list = document.getElementById("servicesList");
  list.innerHTML = "";

  if (!services || services.length === 0) {
    list.innerHTML = '<li class="empty-note">No services added yet.</li>';
    return;
  }

  services.forEach((s) => {
    const li = document.createElement("li");
    li.className = "service-item";
    li.innerHTML = `
      <span class="service-species">${escapeHTML(s.species)}</span>
      <span class="service-rate">$${escapeHTML(s.rate)}/day</span>
      <span class="service-notes">${escapeHTML(s.notes)}</span>
      <button type="button" class="remove-service-btn" data-species="${escapeHTML(s.species)}">Remove</button>
    `;
    list.appendChild(li);
  });
}

// Builds a simple grid for the current calendar month. Each day is a
// <button> (not a div) so it's keyboard-accessible and uses a real
// interactive element, per the "no non-standard tags for standard
// components" requirement.
export function renderAvailabilityCalendar(availableDays) {
  const grid = document.getElementById("availabilityGrid");
  grid.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableSet = new Set(availableDays || []);

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month, day).toISOString().slice(0, 10);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-cell";
    btn.dataset.date = dateStr;
    btn.textContent = day;
    if (availableSet.has(dateStr)) btn.classList.add("available");
    grid.appendChild(btn);
  }
}

export function showStatusMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = isError ? "status-message error" : "status-message success";
  el.classList.add("shown");
  setTimeout(() => el.classList.remove("shown"), 3000);
}
