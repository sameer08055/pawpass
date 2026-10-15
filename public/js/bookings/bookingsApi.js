// public/js/bookings/bookingsApi.js

const BASE = "/api/bookings";

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

export async function fetchMyBookings(sitterId) {
  const res = await fetch(`${BASE}?sitterId=${encodeURIComponent(sitterId)}`);
  return handleResponse(res);
}

export async function createBooking(data) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateBooking(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateBookingStatus(id, status) {
  const res = await fetch(`${BASE}/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return handleResponse(res);
}

export async function deleteBooking(id) {
  const res = await fetch(`${BASE}/${id}`, { method: "DELETE" });
  return handleResponse(res);
}
