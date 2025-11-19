/**
 * Class to handle AES-256-CBC encryption for binary files (audios)
 * using Web Crypto API
 */
export class AESAudio {
  private algorithm = 'AES-CBC';
  private keyLength = 256; // bits
  private ivLength = 16;   // bytes

  public async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: this.algorithm,
        length: this.keyLength
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private generateIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  /**
   * Encrypts a file and returns the encrypted data (IV + Ciphertext) and the key
   */
  public async encryptFile(file: File): Promise<{ encryptedData: Uint8Array; key: CryptoKey; iv: Uint8Array }> {
    const key = await this.generateKey();
    const iv = this.generateIV();
    const fileData = await file.arrayBuffer();

    const encryptedContent = await window.crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      fileData as ArrayBuffer
    );

    // Concatenate IV + Encrypted Content
    const encryptedContentArray = new Uint8Array(encryptedContent);
    const finalBuffer = new Uint8Array(iv.length + encryptedContentArray.length);
    finalBuffer.set(iv);
    finalBuffer.set(encryptedContentArray, iv.length);

    return {
      encryptedData: finalBuffer,
      key,
      iv
    };
  }

  /**
   * Decrypts data (IV + Ciphertext) using the provided key
   */
  public async decryptFile(encryptedData: ArrayBuffer, key: CryptoKey): Promise<Blob> {
    const encryptedArray = new Uint8Array(encryptedData);
    
    if (encryptedArray.length < this.ivLength) {
      throw new Error('Invalid encrypted file: too small to contain IV');
    }

    const iv = encryptedArray.slice(0, this.ivLength);
    const ciphertext = encryptedArray.slice(this.ivLength);

    const decryptedContent = await window.crypto.subtle.decrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      ciphertext as any
    );

    // Return as audio/mpeg blob (or generic audio type)
    return new Blob([decryptedContent], { type: 'audio/mpeg' });
  }
  
  /**
   * Export key to raw format (for sending to server)
   */
  public async exportKey(key: CryptoKey): Promise<ArrayBuffer> {
      return await window.crypto.subtle.exportKey('raw', key);
  }
}
