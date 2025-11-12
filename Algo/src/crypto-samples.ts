import crypto from 'crypto';

/**
 * Classe pour gérer le chiffrement des samples audio
 * Utilise XOR avec une clé dérivée pour préserver la structure audio
 */
export class AudioCrypto {
  /**
   * Convertit un nombre signé 16-bit en non-signé
   */
  private static toUnsigned16(val: number): number {
    return val < 0 ? val + 65536 : val;
  }

  /**
   * Convertit un nombre non-signé 16-bit en signé
   */
  private static toSigned16(val: number): number {
    return val > 32767 ? val - 65536 : val;
  }

  /**
   * Génère une clé aléatoire
   */
  public static generateKey(): Buffer {
    return crypto.randomBytes(32); // 256 bits
  }

  /**
   * Chiffre un array de samples audio avec XOR
   * Cette méthode préserve la dynamique audio contrairement au chiffrement par bloc
   */
  public static encryptSamples(samples: number[], key: Buffer): number[] {
    const encrypted: number[] = [];
    
    // Créer un stream de clé déterministe basé sur la clé principale (16-bit)
    const keyStream = this.expandKey(key, samples.length * 2); // 2 bytes per sample

    for (let i = 0; i < samples.length; i++) {
      // XOR du sample 16-bit avec 2 bytes de la clé
      const byte1 = keyStream[i * 2];
      const byte2 = keyStream[i * 2 + 1];
      const keyWord = (byte2 << 8) | byte1; // Créer un 16-bit word
      
      // Convertir sample en unsigned 16-bit pour XOR
      const sampleUnsigned = this.toUnsigned16(samples[i]);
      
      // XOR en unsigned
      const encryptedUnsigned = sampleUnsigned ^ keyWord;
      
      // Convertir back en signed
      encrypted.push(this.toSigned16(encryptedUnsigned));
    }

    return encrypted;
  }

  /**
   * Déchiffre un array de samples audio avec XOR
   */
  public static decryptSamples(encryptedSamples: number[], key: Buffer): number[] {
    // XOR est symétrique, donc déchiffrement = chiffrement
    return this.encryptSamples(encryptedSamples, key);
  }

  /**
   * Expande une clé en un stream de bytes utilisant HMAC-SHA256
   * Produit toujours le même résultat pour la même clé (déterministe)
   */
  private static expandKey(key: Buffer, length: number): number[] {
    const keyStream: number[] = [];
    let counter = 0;

    while (keyStream.length < length) {
      const hmac = crypto.createHmac('sha256', key);
      // Utiliser un Buffer plutôt qu'une string pour éviter les problèmes d'encoding
      const counterBuffer = Buffer.alloc(4);
      counterBuffer.writeUInt32BE(counter, 0);
      hmac.update(counterBuffer);
      const hash = hmac.digest();

      for (let i = 0; i < hash.length && keyStream.length < length; i++) {
        keyStream.push(hash[i]);
      }
      counter++;
    }

    return keyStream;
  }

  /**
   * Sauvegarde une clé dans un fichier
   */
  public static saveKeyToFile(key: Buffer, filepath: string): void {
    const fs = require('fs');
    fs.writeFileSync(filepath, key);
  }

  /**
   * Charge une clé depuis un fichier
   */
  public static loadKeyFromFile(filepath: string): Buffer {
    const fs = require('fs');
    return fs.readFileSync(filepath);
  }
}

export default AudioCrypto;
