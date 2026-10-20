const BASE = "/api/health-records";

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

export async function fetchRecords({ ownerId, petId, type, q, page, limit }) {
  const params = new URLSearchParams({ ownerId, page, limit });
  if (petId) params.set("petId", petId);
  if (type) params.set("type", type);
  if (q) params.set("q", q);
  const res = await fetch(`${BASE}?${params}`);
  return handleResponse(res);
}

export async function fetchUpcoming(ownerId) {
  const res = await fetch(`${BASE}/upcoming?ownerId=${encodeURIComponent(ownerId)}`);
  return handleResponse(res);
}

export async function createRecord(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateRecord(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteRecord(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
