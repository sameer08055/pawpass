export function escapeHTML(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function showStatusMessage(elementId, message, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = isError ? "status-message error" : "status-message success";
  el.classList.add("shown");
  window.setTimeout(() => el.classList.remove("shown"), 3000);
}

function shareUrl(token) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}?share=${token}`;
}

export function renderPets(pets) {
  const list = document.getElementById("petsList");
  list.innerHTML = "";

  if (!pets || pets.length === 0) {
    list.innerHTML = '<li class="empty-note">No pets yet. Add your first pet above.</li>';
    return;
  }

  pets.forEach((p) => {
    const li = document.createElement("li");
    li.className = "pet-card";

    const subtitle = [p.species, p.breed].filter(Boolean).join(", ");
    const shareBox = p.shareToken
      ? `<label for="share-${p._id}">Quick Facts link</label>
         <input id="share-${p._id}" type="text" readonly value="${escapeHTML(shareUrl(p.shareToken))}" />`
      : "";
    const shareButton = p.shareToken
      ? `<button type="button" class="remove-link-btn" data-id="${p._id}">Turn off link</button>`
      : `<button type="button" class="create-link-btn" data-id="${p._id}">Create link</button>`;

    li.innerHTML = `
      <div class="pet-main">
        <p class="pet-name">${escapeHTML(p.name)}</p>
        <p class="pet-detail">${escapeHTML(subtitle)}</p>
        ${p.feeding ? `<p class="pet-detail">Feeding: ${escapeHTML(p.feeding)}</p>` : ""}
        ${shareBox}
      </div>
      <div class="pet-actions">
        <a class="link-btn" href="pet-health.html?petId=${p._id}">Health records</a>
        <button type="button" class="edit-pet-btn" data-id="${p._id}">Edit</button>
        <button type="button" class="delete-pet-btn" data-id="${p._id}">Delete</button>
        ${shareButton}
      </div>
    `;
    list.appendChild(li);
  });
}

export function renderSharedPet(pet) {
  const rows = [
    ["Feeding", pet.feeding],
    ["Allergies", pet.allergies],
    ["Medications", pet.medications],
    ["Vet", [pet.vetName, pet.vetPhone].filter(Boolean).join(", ")],
    ["Notes", pet.notes],
  ].filter(([, value]) => value);

  const subtitle = [pet.species, pet.breed].filter(Boolean).join(", ");
  document.getElementById("sharedCard").innerHTML = `
    <h2>${escapeHTML(pet.name)}</h2>
    <p class="pet-detail">${escapeHTML(subtitle)}</p>
    <dl class="facts">
      ${rows
        .map(([label, value]) => `<dt>${label}</dt><dd>${escapeHTML(value)}</dd>`)
        .join("")}
    </dl>
  `;
}
