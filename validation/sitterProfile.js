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
  if (data.pincode !== undefined && typeof data.pincode !== "string") {
    errors.push("pincode must be a string.");
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
        if (s.location !== undefined && typeof s.location !== "string") {
          errors.push(`services[${i}].location must be a string.`);
        }
      });
    }
  }

  // availableDays: [{ date: "2026-10-19", allDay: true }]
  // or              [{ date: "2026-10-19", allDay: false, startTime: "09:00", endTime: "17:00" }]
  if (data.availableDays !== undefined) {
    if (!Array.isArray(data.availableDays)) {
      errors.push("availableDays must be an array.");
    } else {
      data.availableDays.forEach((d, i) => {
        if (!d.date || typeof d.date !== "string") {
          errors.push(`availableDays[${i}].date is required and must be a string.`);
        }
        if (typeof d.allDay !== "boolean") {
          errors.push(`availableDays[${i}].allDay is required and must be a boolean.`);
        }
        if (d.allDay === false) {
          if (!d.startTime || typeof d.startTime !== "string") {
            errors.push(
              `availableDays[${i}].startTime is required when allDay is false.`,
            );
          }
          if (!d.endTime || typeof d.endTime !== "string") {
            errors.push(`availableDays[${i}].endTime is required when allDay is false.`);
          }
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
