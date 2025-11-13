import * as fs from 'fs';
import * as path from 'path';

/**
 * Classe pour gérer les fichiers audio WAV
 */
export class AudioFile {
  /**
   * Charge un fichier audio WAV et extrait les samples
   */
  public static loadWAVSamples(filepath: string): {
    sampleRate: number;
    channels: number;
    bitDepth: number;
    samples: number[];
    fmtChunk: Buffer; // Garder le chunk fmt original
  } {
    const buffer = fs.readFileSync(filepath);
    
    // Vérifier la signature RIFF
    if (buffer.toString('ascii', 0, 4) !== 'RIFF') {
      throw new Error('Invalid WAV file');
    }

    // Chercher le chunk 'fmt '
    let fmtOffset = -1;
    let fmtSize = 0;
    let dataOffset = -1;
    let dataSize = 0;

    for (let i = 0; i < buffer.length - 8; i++) {
      const chunkId = buffer.toString('ascii', i, i + 4);
      if (chunkId === 'fmt ') {
        fmtOffset = i;
        fmtSize = buffer.readUInt32LE(i + 4);
      } else if (chunkId === 'data') {
        dataOffset = i;
        dataSize = buffer.readUInt32LE(i + 4);
        break;
      }
    }

    if (fmtOffset === -1 || dataOffset === -1) {
      throw new Error('Invalid WAV file structure');
    }

    // Lire les paramètres du format
    const channels = buffer.readUInt16LE(fmtOffset + 8);
    const sampleRate = buffer.readUInt32LE(fmtOffset + 12);
    const bitDepth = buffer.readUInt16LE(fmtOffset + 22);

    // Extraire les données audio
    const audioData = buffer.slice(dataOffset + 8, dataOffset + 8 + dataSize);

    // Convertir les bytes en samples
    const samples: number[] = [];
    const bytesPerSample = bitDepth / 8;

    for (let i = 0; i < audioData.length; i += bytesPerSample) {
      let sample: number;
      if (bitDepth === 16) {
        sample = audioData.readInt16LE(i);
      } else if (bitDepth === 24) {
        // 24-bit audio
        sample = audioData[i] | (audioData[i + 1] << 8) | (audioData[i + 2] << 16);
        if (sample & 0x800000) sample |= ~0xFFFFFF; // sign extend
      } else if (bitDepth === 32) {
        sample = audioData.readInt32LE(i);
      } else {
        throw new Error(`Unsupported bit depth: ${bitDepth}`);
      }
      samples.push(sample);
    }

    // Extraire SEULEMENT le fmt chunk (pas le 'fmt ' ID et size)
    const fmtChunk = buffer.slice(fmtOffset + 8, fmtOffset + 8 + fmtSize);

    return {
      sampleRate,
      channels,
      bitDepth,
      samples,
      fmtChunk,
    };
  }

  /**
   * Sauvegarde un fichier audio WAV à partir de samples
    * Préserve exactement le fmt chunk original du fichier
   */
  public static saveWAVSamples(
    filepath: string,
    samples: number[],
    sampleRate: number,
    channels: number,
    bitDepth: number,
     fmtChunk?: Buffer
  ): void {
    const bytesPerSample = bitDepth / 8;
    const audioData = Buffer.alloc(samples.length * bytesPerSample);

    // Convertir les samples en bytes
    for (let i = 0; i < samples.length; i++) {
      const sample = Math.max(-32768, Math.min(32767, Math.round(samples[i])));
      if (bitDepth === 16) {
        audioData.writeInt16LE(sample, i * bytesPerSample);
      } else if (bitDepth === 32) {
        audioData.writeInt32LE(sample, i * bytesPerSample);
      }
    }





     // En-tête RIFF
     const riffHeader = Buffer.alloc(12);
     riffHeader.write('RIFF', 0, 'ascii');
     riffHeader.writeUInt32LE(4 + 8 + (fmtChunk ? fmtChunk.length : 16) + 8 + audioData.length, 4);
     riffHeader.write('WAVE', 8, 'ascii');

     // Chunk fmt
     const fmtChunkHeader = Buffer.alloc(8);
     fmtChunkHeader.write('fmt ', 0, 'ascii');
     fmtChunkHeader.writeUInt32LE(fmtChunk ? fmtChunk.length : 16, 4);
   
     const fmtChunkData = fmtChunk || this.createDefaultFmtChunk(sampleRate, channels, bitDepth);

     // Chunk data
     const dataChunk = Buffer.alloc(8);
     dataChunk.write('data', 0, 'ascii');
     dataChunk.writeUInt32LE(audioData.length, 4);

     // Combiner tous les chunks
     const finalBuffer = Buffer.concat([riffHeader, fmtChunkHeader, fmtChunkData, dataChunk, audioData]);
     fs.writeFileSync(filepath, finalBuffer);
   }

   /**
    * Crée un fmt chunk par défaut
    */
   private static createDefaultFmtChunk(sampleRate: number, channels: number, bitDepth: number): Buffer {
     const byteRate = (sampleRate * channels * bitDepth) / 8;
     const blockAlign = (channels * bitDepth) / 8;

     const fmtChunk = Buffer.alloc(16);
     fmtChunk.writeUInt16LE(1, 0); // PCM
     fmtChunk.writeUInt16LE(channels, 2);
     fmtChunk.writeUInt32LE(sampleRate, 4);
     fmtChunk.writeUInt32LE(byteRate, 8);
     fmtChunk.writeUInt16LE(blockAlign, 12);
     fmtChunk.writeUInt16LE(bitDepth, 14);
   
     return fmtChunk;
  }

  /**
   * Charge un fichier texte
   */
  public static loadText(filepath: string): string {
    return fs.readFileSync(filepath, 'utf-8');
  }

  /**
   * Sauvegarde un fichier texte
   */
  public static saveText(filepath: string, content: string): void {
    fs.writeFileSync(filepath, content, 'utf-8');
  }

  /**
   * Charge un fichier binaire
   */
  public static loadBinary(filepath: string): Buffer {
    return fs.readFileSync(filepath);
  }

  /**
   * Sauvegarde un fichier binaire
   */
  public static saveBinary(filepath: string, data: Buffer): void {
    fs.writeFileSync(filepath, data);
  }
}

export default AudioFile;
