import crypto from 'crypto';

/**
 * Generate a unique anonymous ID
 * @returns {string} 8-character alphanumeric anonymous ID
 */
export const generateAnonymousId = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

/**
 * Generate a unique anonymous ID with timestamp to ensure uniqueness
 * @returns {string} Anonymous ID with timestamp
 */
export const generateUniqueAnonymousId = () => {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${timestamp}${random}`;
};

/**
 * Validate if an anonymous ID format is correct
 * @param {string} anonId - The anonymous ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidAnonymousId = (anonId) => {
  if (!anonId || typeof anonId !== 'string') return false;
  // Check if it's alphanumeric and at least 6 characters
  return /^[A-Z0-9]{6,}$/.test(anonId);
};

/**
 * Create a hash of the anonymous ID for additional security
 * @param {string} anonId - The anonymous ID to hash
 * @returns {string} SHA-256 hash of the anonymous ID
 */
export const hashAnonymousId = (anonId) => {
  return crypto.createHash('sha256').update(anonId).digest('hex');
};

/**
 * Generate a new anonymous ID and return both the ID and its hash
 * @returns {object} Object containing anonId and hash
 */
export const generateAnonymousIdWithHash = () => {
  const anonId = generateAnonymousId();
  const hash = hashAnonymousId(anonId);
  return { anonId, hash };
};
