import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Generates a secure random password with:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Minimum length of 12 characters
 */
export function generateSecurePassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  // Get one of each required character type
  const getRandomChar = (str: string) => str[crypto.randomInt(str.length)];
  const pass = [
    getRandomChar(uppercase),
    getRandomChar(lowercase),
    getRandomChar(numbers),
    getRandomChar(special),
  ];

  // Add 8 more random characters
  const allChars = uppercase + lowercase + numbers + special;
  for (let i = 0; i < 8; i++) {
    pass.push(getRandomChar(allChars));
  }

  // Shuffle the array
  for (let i = pass.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [pass[i], pass[j]] = [pass[j], pass[i]];
  }

  return pass.join('');
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a password reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
