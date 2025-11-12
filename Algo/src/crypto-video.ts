// crypto-video.ts
import crypto from 'crypto';
import * as fs from 'fs';

/**
 * Classe pour gérer le chiffrement AES-256-CBC des vidéos
 */
export default class AESVideo {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32; // 256 bits
  private ivLength = 16;  // 128 bits

  /**
   * Génère une clé AES aléatoire
   */
  public generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Génère un vecteur d’initialisation (IV) aléatoire
   */
  private generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Chiffre les données vidéo (binaire) avec AES
   */
  public encrypt(data: Buffer, key: Buffer): Buffer {
    if (key.length !== this.keyLength) {
      throw new Error(`La clé doit faire ${this.keyLength} octets`);
    }
    const iv = this.generateIV();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    return Buffer.concat([iv, encrypted]); // Préfixer IV au début
  }

  /**
   * Déchiffre les données vidéo (binaire) avec AES
   */
  public decrypt(encryptedData: Buffer, key: Buffer): Buffer {
    if (key.length !== this.keyLength) {
      throw new Error(`La clé doit faire ${this.keyLength} octets`);
    }
    const iv = encryptedData.slice(0, this.ivLength);
    const encrypted = encryptedData.slice(this.ivLength);
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  /**
   * Sauvegarde une clé AES dans un fichier
   */
  public saveKeyToFile(key: Buffer, filepath: string): void {
    fs.writeFileSync(filepath, key);
  }

  /**
   * Charge une clé AES depuis un fichier
   */
  public loadKeyFromFile(filepath: string): Buffer {
    return fs.readFileSync(filepath);
  }
}
