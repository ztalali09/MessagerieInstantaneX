// --- Math Helpers ---

function randomBigInt(bits: number): bigint {
  let result = BigInt(0);
  for (let i = 0; i < bits; i++) {
    if (Math.random() > 0.5) {
      result |= BigInt(1) << BigInt(i);
    }
  }
  return result;
}

function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let res = BigInt(1);
  base = base % mod;
  while (exp > 0) {
    if (exp % BigInt(2) === BigInt(1)) res = (res * base) % mod;
    exp = exp / BigInt(2);
    base = (base * base) % mod;
  }
  return res;
}

function modInverse(a: bigint, m: bigint): bigint {
  let [m0, x0, x1] = [m, BigInt(0), BigInt(1)];
  if (m === BigInt(1)) return BigInt(0);
  while (a > 1) {
    let q = a / m;
    [m, a] = [a % m, m];
    [x0, x1] = [x1 - q * x0, x0];
  }
  if (x1 < 0) x1 += m0;
  return x1;
}

// Miller-Rabin primality test
function isPrime(n: bigint, k: number = 5): boolean {
  if (n <= 1 || n === BigInt(4)) return false;
  if (n <= 3) return true;

  let d = n - BigInt(1);
  while (d % BigInt(2) === BigInt(0)) d /= BigInt(2);

  for (let i = 0; i < k; i++) {
    if (!millerTest(d, n)) return false;
  }
  return true;
}

function millerTest(d: bigint, n: bigint): boolean {
  let a = BigInt(2) + randomBigInt(16) % (n - BigInt(4));
  let x = modPow(a, d, n);
  if (x === BigInt(1) || x === n - BigInt(1)) return true;
  while (d !== n - BigInt(1)) {
    x = (x * x) % n;
    d *= BigInt(2);
    if (x === BigInt(1)) return false;
    if (x === n - BigInt(1)) return true;
  }
  return false;
}

function generatePrime(bits: number): bigint {
  while (true) {
    let p = randomBigInt(bits);
    // Ensure it's odd
    if (p % BigInt(2) === BigInt(0)) p += BigInt(1);
    if (isPrime(p)) return p;
  }
}

// --- RSA Core ---

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateRSAKeyPair(): Promise<RSAKeyPair> {
  // Using smaller keys for performance in this manual implementation demo
  const bitLength = 512; 
  
  const p = generatePrime(bitLength / 2);
  let q = generatePrime(bitLength / 2);
  while (p === q) q = generatePrime(bitLength / 2);

  const n = p * q;
  const phi = (p - BigInt(1)) * (q - BigInt(1));
  
  const e = BigInt(65537);
  const d = modInverse(e, phi);

  // Simple JSON format for keys
  const publicKey = JSON.stringify({ n: n.toString(), e: e.toString() });
  const privateKey = JSON.stringify({ n: n.toString(), d: d.toString() });

  return { publicKey, privateKey };
}

// Helper to convert string to hex
function stringToHex(str: string): string {
  let hex = '';
  for(let i=0;i<str.length;i++) {
    hex += ''+str.charCodeAt(i).toString(16);
  }
  return hex;
}

// Helper to convert hex to string
function hexToString(hex: string): string {
  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

export function encryptWithPublicKey(data: string, publicKeyStr: string): string {
  try {
    const key = JSON.parse(publicKeyStr);
    const n = BigInt(key.n);
    const e = BigInt(key.e);

    const hex = stringToHex(data);
    const m = BigInt('0x' + hex);

    if (m >= n) {
      throw new Error("Message too long for key size");
    }

    const c = modPow(m, e, n);
    return c.toString(16); // Return hex string
  } catch (err) {
    console.error("Encryption error", err);
    return "";
  }
}

export async function decryptWithPrivateKey(encryptedDataHex: string, privateKeyStr: string): Promise<string> {
  try {
    const key = JSON.parse(privateKeyStr);
    const n = BigInt(key.n);
    const d = BigInt(key.d);

    const c = BigInt('0x' + encryptedDataHex);
    const m = modPow(c, d, n);

    let hex = m.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    
    return hexToString(hex);
  } catch (err) {
    console.error("Decryption error", err);
    return "";
  }
}
