import crypto from 'crypto';

/**
 * Class to handle AES-256-CBC encryption for audios
 */
export default class AESAudio {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32; // 256 bits
  private ivLength = 16;  // 128 bits

  /**
   * Generates a random AES key
   */
  public generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Generates a random Initialization Vector (IV)
   */
  private generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Encrypts audio data (binary) with AES
   */
  public encrypt(data: Buffer, key: Buffer): Buffer {
    if (key.length !== this.keyLength) {
      throw new Error(`Key must be ${this.keyLength} bytes`);
    }
    const iv = this.generateIV();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, encrypted]); // Prepend IV
  }

  /**
   * Decrypts audio data (binary) with AES
   */
  public decrypt(encryptedData: Buffer, key: Buffer): Buffer {
    if (key.length !== this.keyLength) {
      throw new Error(`Key must be ${this.keyLength} bytes`);
    }
    const iv = encryptedData.slice(0, this.ivLength);
    const encrypted = encryptedData.slice(this.ivLength);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}
