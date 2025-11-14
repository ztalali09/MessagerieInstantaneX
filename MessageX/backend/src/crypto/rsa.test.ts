
import { describe, it, expect } from 'vitest';
import { generateRSAKeyPair, encryptWithPublicKey, decryptWithPrivateKey } from './rsa';

describe('RSA Encryption and Decryption', () => {
  it('should encrypt and decrypt a message successfully', () => {
    const { publicKey, privateKey } = generateRSAKeyPair();
    const message = 'This is a secret message.';

    const encryptedMessage = encryptWithPublicKey(message, publicKey);
    const decryptedMessage = decryptWithPrivateKey(encryptedMessage, privateKey);

    expect(decryptedMessage).toBe(message);
  });
});
