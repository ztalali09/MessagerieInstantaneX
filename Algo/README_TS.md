# Audio Encryption with AES-256

Projet TypeScript pour chiffrer et déchiffrer des fichiers audio et texte avec AES-256-CBC.

## Installation

```bash
npm install
```

## Compilation

```bash
npm run build
```

## Utilisation

### Chiffrer un fichier audio

```bash
npx ts-node src/main.ts encrypt audio <input.wav> <output.wav> <key.bin>
```

Exemple :
```bash
npx ts-node src/main.ts encrypt audio test2.wav encrypted.wav mykey.bin
```

### Déchiffrer un fichier audio

```bash
npx ts-node src/main.ts decrypt audio <input.wav> <output.wav> <key.bin>
```

Exemple :
```bash
npx ts-node src/main.ts decrypt audio encrypted.wav decrypted.wav mykey.bin
```

### Chiffrer un fichier texte

```bash
npx ts-node src/main.ts encrypt text <input.txt> <output.txt> <key.bin>
```

Exemple :
```bash
npx ts-node src/main.ts encrypt text test.txt encrypted.txt mykey.bin
```

### Déchiffrer un fichier texte

```bash
npx ts-node src/main.ts decrypt text <input.txt> <output.txt> <key.bin>
```

Exemple :
```bash
npx ts-node src/main.ts decrypt text encrypted.txt decrypted.txt mykey.bin
```

## Architecture

- **src/crypto.ts** : Classe `AESEncryption` pour gérer le chiffrement/déchiffrement AES-256-CBC
- **src/audio.ts** : Classe `AudioFile` pour charger/sauvegarder les fichiers WAV et texte
- **src/main.ts** : Programme principal avec les commandes de chiffrement/déchiffrement

## Caractéristiques

✓ Chiffrement AES-256-CBC
✓ Génération automatique de clés
✓ Vecteur d'initialisation (IV) aléatoire pour chaque chiffrement
✓ Support des fichiers WAV
✓ Support des fichiers texte
✓ Interface en ligne de commande
✓ Gestion d'erreurs complète

## Sécurité

- **Algorithme** : AES-256-CBC (Advanced Encryption Standard)
- **Taille de clé** : 256 bits
- **Taille IV** : 128 bits
- **Mode** : CBC (Cipher Block Chaining)

## Notes

- Les fichiers WAV chiffrés gardent la même structure WAV (métadonnées + données chiffrées)
- Les fichiers texte chiffrés sont encodés en base64 pour faciliter le stockage
- Les clés sont stockées en binaire pur
