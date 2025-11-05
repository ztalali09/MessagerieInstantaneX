import time
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes


def main():
    start_time = time.time()

    # Read the text file
    with open("Algo/test.txt", "r", encoding="utf-8") as f:
        texte = f.read()

    # Generate RSA key pair using cryptography library
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    public_key = private_key.public_key()

    # Encrypt the message
    message_bytes = texte.encode('utf-8')
    ciphertext = public_key.encrypt(
        message_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    # Decrypt the message
    plaintext = private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

    decrypted_text = plaintext.decode('utf-8')

    # Write the result
    with open("Algo/retour_library.txt", "w", encoding="utf-8") as f:
        f.write(decrypted_text)

    end_time = time.time()

    print("Temps d'execution avec bibliothèque:", end_time - start_time)
    print("Texte original:", repr(texte[:50]) + "..." if len(texte) > 50 else repr(texte))
    print("Texte déchiffré:", repr(decrypted_text[:50]) + "..." if len(decrypted_text) > 50 else repr(decrypted_text))
    print("Sont identiques:", texte == decrypted_text)


if __name__ == "__main__":
    main()