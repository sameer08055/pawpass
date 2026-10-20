const SPECIES = ["Dog", "Cat", "Rabbit", "Other"];
const TEXT_FIELDS = [
  "breed",
  "feeding",
  "allergies",
  "medications",
  "vetName",
  "vetPhone",
  "notes",
];

export function validatePet(data) {
  const errors = [];

  if (!data.ownerId || typeof data.ownerId !== "string") {
    errors.push("ownerId is required and must be a string.");
  }
  if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("name is required and must be a non-empty string.");
  }
  if (!SPECIES.includes(data.species)) {
    errors.push(`species must be one of: ${SPECIES.join(", ")}`);
  }
  TEXT_FIELDS.forEach((field) => {
    if (data[field] !== undefined && typeof data[field] !== "string") {
      errors.push(`${field} must be a string.`);
    }
  });

  return { valid: errors.length === 0, errors };
}
