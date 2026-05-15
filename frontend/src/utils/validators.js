export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePassword = (password) =>
  password.length >= 8;

export const validateName = (name) =>
  name.trim().length >= 2;

export const validatePasswordStrength = (password) => {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLong = password.length >= 8;

  const score = [hasUpper, hasLower, hasNumber, hasSpecial, isLong].filter(Boolean).length;

  if (score <= 2) return { strength: 'weak', color: 'red', score };
  if (score === 3) return { strength: 'fair', color: 'yellow', score };
  if (score === 4) return { strength: 'good', color: 'blue', score };
  return { strength: 'strong', color: 'green', score };
};
