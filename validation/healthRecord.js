export const RECORD_TYPES = [
  "vaccine",
  "vet visit",
  "medication",
  "appointment",
  "weight",
];

export function validateHealthRecord(data) {
  const errors = [];

  if (!data.ownerId || typeof data.ownerId !== "string") {
    errors.push("ownerId is required and must be a string.");
  }
  if (!data.petId || typeof data.petId !== "string") {
    errors.push("petId is required and must be a string.");
  }
  if (!RECORD_TYPES.includes(data.type)) {
    errors.push(`type must be one of: ${RECORD_TYPES.join(", ")}`);
  }
  if (!data.title || typeof data.title !== "string" || data.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string.");
  }
  if (
    typeof data.date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    Number.isNaN(new Date(data.date).getTime())
  ) {
    errors.push("date must be a valid date (YYYY-MM-DD).");
  }
  if (data.notes !== undefined && typeof data.notes !== "string") {
    errors.push("notes must be a string.");
  }
  if (data.completed !== undefined && typeof data.completed !== "boolean") {
    errors.push("completed must be true or false.");
  }

  return { valid: errors.length === 0, errors };
}
