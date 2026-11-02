export const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v?.trim() || '');
export const isValidPhone = (v) => /^[+\d\s\-()]{7,15}$/.test(v?.trim() || '');
export const isValidPassword = (v) => (v || '').length >= 6;
export const isNonEmpty = (v) => (v || '').trim().length > 0;
export const isPositiveNumber = (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0;
export const isInRange = (v, min, max) => {
  const n = parseFloat(v);
  return !isNaN(n) && n >= min && n <= max;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (!isValidPassword(password)) errors.password = 'Password must be at least 6 characters';
  return errors;
};

export const validateRegisterForm = ({ full_name, email, phone, password, confirm_password }) => {
  const errors = {};
  if (!isNonEmpty(full_name)) errors.full_name = 'Full name is required';
  if (!isValidEmail(email)) errors.email = 'Enter a valid email address';
  if (phone && !isValidPhone(phone)) errors.phone = 'Enter a valid phone number';
  if (!isValidPassword(password)) errors.password = 'Password must be at least 6 characters';
  if (password !== confirm_password) errors.confirm_password = 'Passwords do not match';
  return errors;
};

export const validatePredictionForm = (values) => {
  const errors = {};
  const fields = [
    { key: 'temperature', label: 'Temperature', min: -10, max: 60 },
    { key: 'humidity',    label: 'Humidity',    min: 0,   max: 100 },
    { key: 'moisture',    label: 'Moisture',    min: 0,   max: 100 },
    { key: 'nitrogen',    label: 'Nitrogen',    min: 0,   max: 200 },
    { key: 'phosphorous', label: 'Phosphorous', min: 0,   max: 200 },
    { key: 'potassium',   label: 'Potassium',   min: 0,   max: 200 },
  ];
  fields.forEach(({ key, label, min, max }) => {
    if (!isNonEmpty(String(values[key] ?? ''))) {
      errors[key] = `${label} is required`;
    } else if (!isInRange(values[key], min, max)) {
      errors[key] = `${label} must be between ${min}–${max}`;
    }
  });
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;
