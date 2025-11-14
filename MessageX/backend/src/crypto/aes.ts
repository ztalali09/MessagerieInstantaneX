import * as crypto from 'crypto';

export const generateAESKeyFromPassword = (password: string): Buffer => {
  return crypto.createHash('sha256').update(password).digest();
};

export const encryptPrivateKey = (privateKey: string, aesKey: Buffer): string => {
  const cipher = crypto.createCipheriv('aes-256-ecb', aesKey, Buffer.alloc(0)); // ECB mode does not use an IV
  let encryptedPrivateKey = cipher.update(privateKey, 'utf8', 'base64');
  encryptedPrivateKey += cipher.final('base64');
  return encryptedPrivateKey;
};

export const decryptPrivateKey = (encryptedPrivateKey: string, aesKey: Buffer): string => {
  const decipher = crypto.createDecipheriv('aes-256-ecb', aesKey, Buffer.alloc(0));
  let decryptedPrivateKey = decipher.update(encryptedPrivateKey, 'base64', 'utf8');
  decryptedPrivateKey += decipher.final('utf8');
  return decryptedPrivateKey;
};
