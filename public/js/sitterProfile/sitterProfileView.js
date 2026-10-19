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
  document.getElementById("pincode").value = profile?.pincode || "";
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
      <span class="service-location">${escapeHTML(s.location || "Either")}</span>
      <span class="service-notes">${escapeHTML(s.notes)}</span>
      <button type="button" class="edit-service-btn" data-species="${escapeHTML(s.species)}">Edit</button>
      <button type="button" class="remove-service-btn" data-species="${escapeHTML(s.species)}">Remove</button>
    `;
    list.appendChild(li);
  });
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function renderMonthLabel(year, month) {
  document.getElementById("calendarMonthLabel").textContent =
    `${MONTH_NAMES[month]} ${year}`;
}

// Builds the grid for a given year/month. Each day is a <button> (not a
// div) so it's keyboard-accessible and uses a real interactive element,
// per the "no non-standard tags for standard components" requirement.
// availableDays is an array of { date, allDay, startTime?, endTime? }.
export function renderAvailabilityCalendar(year, month, availableDays, editingDate) {
  renderMonthLabel(year, month);

  const grid = document.getElementById("availabilityGrid");
  grid.innerHTML = "";

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDate = new Map((availableDays || []).map((d) => [d.date, d]));

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = new Date(year, month, day).toISOString().slice(0, 10);
    const entry = byDate.get(dateStr);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day-cell";
    btn.dataset.date = dateStr;
    btn.textContent = day;

    if (entry) {
      btn.classList.add("available");
      if (entry.allDay === false) btn.classList.add("custom-time");
    }
    if (dateStr === editingDate) btn.classList.add("editing");

    grid.appendChild(btn);
  }
}

export function renderDayEditor(dateStr, entry) {
  const editor = document.getElementById("dayEditor");
  if (!dateStr) {
    editor.classList.add("hidden");
    return;
  }
  editor.classList.remove("hidden");

  const label = new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  document.getElementById("dayEditorLabel").textContent = `Editing: ${label}`;

  const isCustom = entry?.allDay === false;
  document.getElementById("dayModeAllDay").checked = !isCustom;
  document.getElementById("dayModeCustom").checked = isCustom;
  document.getElementById("dayTimeInputs").classList.toggle("hidden", !isCustom);
  document.getElementById("dayStartTime").value = entry?.startTime || "09:00";
  document.getElementById("dayEndTime").value = entry?.endTime || "17:00";
}

export function renderDashboard(profile) {
  const noProfileEl = document.getElementById("dashboardNoProfile");
  const summaryEl = document.getElementById("dashboardSummary");

  if (!profile) {
    noProfileEl.classList.remove("hidden");
    summaryEl.classList.add("hidden");
    return;
  }

  noProfileEl.classList.add("hidden");
  summaryEl.classList.remove("hidden");

  document.getElementById("summaryName").textContent = profile.name;
  const locationParts = [profile.location, profile.pincode].filter(Boolean);
  document.getElementById("summaryLocation").textContent = locationParts.length
    ? locationParts.join(" · ")
    : "Location not set";
  document.getElementById("summaryBio").textContent = profile.bio || "";

  const servicesList = document.getElementById("summaryServices");
  servicesList.innerHTML = "";
  if (!profile.services || profile.services.length === 0) {
    servicesList.innerHTML = '<li class="empty-note">No services added yet.</li>';
  } else {
    profile.services.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = `${s.species} — $${s.rate}/day — ${s.location || "Either"}`;
      servicesList.appendChild(li);
    });
  }

  const availCount = profile.availableDays?.length || 0;
  document.getElementById("summaryAvailability").textContent =
    availCount === 0
      ? "No available days marked yet this month."
      : `${availCount} day${availCount === 1 ? "" : "s"} marked available this month.`;
}

export function showStatusMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = isError ? "status-message error" : "status-message success";
  el.classList.add("shown");
  setTimeout(() => el.classList.remove("shown"), 3000);
}
