const BASE = "/api/pets";

export const CURRENT_OWNER_ID = "priya-demo";

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

export async function fetchMyPets(ownerId) {
  const res = await fetch(`${BASE}?ownerId=${encodeURIComponent(ownerId)}`);
  return handleResponse(res);
}

export async function createPet(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updatePet(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deletePet(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}

export async function createShareLink(id) {
  const res = await fetch(`${BASE}/${id}/share`, { method: "POST" });
  return handleResponse(res);
}

export async function removeShareLink(id) {
  const res = await fetch(`${BASE}/${id}/share`, { method: "DELETE" });
  return handleResponse(res);
}

export async function fetchSharedPet(token) {
  const res = await fetch(`${BASE}/shared/${encodeURIComponent(token)}`);
  return handleResponse(res);
}
