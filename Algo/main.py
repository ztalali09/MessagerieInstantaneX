import time
from mess import *
from audio import *


def main_mess():
    start_time = time()

    with open("c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/test.txt", "r", encoding="utf-8") as f:
        texte = f.read()

    message = testCompletRSA(1000, 10000, 1, texte)   

    with open("c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/retour.txt", "w", encoding="utf-8") as f:
        f.write(message)
    
    end_time = time()

    print("Temps d'execution :", end_time - start_time)

#main_mess() # environ 35.29 secondes pour un message de 7542 ko

def main_audio():
    start_time = time()

    test_audio()

    end_time = time()

    print("Temps d'execution audio :", end_time - start_time)


main_audio()  # environ  secondes pour un fichier audio de  Mo
