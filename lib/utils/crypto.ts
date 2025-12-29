/**
 * Encryption/Decryption Utilities
 * For encrypting sensitive data like WordPress passwords
 */

import crypto from 'crypto';

/**
 * Get encryption key from environment
 * Must be 32 bytes (256 bits) for AES-256
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Ensure key is exactly 32 bytes
  if (key.length !== 64) { // 64 hex characters = 32 bytes
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }

  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns base64-encoded encrypted data with IV and auth tag
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();

  // Generate random initialization vector (IV)
  const iv = crypto.randomBytes(16);

  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  // Encrypt
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get auth tag
  const authTag = cipher.getAuthTag();

  // Combine IV + auth tag + encrypted data
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'hex')
  ]);

  // Return as base64
  return combined.toString('base64');
}

/**
 * Decrypt a string encrypted with encrypt()
 * Accepts base64-encoded encrypted data with IV and auth tag
 */
export function decrypt(encryptedBase64: string): string {
  const key = getEncryptionKey();

  // Decode from base64
  const combined = Buffer.from(encryptedBase64, 'base64');

  // Extract IV (first 16 bytes)
  const iv = combined.subarray(0, 16);

  // Extract auth tag (next 16 bytes)
  const authTag = combined.subarray(16, 32);

  // Extract encrypted data (remaining bytes)
  const encrypted = combined.subarray(32);

  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  // Decrypt
  let decrypted = decipher.update(encrypted, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Generate a random encryption key (for setup)
 * Returns 64 hex characters (32 bytes)
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hash a password using SHA-256
 * Useful for verifying passwords without storing plain text
 */
export function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
}
