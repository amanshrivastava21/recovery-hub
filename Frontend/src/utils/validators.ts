// ─── Phone Validation ───────────────────────────────────────
export const validatePhone = (phone: string): { valid: boolean; message: string } => {
  // Strip +91 country code if present
  const cleanPhone = phone.replace(/^\+91/, '').trim();

  // Check if exactly 10 digits
  if (cleanPhone.length !== 10) {
    return { valid: false, message: 'Phone number must be exactly 10 digits' };
  }

  // Check if all characters are digits
  if (!/^\d+$/.test(cleanPhone)) {
    return { valid: false, message: 'Phone number must contain only digits' };
  }

  // Check if starts with 6, 7, 8, or 9 (valid Indian mobile)
  if (!/^[6-9]/.test(cleanPhone)) {
    return { valid: false, message: 'Please enter a valid 10-digit Indian mobile number' };
  }

  return { valid: true, message: '' };
};

// ─── Password Validation ────────────────────────────────────
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  // Check length
  if (password.length < 8 || password.length > 16) {
    return { valid: false, message: 'Password must be 8-16 characters' };
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Must contain at least one uppercase letter' };
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Must contain at least one lowercase letter' };
  }

  // Check for number
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Must contain at least one number' };
  }

  // Check for special character
  if (!/[-@#$%^&*!_+]/.test(password)) {
    return { valid: false, message: 'Must contain at least one special character (- @ # $ % ^ & * ! _ +)' };
  }

  return { valid: true, message: '' };
};

// ─── Password Strength Assessment ───────────────────────────
export const validatePasswordStrength = (
  password: string
): { score: number; label: 'Weak' | 'Fair' | 'Strong' | 'Very Strong'; color: string } => {
  if (!password) {
    return { score: 0, label: 'Weak', color: 'bg-red-500' };
  }

  let score = 0;

  // Length points
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character variety points
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[-@#$%^&*!_+]/.test(password)) score += 1;

  // Determine strength label and color
  if (score <= 2) {
    return { score: 1, label: 'Weak', color: 'bg-red-500' };
  } else if (score <= 4) {
    return { score: 2, label: 'Fair', color: 'bg-yellow-500' };
  } else if (score <= 6) {
    return { score: 3, label: 'Strong', color: 'bg-blue-500' };
  } else {
    return { score: 4, label: 'Very Strong', color: 'bg-green-500' };
  }
};
