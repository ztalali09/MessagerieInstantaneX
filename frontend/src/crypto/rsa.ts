// Déchiffrer avec la clé privée
export async function decryptWithPrivateKey(
  encryptedData: string,
  privateKeyPEM: string
): Promise<string> {
  // Décoder depuis base64
  const encryptedBuffer = Uint8Array.from(atob(encryptedData), (c) =>
    c.charCodeAt(0)
  );

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

async function importPrivateKeyFromPEM(pem: string): Promise<CryptoKey> {
  // Retirer les en-têtes et sauts de ligne
  const pemContents = pem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');

  // Décoder base64
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

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
