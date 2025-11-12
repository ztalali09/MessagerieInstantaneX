import crypto from 'crypto';

/**
 * Classe pour gérer le chiffrement AES-256-CBC
 */
export class AESEncryption {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32; // 256 bits
  private ivLength = 16; // 128 bits

  /**
   * Génère une clé AES aléatoire
   */
  public generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Génère un IV (vecteur d'initialisation) aléatoire
   */
  private generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  /**
   * Chiffre un buffer avec AES
   * @param data Données à chiffrer
   * @param key Clé de chiffrement
   * @returns IV + données chiffrées
   */
  public encrypt(data: Buffer, key: Buffer): Buffer {
    if (key.length !== this.keyLength) {
      throw new Error(`Key must be ${this.keyLength} bytes`);
    }

    const iv = this.generateIV();
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Retourner IV + données chiffrées
    return Buffer.concat([iv, encrypted]);
  }

  /**
   * Déchiffre un buffer avec AES
   * @param encryptedData IV + données chiffrées
   * @param key Clé de chiffrement
   * @returns Données déchiffrées
   */
  public decrypt(encryptedData: Buffer, key: Buffer): Buffer {
    if (key.length !== this.keyLength) {
      throw new Error(`Key must be ${this.keyLength} bytes`);
    }

    // Extraire l'IV
    const iv = encryptedData.slice(0, this.ivLength);
    const encrypted = encryptedData.slice(this.ivLength);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  /**
   * Sauvegarde une clé dans un fichier
   */
  public saveKeyToFile(key: Buffer, filepath: string): void {
    const fs = require('fs');
    fs.writeFileSync(filepath, key);
  }

  /**
   * Charge une clé depuis un fichier
   */
  public loadKeyFromFile(filepath: string): Buffer {
    const fs = require('fs');
    return fs.readFileSync(filepath);
  }
}

export default AESEncryption;
