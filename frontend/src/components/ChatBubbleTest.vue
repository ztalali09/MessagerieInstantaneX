<template>
  <div class="min-h-screen bg-black p-4 md:p-8">
    <div class="max-w-4xl mx-auto">
      <div class="mb-6 text-center">
        <h1 class="text-2xl font-bold text-green-500 matrix-glow mb-2">[CHAT_BUBBLE_TEST]</h1>
        <p class="text-sm text-green-700 font-mono">Testing all message scenarios</p>
      </div>

      <div class="space-y-8">
        <!-- Test 1: Short message -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 1: Message court
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                Salut !
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                Bonjour comment ça va ?
              </div>
            </div>
          </div>
        </div>

        <!-- Test 2: Long message -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 2: Message long (devrait rester sur plusieurs lignes sans casser les mots)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                Voici un message beaucoup plus long qui devrait automatiquement se placer sur plusieurs lignes sans casser les mots au milieu. Les mots doivent rester entiers et le retour à la ligne se fait naturellement.
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                Et voici ma réponse qui est également assez longue pour tester le comportement des bulles de messages envoyés avec un texte qui dépasse la largeur normale.
              </div>
            </div>
          </div>
        </div>

        <!-- Test 3: Message with manual line breaks -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 3: Message avec sauts de ligne manuels (Shift+Enter)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">Ligne 1
Ligne 2
Ligne 3</div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">Première ligne
Deuxième ligne
Troisième ligne</div>
            </div>
          </div>
        </div>

        <!-- Test 4: Very long word/URL -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 4: Mot très long / URL (devrait se casser si nécessaire)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                https://www.example.com/very/long/url/that/should/break/properly/without/breaking/the/layout/completely
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                UnMotTresLongSansEspacesQuiDevraitEtreCasseSiNecessairePourNePasCasserLaMiseEnPage
              </div>
            </div>
          </div>
        </div>

        <!-- Test 5: Mixed content -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 5: Contenu mixte (texte + sauts de ligne + URLs)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">Regarde ce lien:
https://github.com/example/repository

C'est intéressant non ?</div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">Oui merci !

Je vais regarder ça
Dès que possible</div>
            </div>
          </div>
        </div>

        <!-- Test 6: Single words -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 6: Mots simples (ne doivent PAS se casser)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                Bonjour
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                Comment
              </div>
            </div>
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                Va
              </div>
            </div>
          </div>
        </div>

        <!-- Test 7: Multiple spaces -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 7: Espaces multiples (devraient être préservés)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                Mot1    Mot2        Mot3
              </div>
            </div>
          </div>
        </div>

        <!-- Test 8: Code-like content -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 8: Contenu type code (formatage préservé)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">function test() {
  console.log("Hello");
  return true;
}</div>
            </div>
          </div>
        </div>

        <!-- Test 9: Short phrases -->
        <div class="test-section">
          <h2 class="text-green-500 font-mono text-sm mb-3 border-b border-green-500/30 pb-2">
            TEST 9: Phrases courtes (problème rapporté par l'utilisateur)
          </h2>
          <div class="space-y-4">
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                Bonjour comment vas tu
              </div>
            </div>
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                Très bien merci
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                Super content de l'entendre
              </div>
            </div>
          </div>
        </div>

        <!-- Current CSS Display -->
        <div class="test-section border-2 border-green-500 p-4">
          <h2 class="text-green-500 font-mono text-sm mb-3">
            CSS APPLIQUÉ ACTUELLEMENT:
          </h2>
          <pre class="text-xs text-green-400 font-mono overflow-x-auto">{{ currentCSS }}</pre>
        </div>

        <!-- Interactive Test -->
        <div class="test-section border-2 border-green-500 p-4">
          <h2 class="text-green-500 font-mono text-sm mb-3">
            TEST INTERACTIF: Tapez votre message
          </h2>
          <textarea
            v-model="customMessage"
            class="matrix-input w-full p-3 mb-4 min-h-[100px] resize-y"
            placeholder="> Tapez votre message ici (Shift+Enter pour saut de ligne)..."
          ></textarea>
          <div class="space-y-4">
            <div class="flex flex-col items-start">
              <div class="matrix-message-received max-w-[85%] lg:max-w-[70%]">
                {{ customMessage || 'Votre message apparaîtra ici...' }}
              </div>
            </div>
            <div class="flex flex-col items-end">
              <div class="matrix-message-sent max-w-[85%] lg:max-w-[70%]">
                {{ customMessage || 'Votre message apparaîtra ici...' }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const customMessage = ref('');

const currentCSS = `
.matrix-message-sent, .matrix-message-received {
  white-space: pre-wrap;
  word-break: normal;
  overflow-wrap: anywhere;
  display: block;
  padding: 8px 12px;
  margin: 4px 0;
  font-size: 15px;
  line-height: 1.4;
}
`;
</script>

<style scoped>
.test-section {
  background: rgba(0, 20, 0, 0.2);
  border: 1px solid rgba(0, 255, 65, 0.2);
  padding: 1rem;
  border-radius: 4px;
}
</style>


