// crypto-image.ts
import crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Classe pour gérer le chiffrement AES-256-CBC pour fichiers binaires (images)
 */
export class AESImage {
  private algorithm = 'aes-256-cbc';
  private keyLength = 32; // 256 bits
  private ivLength = 16;  // 128 bits

  public generateKey(): Buffer {
    return crypto.randomBytes(this.keyLength);
  }

  private generateIV(): Buffer {
    return crypto.randomBytes(this.ivLength);
  }

  public encryptFile(inputPath: string, outputPath: string, keyPath: string): void {
    const data = fs.readFileSync(inputPath);
    const key = this.generateKey();
    const iv = this.generateIV();
    
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

    // Stocker IV + données chiffrées
    const finalBuffer = Buffer.concat([iv, encrypted]);
    fs.writeFileSync(outputPath, finalBuffer);
    fs.writeFileSync(keyPath, key);

    console.log(`✓ Fichier chiffré sauvegardé : ${outputPath}`);
    console.log(`✓ Clé sauvegardée : ${keyPath}`);
  }

  public decryptFile(inputPath: string, outputPath: string, keyPath: string): void {
    const key = fs.readFileSync(keyPath);
    const encryptedData = fs.readFileSync(inputPath);

    if (encryptedData.length < this.ivLength) {
      throw new Error('Fichier chiffré invalide : trop petit pour contenir IV.');
    }

    const iv = encryptedData.slice(0, this.ivLength);
    const encrypted = encryptedData.slice(this.ivLength);

    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    fs.writeFileSync(outputPath, decrypted);
    console.log(`✓ Fichier déchiffré sauvegardé : ${outputPath}`);
  }
}

// CLI minimal pour images
const args = process.argv.slice(2);
if (args.length < 4) {
  console.log('Usage: npx ts-node crypto-image.ts <encrypt|decrypt> <input> <output> <keyfile>');
  process.exit(1);
}

const [operation, inputPath, outputPath, keyPath] = args;
const aesImage = new AESImage();

if (operation === 'encrypt') {
  aesImage.encryptFile(inputPath, outputPath, keyPath);
} else if (operation === 'decrypt') {
  aesImage.decryptFile(inputPath, outputPath, keyPath);
} else {
  console.error('Opération invalide. Utilisez "encrypt" ou "decrypt"');
  process.exit(1);
}
