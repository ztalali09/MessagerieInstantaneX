import * as bcu from 'bigint-crypto-utils';

interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}

export async function generateRSAKeyPair(): Promise<RSAKeyPair> {
  const bitLength = 2048;
  const e = 65537n;

  // Génération de nombres premiers cryptographiquement sûrs
  let p = await bcu.prime(bitLength / 2);
  let q = await bcu.prime(bitLength / 2);
  let n = p * q;
  let phi = (p - 1n) * (q - 1n);

  // Assure que gcd(e, phi) === 1
  while (bcu.gcd(e, phi) !== 1n) {
    p = await bcu.prime(bitLength / 2);
    q = await bcu.prime(bitLength / 2);
    n = p * q;
    phi = (p - 1n) * (q - 1n);
  }

  // Calcul de l'inverse modulaire
  const d = bcu.modInv(e, phi);

  const publicKey = `${n.toString()}:${e.toString()}`;
  const privateKey = `${n.toString()}:${d.toString()}`;

  return { publicKey, privateKey };
}

// Fonction d'exponentiation modulaire pour chiffrer/déchiffrer
export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  return bcu.modPow(base, exp, mod);
}
