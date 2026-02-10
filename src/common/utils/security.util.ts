/**
 * Security utility functions for handling sensitive data
 */

/**
 * Masks a password showing only the last few characters
 * @param password - The plain text password
 * @param visibleChars - Number of characters to show at the end (default: 4)
 * @returns Masked password string (e.g., "********word") or undefined if no password
 */
export function maskPassword(password: string | null | undefined, visibleChars: number = 4): string | undefined {
  if (!password) {
    return undefined;
  }
  
  if (password.length <= visibleChars) {
    // If password is shorter than visible chars, mask entirely
    return '*'.repeat(password.length);
  }
  
  const maskedPart = '*'.repeat(password.length - visibleChars);
  const visiblePart = password.slice(-visibleChars);
  return maskedPart + visiblePart;
}

/**
 * Generates a random temporary password
 * @param length - Length of the password (default: 12)
 * @returns A random password containing letters, numbers, and special characters
 */
export function generateTempPassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed I, O to avoid confusion
  const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Removed i, l, o to avoid confusion
  const numbers = '23456789'; // Removed 0, 1 to avoid confusion
  const special = '@#$%&*!';
  
  const allChars = uppercase + lowercase + numbers + special;
  
  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
