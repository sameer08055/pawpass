export function validateSitterProfile(data) {
  const errors = [];

  if (!data.sitterId || typeof data.sitterId !== "string") {
    errors.push("sitterId is required and must be a string.");
  }
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string.");
  }
  if (data.bio !== undefined && typeof data.bio !== "string") {
    errors.push("bio must be a string.");
  }
  if (data.location !== undefined && typeof data.location !== "string") {
    errors.push("location must be a string.");
  }
  if (data.lat !== undefined && data.lat !== null && typeof data.lat !== "number") {
    errors.push("lat must be a number.");
  }
  if (data.lon !== undefined && data.lon !== null && typeof data.lon !== "number") {
    errors.push("lon must be a number.");
  }
  if (data.services !== undefined) {
    if (!Array.isArray(data.services)) {
      errors.push("services must be an array.");
    } else {
      data.services.forEach((s, i) => {
        if (!s.species || typeof s.species !== "string") {
          errors.push(`services[${i}].species is required and must be a string.`);
        }
        if (typeof s.rate !== "number" || s.rate < 0) {
          errors.push(`services[${i}].rate must be a non-negative number.`);
        }
        if (s.notes !== undefined && typeof s.notes !== "string") {
          errors.push(`services[${i}].notes must be a string.`);
        }
      });
    }
  }
  if (data.availableDays !== undefined && !Array.isArray(data.availableDays)) {
    errors.push("availableDays must be an array of date strings.");
  }

  return { valid: errors.length === 0, errors };
}
