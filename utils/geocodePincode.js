const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export async function geocodePincode(pincode, countryCode = "us") {
  if (!pincode) return null;

  const params = new URLSearchParams({
    postalcode: pincode,
    country: countryCode,
    format: "json",
    limit: "1",
  });

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        "User-Agent":
          "PawPass-ClassProject/1.0 (Northeastern University Web Dev course project)",
      },
    });

    if (!res.ok) return null;

    const results = await res.json();
    if (!results.length) return null;

    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
  } catch (err) {
    console.error("Geocoding failed:", err.message);
    return null;
  }
}
