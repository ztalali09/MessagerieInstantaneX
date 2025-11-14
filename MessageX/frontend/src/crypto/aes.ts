// Générer une clé AES à partir d'un mot de passe
export const generateAESKeyFromPassword = async (password: string): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);

  // Hash du mot de passe avec SHA-256
  const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);

  // Importer le hash comme clé AES
  return await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Chiffrer la clé privée
export const encryptPrivateKey = async (privateKey: string, aesKey: CryptoKey): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(privateKey);

  // Générer un IV aléatoire
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    aesKey,
    data
  );

  // Convertir IV et données chiffrées en base64 et les séparer avec ':'
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

  return ivBase64 + ':' + encryptedBase64;
};

// Déchiffrer la clé privée
export const decryptPrivateKey = async (encryptedPrivateKey: string, aesKey: CryptoKey): Promise<string> => {
  // Support two formats:
  // 1) backend may return "ivBase64:encryptedBase64"
  // 2) frontend older format used a single base64 of IV+ciphertext

  let iv: Uint8Array;
  let encryptedData: Uint8Array;

  if (encryptedPrivateKey.includes(':')) {
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 2) throw new Error('Invalid encrypted private key format');
    iv = Uint8Array.from(atob(parts[0]), c => c.charCodeAt(0));
    encryptedData = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));
  } else {
    // decode single-base64 combined buffer
    const combined = Uint8Array.from(atob(encryptedPrivateKey), c => c.charCodeAt(0));
    iv = combined.slice(0, 16);
    encryptedData = combined.slice(16);
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    aesKey,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};

// Générer une clé AES aléatoire
export const generateRandomAESKey = async (): Promise<CryptoKey> => {
  return await crypto.subtle.generateKey(
    { name: 'AES-CBC', length: 256 },
    true, // extractable
    ['encrypt', 'decrypt']
  );
};

// Chiffrer un message
export const encryptMessage = async (message: string, key: CryptoKey): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const iv = crypto.getRandomValues(new Uint8Array(16));

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    data
  );

  // Convertir IV et données en base64
  const ivBase64 = btoa(String.fromCharCode(...iv));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuffer)));

  return ivBase64 + ':' + encryptedBase64;
};

// Déchiffrer un message
export const decryptMessage = async (
  encryptedMessage: string,
  key: CryptoKey | Uint8Array | ArrayBuffer
): Promise<string> => {
  const parts = encryptedMessage.split(':');
  if (parts.length !== 2) throw new Error('Invalid encrypted message format');
  const iv = Uint8Array.from(atob(parts[0]), c => c.charCodeAt(0));
  const encryptedData = Uint8Array.from(atob(parts[1]), c => c.charCodeAt(0));

  // Type guards
  const isCryptoKey = (k: any): k is CryptoKey => k && typeof k === 'object' && 'algorithm' in k;

  // If a raw key (Uint8Array / ArrayBuffer) is provided, import it into a CryptoKey
  let cryptoKey: CryptoKey;
  if (isCryptoKey(key)) {
    cryptoKey = key as CryptoKey;
  } else {
    // ArrayBuffer.isView handles TypedArray checks (Uint8Array, etc.)
    let keyBuffer: ArrayBuffer | ArrayBufferView;
    if (ArrayBuffer.isView(key)) {
      keyBuffer = key as ArrayBufferView;
    } else {
      keyBuffer = key as ArrayBuffer;
    }

    cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-CBC' },
      false,
      ['decrypt']
    );
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    cryptoKey,
    encryptedData
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
};
