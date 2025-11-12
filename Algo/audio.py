import os
from mess import *
from time import time
import numpy as np
from scipy.io import wavfile
import sounddevice as sd
import matplotlib.pyplot as plt


def charger_audio_wav(chemin_fichier):
    """Charge un fichier WAV et retourne la fréquence d'échantillonnage et les données"""
    fs, data = wavfile.read(chemin_fichier)
    return fs, np.asarray(data, dtype=np.int32)


def sauvegarder_audio_wav(chemin_fichier, fs, donnees):
    """Sauvegarde les données audio dans un fichier WAV"""
    donnees = np.asarray(donnees, dtype=np.int16)
    wavfile.write(chemin_fichier, fs, donnees)


def chiffrer_audio_wav(chemin_audio_entree, chemin_audio_sortie, inf=100, lg=500):
    """Chiffre un fichier WAV avec RSA en appliquant RSA à chaque sample"""
    print(f"Chargement du fichier audio : {chemin_audio_entree}")
    fs, data = charger_audio_wav(chemin_audio_entree)
    print(f"Fréquence d'échantillonnage : {fs} Hz")
    print(f"Nombre de samples : {len(data)}")
    
    print("Génération des clés RSA...")
    cles = choixCle(inf, lg)
    cle_publique = clePublique(cles)
    n, e = cle_publique
    
    print(f"Clé publique : n={n}, e={e}")
    print("Chiffrement des samples...")
    
    start_time = time()
    # Appliquer RSA à chaque sample : encrypted = (sample^e) % n
    encrypted = np.asarray([(sample ** e) % n for sample in data], dtype=np.int32)
    end_time = time()
    
    print(f"Temps de chiffrement : {end_time - start_time:.2f} secondes")
    
    # Sauvegarder le fichier chiffré
    print(f"Sauvegarde du fichier chiffré : {chemin_audio_sortie}")
    sauvegarder_audio_wav(chemin_audio_sortie, fs, encrypted)
    print(f"Fichier chiffré sauvegardé")
    
    return cles, fs


def dechiffrer_audio_wav(chemin_audio_chiffre, chemin_audio_sortie, cles, fs):
    """Déchiffre un fichier WAV avec RSA"""
    print(f"Chargement du fichier chiffré : {chemin_audio_chiffre}")
    _, data = charger_audio_wav(chemin_audio_chiffre)
    
    cle_privee = clePrivee(cles)
    n, d = cle_privee
    
    print(f"Clé privée : n={n}, d={d}")
    print("Déchiffrement des samples...")
    
    start_time = time()
    # Appliquer RSA inverse à chaque sample : decrypted = (encrypted^d) % n
    decrypted = np.asarray([(sample ** d) % n for sample in data], dtype=np.int32)
    end_time = time()
    
    print(f"Temps de déchiffrement : {end_time - start_time:.2f} secondes")
    
    print(f"Sauvegarde du fichier déchiffré : {chemin_audio_sortie}")
    sauvegarder_audio_wav(chemin_audio_sortie, fs, decrypted)
    print(f"Fichier déchiffré sauvegardé")


def test_audio():
    print("=== Test de chiffrement/déchiffrement d'audio RSA ===\n")
    
    # Chemins des fichiers
    chemin_audio_original = "c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/test2.wav"
    chemin_audio_chiffre = "c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/audio_chiffre.wav"
    chemin_audio_dechiffre = "c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/audio_dechiffre.wav"
    
    print("--- CHIFFREMENT ---")
    cles, fs = chiffrer_audio_wav(chemin_audio_original, chemin_audio_chiffre, inf=100, lg=500)
    
    print("\n--- DÉCHIFFREMENT ---")
    dechiffrer_audio_wav(chemin_audio_chiffre, chemin_audio_dechiffre, cles, fs)

    print("\n--- VÉRIFICATION ---")
    _, donnees_originales = charger_audio_wav(chemin_audio_original)
    _, donnees_dechiffrees = charger_audio_wav(chemin_audio_dechiffre)
    
    if np.array_equal(donnees_originales, donnees_dechiffrees):
        print("✓ Les données déchiffrées correspondent exactement aux données originales !")
    else:
        print("✗ Les données ne correspondent pas !")
        print(f"Taille originale : {len(donnees_originales)} samples")
        print(f"Taille déchiffrée : {len(donnees_dechiffrees)} samples")
    
    print("\n--- LECTURE AUDIO ---")
    print("Lecture de l'audio original...")
    sd.play(donnees_originales, fs)
    sd.wait()
    
    print("Lecture de l'audio déchiffré...")
    sd.play(donnees_dechiffrees, fs)
    sd.wait()


if __name__ == "__main__":
    test_audio()
