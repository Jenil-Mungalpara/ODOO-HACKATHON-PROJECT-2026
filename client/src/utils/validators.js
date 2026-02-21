/**
 * Validate email format.
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength (min 6 chars).
 */
export function isValidPassword(password) {
  return password && password.length >= 6;
}

/**
 * Validate required fields. Returns array of missing field names.
 */
export function validateRequired(data, fields) {
  const missing = [];
  for (const field of fields) {
    const value = data[field.key ?? field];
    if (value === undefined || value === null || value === '') {
      missing.push(field.label ?? field);
    }
  }
  return missing;
}

/**
 * Validate cargo weight against vehicle capacity.
 */
export function validateCargoWeight(cargoKg, vehicleCapacityKg) {
  if (Number(cargoKg) > Number(vehicleCapacityKg)) {
    return `Cargo weight (${cargoKg} kg) exceeds vehicle max capacity of ${vehicleCapacityKg} kg.`;
  }
  return null;
}

/**
 * Validate license is not expired.
 */
export function validateLicenseExpiry(expiryDate) {
  if (!expiryDate) return 'License expiry date is required.';
  if (new Date(expiryDate) < new Date()) {
    return 'Driver license has expired.';
  }
  return null;
}

/**
 * Validate a number is positive.
 */
export function isPositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Form-level validator: validate all rules and return errors array.
 */
export function validateForm(rules) {
  const errors = [];
  for (const { check, message } of rules) {
    if (!check) errors.push(message);
  }
  return errors;
}
