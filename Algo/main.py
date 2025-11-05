import time
from mess import *


def main():
    start_time = time()

    with open("c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/test.txt", "r", encoding="utf-8") as f:
        texte = f.read()

    message = testCompletRSA(1000, 10000, 1, texte)   

    with open("c:/Users/maxou/Documents/Cours/IUT/S3/Cryptographie/Messagerie-instantan-/Algo/retour.txt", "w", encoding="utf-8") as f:
        f.write(message)
    
    end_time = time()

    print("Temps d'execution :", end_time - start_time)

main()