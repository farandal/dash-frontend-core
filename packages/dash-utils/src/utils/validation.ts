/**
 * Common validation utilities
 */

/**
 * Email validation regex pattern
 * RFC 5322 compliant email validation
 */
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Validate email address
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
};

/**
 * Phone number validation regex (basic international format)
 */
export const PHONE_REGEX = /^\+?[\d\s\-()]{7,20}$/;

/**
 * Validate phone number
 * @param phone - Phone string to validate
 * @returns boolean indicating if phone is valid
 */
export const validatePhone = (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    return PHONE_REGEX.test(phone.trim());
};

/**
 * URL validation regex
 */
export const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

/**
 * Validate URL
 * @param url - URL string to validate
 * @returns boolean indicating if URL is valid
 */
export const validateUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    return URL_REGEX.test(url.trim());
};

/**
 * Password strength levels
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Check password strength
 * @param password - Password to check
 * @returns Password strength level
 */
export const checkPasswordStrength = (password: string): PasswordStrength => {
    if (!password) return 'weak';

    let score = 0;

    // Length checks
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character type checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return 'weak';
    if (score <= 3) return 'fair';
    if (score <= 4) return 'good';
    return 'strong';
};

/**
 * Validate required field
 * @param value - Value to check
 * @returns boolean indicating if value is not empty
 */
export const validateRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
};

/**
 * Validate minimum length
 * @param value - String to check
 * @param minLength - Minimum length required
 * @returns boolean indicating if value meets minimum length
 */
export const validateMinLength = (value: string, minLength: number): boolean => {
    if (!value || typeof value !== 'string') return false;
    return value.trim().length >= minLength;
};

/**
 * Validate maximum length
 * @param value - String to check
 * @param maxLength - Maximum length allowed
 * @returns boolean indicating if value is within maximum length
 */
export const validateMaxLength = (value: string, maxLength: number): boolean => {
    if (!value || typeof value !== 'string') return true; // Empty is valid for max check
    return value.trim().length <= maxLength;
};

/**
 * RUT (Chilean ID) validation
 */
export const validateRut = (rut: string): boolean => {
    if (!rut || typeof rut !== 'string') return false;

    // Clean the RUT
    const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();

    if (cleanRut.length < 2) return false;

    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Calculate verification digit
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body[i], 10) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const calculatedDv = 11 - (sum % 11);
    let expectedDv: string;

    if (calculatedDv === 11) expectedDv = '0';
    else if (calculatedDv === 10) expectedDv = 'K';
    else expectedDv = calculatedDv.toString();

    return dv === expectedDv;
};
