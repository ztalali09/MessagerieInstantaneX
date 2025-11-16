import crypto from 'crypto';
import * as fs from 'fs';

export default class AESAudio {
  private algorithm = 'aes-256-cbc';

  generateKey(): Buffer {
    return crypto.randomBytes(32);
  }

  saveKeyToFile(key: Buffer, filePath: string): void {
    fs.writeFileSync(filePath, key);
  }

  loadKeyFromFile(filePath: string): Buffer {
    return fs.readFileSync(filePath);
  }

  encrypt(data: Buffer, key: Buffer): Buffer {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  }

  decrypt(encryptedData: Buffer, key: Buffer): Buffer {
    const iv = encryptedData.subarray(0, 16);
    const encrypted = encryptedData.subarray(16);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }
}
