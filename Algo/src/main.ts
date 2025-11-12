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
    node dist/main.js encrypt input.wav encrypted.wav mykey.bin
    node dist/main.js decrypt encrypted.wav decrypted.wav mykey.bin

  Remarques :
  - Le programme chiffre/déchiffre des fichiers WAV 16-bit en opérant sur les samples.
  - La clé est générée lors du chiffrement et sauvegardée dans <keyfile> (32 bytes).
  - Conserver la clé pour pouvoir déchiffrer plus tard.
*/

import AudioCrypto from './crypto-samples';
import AudioFile from './audio';

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

if (operation === 'encrypt') {
  encryptAudio(inputPath, outputPath, keyPath);
} else if (operation === 'decrypt') {
  decryptAudio(inputPath, outputPath, keyPath);
} else {
  console.error('Opération invalide. Utilisez "encrypt" ou "decrypt"');
  process.exit(1);
}
