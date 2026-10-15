const VALID_STATUSES = ["requested", "confirmed", "completed", "cancelled"];

export function validateBooking(data) {
  const errors = [];

  if (!data.sitterId || typeof data.sitterId !== "string") {
    errors.push("sitterId is required and must be a string.");
  }
  if (
    !data.petName ||
    typeof data.petName !== "string" ||
    data.petName.trim().length === 0
  ) {
    errors.push("petName is required and must be a non-empty string.");
  }
  if (data.ownerContact !== undefined && typeof data.ownerContact !== "string") {
    errors.push("ownerContact must be a string.");
  }
  if (data.quickFactsLink !== undefined && typeof data.quickFactsLink !== "string") {
    errors.push("quickFactsLink must be a string.");
  }

  if (!data.dateRange || typeof data.dateRange !== "object") {
    errors.push("dateRange is required and must be an object with start and end.");
  } else {
    const { start, end } = data.dateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (!start || isNaN(startDate.getTime())) {
      errors.push("dateRange.start must be a valid date.");
    }
    if (!end || isNaN(endDate.getTime())) {
      errors.push("dateRange.end must be a valid date.");
    }
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
      errors.push("dateRange.start must be on or before dateRange.end.");
    }
  }

  if (data.notes !== undefined && typeof data.notes !== "string") {
    errors.push("notes must be a string.");
  }

  return { valid: errors.length === 0, errors };
}

export function validateStatus(status) {
  if (!VALID_STATUSES.includes(status)) {
    return {
      valid: false,
      errors: [`status must be one of: ${VALID_STATUSES.join(", ")}`],
    };
  }
  return { valid: true, errors: [] };
}
