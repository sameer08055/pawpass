export function readProfileFormValues() {
  const lat = document.getElementById("lat").value;
  const lon = document.getElementById("lon").value;
  return {
    name: document.getElementById("name").value.trim(),
    bio: document.getElementById("bio").value.trim(),
    location: document.getElementById("location").value.trim(),
    lat: lat === "" ? null : Number(lat),
    lon: lon === "" ? null : Number(lon),
  };
}

export function readNewServiceValues() {
  const species = document.getElementById("newServiceSpecies").value;
  const rate = Number(document.getElementById("newServiceRate").value);
  const notes = document.getElementById("newServiceNotes").value.trim();
  return { species, rate, notes };
}

export function clearNewServiceForm() {
  document.getElementById("newServiceRate").value = "";
  document.getElementById("newServiceNotes").value = "";
}
