// Test simple de XOR symétrique
const crypto = require('crypto');

// Fonction d'expansion de clé
function expandKey(key, length) {
  const keyStream = [];
  let counter = 0;
  
  while (keyStream.length < length) {
    const hmac = crypto.createHmac('sha256', key);
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

// Conversion signed 16-bit
function toSigned16(val) {
  return val > 32767 ? val - 65536 : val;
}

function toUnsigned16(val) {
  return val < 0 ? val + 65536 : val;
}

// Test data
const testSamples = [100, 500, -1000, 32767, -32768, 0, 12345];
const key = crypto.randomBytes(32);

console.log('Samples originaux:', testSamples);

// Chiffrement
const encrypted = [];
const keyStream = expandKey(key, testSamples.length * 2);

for (let i = 0; i < testSamples.length; i++) {
  const byte1 = keyStream[i * 2];
  const byte2 = keyStream[i * 2 + 1];
  const keyWord = (byte2 << 8) | byte1;
  
  // Convertir sample en unsigned 16-bit pour XOR
  const sampleUnsigned = toUnsigned16(testSamples[i]);
  
  // XOR en unsigned
  const encryptedUnsigned = sampleUnsigned ^ keyWord;
  
  // Convertir back en signed
  encrypted.push(toSigned16(encryptedUnsigned));
}

console.log('Samples chiffrés:', encrypted);

// Déchiffrement - utiliser exactement la même fonction
const decrypted = [];
const keyStream2 = expandKey(key, testSamples.length * 2);

for (let i = 0; i < encrypted.length; i++) {
  const byte1 = keyStream2[i * 2];
  const byte2 = keyStream2[i * 2 + 1];
  const keyWord = (byte2 << 8) | byte1;
  
  // Convertir sample en unsigned 16-bit pour XOR
  const encryptedUnsigned = toUnsigned16(encrypted[i]);
  
  // XOR en unsigned
  const decryptedUnsigned = encryptedUnsigned ^ keyWord;
  
  // Convertir back en signed
  decrypted.push(toSigned16(decryptedUnsigned));
}

console.log('Samples déchiffrés:', decrypted);
console.log('Identiques?', JSON.stringify(testSamples) === JSON.stringify(decrypted));

