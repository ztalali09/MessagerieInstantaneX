interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}

// Générer une paire de clés RSA
export async function generateRSAKeyPair(): Promise<RSAKeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]), // 65537
      hash: 'SHA-256',
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // Exporter les clés au format PEM
  const publicKey = await exportPublicKeyToPEM(keyPair.publicKey);
  const privateKey = await exportPrivateKeyToPEM(keyPair.privateKey);

  return { publicKey, privateKey };
}

// Chiffrer avec la clé publique
export async function encryptWithPublicKey(data: string, publicKeyPEM: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  // Importer la clé publique depuis PEM
  const publicKey = await importPublicKeyFromPEM(publicKeyPEM);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'RSA-OAEP' },
    publicKey,
    dataBuffer
  );

  // Convertir en base64
  return btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));
}

// Déchiffrer avec la clé privée
export async function decryptWithPrivateKey(encryptedData: string, privateKeyPEM: string): Promise<string> {
  // Décoder depuis base64
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

  // Importer la clé privée depuis PEM
  const privateKey = await importPrivateKeyFromPEM(privateKeyPEM);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    privateKey,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

// Fonctions utilitaires pour conversion PEM
async function exportPublicKeyToPEM(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key);
  const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
}

async function exportPrivateKeyToPEM(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', key);
  const exportedAsBase64 = btoa(String.fromCharCode(...new Uint8Array(exported)));
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
}

async function importPublicKeyFromPEM(pem: string): Promise<CryptoKey> {
  // Retirer les en-têtes et sauts de ligne
  const pemContents = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');

  // Décoder base64
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'spki',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt']
  );
}

async function importPrivateKeyFromPEM(pem: string): Promise<CryptoKey> {
  // Retirer les en-têtes et sauts de ligne
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  // Décoder base64
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['decrypt']
  );
}
