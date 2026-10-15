// public/js/bookings/bookingsView.js

const STATUS_OPTIONS = ["requested", "confirmed", "completed", "cancelled"];

function escapeHTML(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatDate(isoStr) {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function renderBookings(bookings) {
  const list = document.getElementById("bookingsList");
  list.innerHTML = "";

  if (!bookings || bookings.length === 0) {
    list.innerHTML = '<li class="empty-note">No sits logged yet.</li>';
    return;
  }

  bookings.forEach((b) => {
    const li = document.createElement("li");
    li.className = `booking-card status-${b.status}`;
    li.dataset.id = b._id;

    li.innerHTML = `
      <div class="booking-main">
        <p class="booking-pet">${escapeHTML(b.petName)}</p>
        <p class="booking-dates">${formatDate(b.dateRange?.start)} &ndash; ${formatDate(b.dateRange?.end)}</p>
        ${b.ownerContact ? `<p class="booking-detail">Contact: ${escapeHTML(b.ownerContact)}</p>` : ""}
        ${
          b.quickFactsLink
            ? `<p class="booking-detail">Quick Facts: <a href="${escapeHTML(b.quickFactsLink)}" target="_blank" rel="noopener">${escapeHTML(b.quickFactsLink)}</a></p>`
            : ""
        }
        ${b.notes ? `<p class="booking-detail booking-notes">${escapeHTML(b.notes)}</p>` : ""}
      </div>
      <div class="booking-actions">
        <label class="status-label" for="status-${b._id}">Status</label>
        <select id="status-${b._id}" class="status-select" data-id="${b._id}">
          ${STATUS_OPTIONS.map(
            (s) =>
              `<option value="${s}" ${s === b.status ? "selected" : ""}>${s}</option>`,
          ).join("")}
        </select>
        <button type="button" class="edit-booking-btn" data-id="${b._id}">Edit</button>
        <button type="button" class="delete-booking-btn" data-id="${b._id}">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

export function showStatusMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = isError ? "status-message error" : "status-message success";
  el.classList.add("shown");
  setTimeout(() => el.classList.remove("shown"), 3000);
}
