/*
  Exécution :

  Prérequis : node (>=14), npm
  Installer les dépendances :

    npm install

  Méthodes d'exécution :

  1) Exécuter directement en TypeScript (développement, sans build) :

    npx ts-node src/main.ts <encrypt|decrypt> <input.wav> <output.wav> <keyfile>

    Exemples :
    npx ts-node src/main.ts encrypt test500kb.wav crypted500kb.wav mykey.bin
    npx ts-node src/main.ts decrypt crypted500kb.wav out500kb.wav mykey.bin

  2) Compiler puis exécuter le JavaScript produit (recommandé pour tests répétés) :

    npm run build
    node dist/main.js <encrypt|decrypt> <input.wav> <output.wav> <keyfile>

    Exemples :
    npm run build
    node dist/main.js encrypt test500kb.wav crypted500kb.wav mykey.bin
    node dist/main.js decrypt crypted500kb.wav out500kb.wav mykey.bin

  Remarques :
  - Le programme chiffre/déchiffre des fichiers WAV 16-bit en opérant sur les samples.
  - La clé est générée lors du chiffrement et sauvegardée dans <keyfile> (32 bytes).
  - Conserver la clé pour pouvoir déchiffrer plus tard.
*/

import AudioCrypto from './crypto-samples';
import AudioFile from './audio';
import AESEncryption from './crypto';
import AESVideo from './crypto-video';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Chiffre un fichier audio avec XOR basé sur une clé
 */
function encryptAudio(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Chiffrement Audio (XOR avec clé) ===\n');

  try {
    // Charger le fichier audio
    console.log(`Chargement du fichier audio : ${inputPath}`);
    const audioFile = AudioFile.loadWAVSamples(inputPath);
    console.log(`✓ Fichier chargé`);
    console.log(`  - Fréquence : ${audioFile.sampleRate} Hz`);
    console.log(`  - Canaux : ${audioFile.channels}`);
    console.log(`  - Profondeur : ${audioFile.bitDepth} bits`);
    console.log(`  - Samples : ${audioFile.samples.length}\n`);

    // Générer une clé
    console.log('Génération de la clé...');
    const key = AudioCrypto.generateKey();
    console.log(`✓ Clé générée (${key.length} bytes)\n`);

    // Sauvegarder la clé
    console.log(`Sauvegarde de la clé : ${keyPath}`);
    AudioCrypto.saveKeyToFile(key, keyPath);
    console.log('✓ Clé sauvegardée\n');

    // Chiffrer les samples
    console.log('Chiffrement en cours...');
    const startTime = Date.now();
    const encryptedSamples = AudioCrypto.encryptSamples(audioFile.samples, key);
    const endTime = Date.now();
    console.log(`✓ Chiffrement terminé en ${endTime - startTime}ms\n`);

    // Sauvegarder le fichier chiffré
    console.log(`Sauvegarde du fichier chiffré : ${outputPath}`);
    AudioFile.saveWAVSamples(
      outputPath,
      encryptedSamples,
      audioFile.sampleRate,
      audioFile.channels,
      audioFile.bitDepth,
      audioFile.fmtChunk
    );
    console.log('✓ Fichier chiffré sauvegardé\n');
  } catch (error) {
    console.error('Erreur lors du chiffrement :', error);
    process.exit(1);
  }
}

/**
 * Chiffre un fichier texte avec AES-256-CBC
 */
function encryptTextAES(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Chiffrement TXT (AES-256-CBC) ===\n');
  try {
    const aes = new AESEncryption();

    // Lire le texte en UTF-8
    console.log(`Chargement du fichier texte : ${inputPath}`);
    const data = fs.readFileSync(inputPath);
    console.log('✓ Fichier lu\n');

    // Générer clé
    console.log('Génération de la clé...');
    const key = aes.generateKey();
    console.log(`✓ Clé générée (${key.length} bytes)\n`);

    // Chiffrer
    console.log('Chiffrement en cours...');
    const start = Date.now();
    const encrypted = aes.encrypt(data, key);
    const elapsed = Date.now() - start;
    console.log(`✓ Chiffrement terminé en ${elapsed}ms\n`);

    // Sauvegarder clé et données
    console.log(`Sauvegarde de la clé : ${keyPath}`);
    aes.saveKeyToFile(key, keyPath);
    console.log('✓ Clé sauvegardée\n');

    console.log(`Sauvegarde du fichier chiffré : ${outputPath}`);
    fs.writeFileSync(outputPath, encrypted);
    console.log('✓ Fichier chiffré sauvegardé\n');
  } catch (err) {
    console.error('Erreur lors du chiffrement TXT :', err);
    process.exit(1);
  }
}

/**
 * Déchiffre un fichier texte chiffré avec AES-256-CBC
 */
function decryptTextAES(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Déchiffrement TXT (AES-256-CBC) ===\n');
  try {
    const aes = new AESEncryption();

    console.log(`Chargement du fichier chiffré : ${inputPath}`);
    const encrypted = fs.readFileSync(inputPath);
    console.log('✓ Fichier chiffré lu\n');

    console.log(`Chargement de la clé : ${keyPath}`);
    const key = aes.loadKeyFromFile(keyPath);
    console.log(`✓ Clé chargée (${key.length} bytes)\n`);

    console.log('Déchiffrement en cours...');
    const start = Date.now();
    const decrypted = aes.decrypt(encrypted, key);
    const elapsed = Date.now() - start;
    console.log(`✓ Déchiffrement terminé en ${elapsed}ms\n`);

    console.log(`Sauvegarde du fichier déchiffré : ${outputPath}`);
    fs.writeFileSync(outputPath, decrypted);
    console.log('✓ Fichier déchiffré sauvegardé\n');
  } catch (err) {
    console.error('Erreur lors du déchiffrement TXT :', err);
    process.exit(1);
  }
}

/**
 * Déchiffre un fichier audio avec XOR basé sur une clé
 */
function decryptAudio(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Déchiffrement Audio (XOR avec clé) ===\n');

  try {
    // Charger le fichier chiffré
    console.log(`Chargement du fichier chiffré : ${inputPath}`);
    const encryptedFile = AudioFile.loadWAVSamples(inputPath);
    console.log(`✓ Fichier chargé`);
    console.log(`  - Samples : ${encryptedFile.samples.length}\n`);

    // Charger la clé
    console.log(`Chargement de la clé : ${keyPath}`);
    const key = AudioCrypto.loadKeyFromFile(keyPath);
    console.log(`✓ Clé chargée (${key.length} bytes)\n`);

    // Déchiffrer les samples
    console.log('Déchiffrement en cours...');
    const startTime = Date.now();
    const decryptedSamples = AudioCrypto.decryptSamples(encryptedFile.samples, key);
    const endTime = Date.now();
    console.log(`✓ Déchiffrement terminé en ${endTime - startTime}ms\n`);

    // Sauvegarder le fichier déchiffré
    console.log(`Sauvegarde du fichier déchiffré : ${outputPath}`);
    AudioFile.saveWAVSamples(
      outputPath,
      decryptedSamples,
      encryptedFile.sampleRate,
      encryptedFile.channels,
      encryptedFile.bitDepth,
       encryptedFile.fmtChunk
    );
    console.log('✓ Fichier déchiffré sauvegardé\n');
  } catch (error) {
    console.error('Erreur lors du déchiffrement :', error);
    process.exit(1);
  }
}

/**
 * Chiffre un fichier binaire (image) avec AES-256-CBC
 */
function encryptImageAES(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Chiffrement Image (AES-256-CBC) ===\n');
  try {
    const aes = new AESEncryption();

    console.log(`Chargement de l'image : ${inputPath}`);
    const data = fs.readFileSync(inputPath);
    console.log('✓ Image chargée\n');

    console.log('Génération de la clé...');
    const key = aes.generateKey();
    console.log(`✓ Clé générée (${key.length} bytes)\n`);

    console.log('Chiffrement en cours...');
    const start = Date.now();
    const encrypted = aes.encrypt(data, key);
    const elapsed = Date.now() - start;
    console.log(`✓ Chiffrement terminé en ${elapsed}ms\n`);

    console.log(`Sauvegarde de la clé : ${keyPath}`);
    aes.saveKeyToFile(key, keyPath);
    console.log('✓ Clé sauvegardée\n');

    console.log(`Sauvegarde du fichier chiffré : ${outputPath}`);
    fs.writeFileSync(outputPath, encrypted);
    console.log('✓ Image chiffrée sauvegardée\n');
  } catch (err) {
    console.error('Erreur lors du chiffrement de l\'image :', err);
    process.exit(1);
  }
}

/**
 * Déchiffre un fichier binaire (image) avec AES-256-CBC
 */
function decryptImageAES(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Déchiffrement Image (AES-256-CBC) ===\n');
  try {
    const aes = new AESEncryption();

    console.log(`Chargement du fichier chiffré : ${inputPath}`);
    const encrypted = fs.readFileSync(inputPath);
    console.log('✓ Fichier chiffré chargé\n');

    console.log(`Chargement de la clé : ${keyPath}`);
    const key = aes.loadKeyFromFile(keyPath);
    console.log(`✓ Clé chargée (${key.length} bytes)\n`);

    console.log('Déchiffrement en cours...');
    const start = Date.now();
    const decrypted = aes.decrypt(encrypted, key);
    const elapsed = Date.now() - start;
    console.log(`✓ Déchiffrement terminé en ${elapsed}ms\n`);

    console.log(`Sauvegarde du fichier déchiffré : ${outputPath}`);
    fs.writeFileSync(outputPath, decrypted);
    console.log('✓ Image déchiffrée sauvegardée\n');
  } catch (err) {
    console.error('Erreur lors du déchiffrement de l\'image :', err);
    process.exit(1);
  }
}

/**
 * Chiffre une vidéo avec AES-256-CBC
 */
function encryptVideoAES(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Chiffrement Vidéo (AES-256-CBC) ===\n');
  try {
    const aesVideo = new AESVideo();

    console.log(`Chargement du fichier vidéo : ${inputPath}`);
    const data = fs.readFileSync(inputPath);
    console.log('✓ Fichier vidéo lu\n');

    console.log('Génération de la clé AES...');
    const key = aesVideo.generateKey();
    console.log(`✓ Clé générée (${key.length} bytes)\n`);

    console.log('Chiffrement en cours...');
    const start = Date.now();
    const encrypted = aesVideo.encrypt(data, key);
    const elapsed = Date.now() - start;
    console.log(`✓ Chiffrement terminé en ${elapsed}ms\n`);

    console.log(`Sauvegarde de la clé : ${keyPath}`);
    aesVideo.saveKeyToFile(key, keyPath);
    console.log('✓ Clé sauvegardée\n');

    console.log(`Sauvegarde du fichier chiffré : ${outputPath}`);
    fs.writeFileSync(outputPath, encrypted);
    console.log('✓ Vidéo chiffrée sauvegardée\n');
  } catch (err) {
    console.error('Erreur lors du chiffrement vidéo :', err);
    process.exit(1);
  }
}

/**
 * Déchiffre une vidéo avec AES-256-CBC
 */
function decryptVideoAES(inputPath: string, outputPath: string, keyPath: string): void {
  console.log('=== Déchiffrement Vidéo (AES-256-CBC) ===\n');
  try {
    const aesVideo = new AESVideo();

    console.log(`Chargement du fichier vidéo chiffré : ${inputPath}`);
    const encrypted = fs.readFileSync(inputPath);
    console.log('✓ Fichier chiffré lu\n');

    console.log(`Chargement de la clé : ${keyPath}`);
    const key = aesVideo.loadKeyFromFile(keyPath);
    console.log(`✓ Clé chargée (${key.length} bytes)\n`);

    console.log('Déchiffrement en cours...');
    const start = Date.now();
    const decrypted = aesVideo.decrypt(encrypted, key);
    const elapsed = Date.now() - start;
    console.log(`✓ Déchiffrement terminé en ${elapsed}ms\n`);

    console.log(`Sauvegarde du fichier déchiffré : ${outputPath}`);
    fs.writeFileSync(outputPath, decrypted);
    console.log('✓ Vidéo déchiffrée sauvegardée\n');
  } catch (err) {
    console.error('Erreur lors du déchiffrement vidéo :', err);
    process.exit(1);
  }
}

// Programme principal
const args = process.argv.slice(2);

if (args.length < 4) {
  console.log('Usage: npx ts-node src/main.ts <encrypt|decrypt> <input> <output> <key>');
  console.log('\nExemples:');
  console.log('  npx ts-node src/main.ts encrypt audio.wav encrypted.wav mykey.bin');
  console.log('  npx ts-node src/main.ts decrypt encrypted.wav decrypted.wav mykey.bin');
  process.exit(1);
}

const operation = args[0];
const inputPath = args[1];
const outputPath = args[2];
const keyPath = args[3];

// Dispatch based on operation and file extensions.
// Rules:
// - encrypt: if input is .txt => AES text; if .wav => audio XOR
// - decrypt: if output is .txt or input is .enc => AES text; if input is .wav => audio XOR
const inputExt = path.extname(inputPath).toLowerCase();
const outputExt = path.extname(outputPath).toLowerCase();

if (operation === 'encrypt') {
  if (inputExt === '.txt') {
    encryptTextAES(inputPath, outputPath, keyPath);
  } else if (inputExt === '.wav') {
    encryptAudio(inputPath, outputPath, keyPath);
  } else if (['.png', '.jpg', '.jpeg', '.bmp'].includes(inputExt)) {
    encryptImageAES(inputPath, outputPath, keyPath);
  } else if (['.mp4', '.avi', '.mov', '.mkv'].includes(inputExt)) {
    encryptVideoAES(inputPath, outputPath, keyPath);
  } else {
    console.error('Type de fichier d\'entrée non supporté pour encrypt. Utilisez .wav, .txt ou image (.png/.jpg/.bmp)');
    process.exit(1);
  }
} else if (operation === 'decrypt') {
  if (outputExt === '.txt' || inputExt.endsWith('.enc')) {
    decryptTextAES(inputPath, outputPath, keyPath);
  } else if (inputExt === '.wav') {
    decryptAudio(inputPath, outputPath, keyPath);
  } else if (['.png', '.jpg', '.jpeg', '.bmp'].includes(outputExt) || ['.png', '.jpg', '.jpeg', '.bmp'].includes(inputExt)) {
    decryptImageAES(inputPath, outputPath, keyPath);
  } else if (['.mp4', '.avi', '.mov', '.mkv'].includes(inputExt)) {
    decryptVideoAES(inputPath, outputPath, keyPath);
  } else {
    console.error('Type de fichier d\'entrée non supporté pour decrypt. Utilisez .wav, .txt, image (.png/.jpg/.bmp) ou vidéo (.mp4/.avi/.mov/.mkv)');
    process.exit(1);
  }
}
