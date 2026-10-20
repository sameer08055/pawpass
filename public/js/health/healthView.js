import { escapeHTML } from "../pets/petsView.js";

function parseDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateStr) {
  return parseDate(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getUrgency(dateStr) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((parseDate(dateStr) - today) / 86400000);

  if (days < 0) return { key: "overdue", label: "Overdue" };
  if (days === 0) return { key: "today", label: "Today" };
  const label = `In ${days} day${days === 1 ? "" : "s"}`;
  if (days <= 3) return { key: "soon", label };
  if (days <= 14) return { key: "upcoming", label };
  return { key: "later", label };
}

function badge(record) {
  const urgency = getUrgency(record.date);
  return `<span class="badge urgency-${urgency.key}">${urgency.label}</span>`;
}

export function renderUpcoming(appointments, petName) {
  const list = document.getElementById("upcomingList");
  list.innerHTML = "";

  if (!appointments || appointments.length === 0) {
    list.innerHTML = '<li class="empty-note">No upcoming appointments.</li>';
    return;
  }

  appointments.forEach((r) => {
    const li = document.createElement("li");
    li.className = `record-card urgency-border-${getUrgency(r.date).key}`;
    li.innerHTML = `
      <div class="record-main">
        <p class="record-title">${escapeHTML(r.title)}</p>
        <p class="record-detail">${escapeHTML(petName(r.petId))} | ${formatDate(r.date)}</p>
      </div>
      <div class="record-actions">
        ${badge(r)}
        <button type="button" class="done-record-btn" data-id="${r._id}">Mark done</button>
      </div>
    `;
    list.appendChild(li);
  });
}

export function renderRecords(records, petName) {
  const list = document.getElementById("recordsList");
  list.innerHTML = "";

  if (!records || records.length === 0) {
    list.innerHTML = '<li class="empty-note">No records match your search.</li>';
    return;
  }

  records.forEach((r) => {
    const li = document.createElement("li");
    li.className = "record-card";
    li.innerHTML = `
      <div class="record-main">
        <p class="record-title">${escapeHTML(r.title)}</p>
        <p class="record-detail">${escapeHTML(r.type)} | ${escapeHTML(petName(r.petId))} | ${formatDate(r.date)}</p>
        ${r.notes ? `<p class="record-detail record-notes">${escapeHTML(r.notes)}</p>` : ""}
      </div>
      <div class="record-actions">
        ${r.type === "appointment" && !r.completed ? badge(r) : ""}
        <button type="button" class="edit-record-btn" data-id="${r._id}">Edit</button>
        <button type="button" class="delete-record-btn" data-id="${r._id}">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

export function renderPager({ page, limit, total }) {
  const pages = Math.max(1, Math.ceil(total / limit));
  document.getElementById("pager").innerHTML = `
    <button type="button" class="pager-btn" data-page="${page - 1}" ${page <= 1 ? "disabled" : ""}>Previous</button>
    <span>Page ${page} of ${pages} (${total} records)</span>
    <button type="button" class="pager-btn" data-page="${page + 1}" ${page >= pages ? "disabled" : ""}>Next</button>
  `;
}
