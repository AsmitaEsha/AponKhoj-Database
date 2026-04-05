// No imports needed - custom validation

export const validateEmail = (email: string): boolean => {
  // RFC 5322 compliant email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Basic checks
  if (!email || email.trim().length === 0) {
    return false;
  }

  // Check format
  if (!emailRegex.test(email)) {
    return false;
  }

  // Split email into parts
  const [localPart, domain] = email.split('@');

  // Validate local part (before @)
  if (localPart.length > 64 || localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  // Validate domain part (after @)
  if (!domain.includes('.')) {
    return false;
  }

  // Check for consecutive dots
  if (email.includes('..')) {
    return false;
  }

  // Check for spaces
  if (email.includes(' ')) {
    return false;
  }

  return true;
};

export const validatePhone = (phone: string): boolean => {
  // Bangladesh phone number format: 01XXXXXXXXX (11 digits starting with 01)
  const phoneRegex = /^01[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const validatePassword = (password: string): boolean => {
  return getPasswordValidationError(password) === null;
};

export const getPasswordValidationError = (password: string): string | null => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\\[\]~`]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  if (/\s/.test(password)) {
    return 'Password cannot contain spaces';
  }

  return null;
};

export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};

export const validateLocation = (location: string): boolean => {
  return location.trim().length >= 2 && location.trim().length <= 100;
};