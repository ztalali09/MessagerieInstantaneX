import * as crypto from 'crypto';

export const generateAESKeyFromPassword = (password: string): Buffer => {
  return crypto.createHash('sha256').update(password).digest();
};

export const encryptPrivateKey = (privateKey: string, aesKey: Buffer): string => {
  // Use AES-256-CBC with a random IV and prepend the IV to the ciphertext (base64)
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
};

export const decryptPrivateKey = (encryptedPrivateKey: string, aesKey: Buffer): string => {
  // Expect format ivBase64:encryptedBase64
  const parts = encryptedPrivateKey.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted private key format');
  }
  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

export const generateRandomAESKey = (): Buffer => {
  return crypto.randomBytes(32); // 256-bit key
};

export const encryptMessage = (message: string, key: Buffer): string => {
  const iv = crypto.randomBytes(16); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(message, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  // Prepend IV to encrypted data
  return iv.toString('base64') + ':' + encrypted;
};

export const decryptMessage = (encryptedMessage: string, key: Buffer): string => {
  const parts = encryptedMessage.split(':');
  const iv = Buffer.from(parts[0], 'base64');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};
