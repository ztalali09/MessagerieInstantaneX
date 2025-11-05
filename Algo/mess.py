import random
from time import time

def pgcd(a, b):
    while b:
        a, b = b, a % b
    return a


def egcd_iteratif(a, b):
    x0, x1, y0, y1 = 1, 0, 0, 1
    while b:
        q, a, b = a // b, b, a % b
        x0, x1 = x1, x0 - q * x1
        y0, y1 = y1, y0 - q * y1
    return x0, y0, a


def inverseModulaire(e, m):
    x, y, d = egcd_iteratif(e, m)
    if d != 1:
        return -1
    return x % m


def estPremier(n, k=5):  # Miller-Rabin rapide
    if n < 2:
        return False
    petits = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]
    for p in petits:
        if n % p == 0:
            return n == p
    r, s = 0, n - 1
    while s % 2 == 0:
        r += 1
        s //= 2
    for _ in range(k):
        a = random.randrange(2, n - 1)
        x = pow(a, s, n)
        if x in (1, n - 1):
            continue
        for _ in range(r - 1):
            x = pow(x, 2, n)
            if x == n - 1:
                break
        else:
            return False
    return True


def premierAleatoire(inf, lg):
    rand = random.Random()
    while True:
        n = rand.randrange(inf | 1, inf + lg, 2)  # seulement impairs
        if estPremier(n):
            return n


def choixCle(inf, lg):
    p = premierAleatoire(inf, lg)
    q = premierAleatoire(inf, lg)
    while p == q:
        q = premierAleatoire(inf, lg)
    n = p * q
    phi = (p - 1) * (q - 1)
    e = 65537
    d = inverseModulaire(e, phi)
    return (p, q, e, d, n)


def clePublique(cles):
    p, q, e, d, n = cles
    return (n, e)


def clePrivee(cles):
    p, q, e, d, n = cles
    return (n, d)


def codageRSA(M, cle):
    n, e = cle
    return pow(M, e, n)


def decodageRSA(C, cle):
    n, d = cle
    return pow(C, d, n)


def texte_en_blocs(texte, taille_bloc):
    data = texte.encode('utf-8')
    return [int.from_bytes(data[i:i+taille_bloc], 'little') for i in range(0, len(data), taille_bloc)]


def blocs_en_texte(blocs):
    texte = b''.join([b.to_bytes((b.bit_length() + 7) // 8, 'little') for b in blocs])
    return texte.decode('utf-8', errors='ignore')


def testCompletRSA(inf, lg, taille_bloc=16, texte="Bonjour"):
    cles = choixCle(inf, lg)
    cle_publique = clePublique(cles)
    cle_privee = clePrivee(cles)
    blocs = texte_en_blocs(texte, taille_bloc)
    chiffrés = [codageRSA(b, cle_publique) for b in blocs]
    déchiffrés = [decodageRSA(c, cle_privee) for c in chiffrés]
    texte_final = blocs_en_texte(déchiffrés)
    return texte_final
