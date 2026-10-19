const BASE = "/api/sitter-profiles";

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      body.error || body.errors?.join(", ") || `Request failed (${res.status})`,
    );
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchMyProfile(sitterId) {
  const res = await fetch(`${BASE}?sitterId=${encodeURIComponent(sitterId)}`);
  const profiles = await handleResponse(res);
  return profiles[0] || null;
}

export async function createProfile(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateProfile(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function addService(id, service) {
  const res = await fetch(`${BASE}/${id}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(service),
  });
  return handleResponse(res);
}

export async function updateService(id, oldSpecies, service) {
  const res = await fetch(`${BASE}/${id}/services/${encodeURIComponent(oldSpecies)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(service),
  });
  return handleResponse(res);
}

export async function removeService(id, species) {
  const res = await fetch(`${BASE}/${id}/services/${encodeURIComponent(species)}`, {
    method: "DELETE",
  });
  return handleResponse(res);
}

export async function updateAvailability(id, availableDays) {
  const res = await fetch(`${BASE}/${id}/availability`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ availableDays }),
  });
  return handleResponse(res);
}
