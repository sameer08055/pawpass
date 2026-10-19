// utils/geocodePincode.js
//
// Converts a pincode/ZIP code into lat/lon coordinates using OpenStreetMap's
// free Nominatim geocoding service — no API key required. This is the same
// OpenStreetMap ecosystem already used for the embedded map, just the
// "look up an address" side of it instead of the "display a map" side.
//
// Nominatim's usage policy requires a descriptive User-Agent header
// identifying the application (not a browser-looking string), and asks
// that this only be called occasionally, not on every page load — which is
// why this only runs when a sitter actually saves their profile, not on
// every request.

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
