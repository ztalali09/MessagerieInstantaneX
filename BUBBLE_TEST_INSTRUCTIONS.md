# 🧪 Instructions pour tester les bulles de chat

## 🚀 Comment accéder à la page de test

1. **Lancer l'application** (si ce n'est pas déjà fait) :
   ```bash
   cd /home/ztalali/Bureau/S3/MessagerieInstantaneX
   npm run dev
   ```

2. **Ouvrir votre navigateur** et aller à :
   ```
   http://localhost:5173/test-bubbles
   ```

## 📋 Ce que vous devez vérifier

### ✅ Tests automatiques sur la page

La page de test contient 9 scénarios différents :

1. **TEST 1** - Messages courts : Les mots doivent rester ensemble
2. **TEST 2** - Messages longs : Le texte doit se placer sur plusieurs lignes SANS casser les mots
3. **TEST 3** - Sauts de ligne manuels : Les retours à la ligne avec Shift+Enter doivent être respectés
4. **TEST 4** - URLs/Mots très longs : Doivent se casser SEULEMENT si nécessaire
5. **TEST 5** - Contenu mixte : Combinaison de texte et sauts de ligne
6. **TEST 6** - Mots simples : NE DOIVENT PAS se casser (c'est le problème principal)
7. **TEST 7** - Espaces multiples : Doivent être préservés
8. **TEST 8** - Code : Le formatage doit être préservé
9. **TEST 9** - Phrases courtes : Comportement normal attendu

### 🎯 Test interactif

En bas de la page, il y a une zone de test interactive :
- Tapez n'importe quel message
- Utilisez Shift+Enter pour ajouter des sauts de ligne
- Vérifiez que le message s'affiche correctement dans les deux bulles (envoyé/reçu)

## 🐛 Comportements à signaler

### ❌ Problèmes à identifier :

1. **Mots qui se cassent au milieu** :
   - Exemple : "Bonjour" devient "Bon-jour" ou "Bo-njour"
   - ❌ BAD: Chaque mot sur une ligne différente

2. **Sauts de ligne non respectés** :
   - Si vous tapez ligne1 + Shift+Enter + ligne2
   - Elles devraient apparaître sur 2 lignes différentes

3. **Espaces qui disparaissent** :
   - Les espaces multiples doivent être préservés

### ✅ Comportements attendus :

1. **Message court** : "Bonjour comment vas tu"
   - Devrait rester sur UNE ligne (ou se couper aux espaces si trop long)

2. **Message avec retour** : "Ligne 1\nLigne 2"
   - Devrait afficher sur DEUX lignes

3. **URL longue** : "https://example.com/very/long/url/..."
   - Peut se casser entre les / si nécessaire

## 📸 Screenshots à prendre

Si vous voyez des problèmes :
1. Prenez un screenshot du TEST 6 (mots simples)
2. Prenez un screenshot du TEST 9 (phrases courtes)
3. Prenez un screenshot de votre test interactif avec "Bonjour comment vas tu"

## 🔧 CSS actuellement appliqué

Le CSS affiché en bas de la page montre les propriétés actuelles :

```css
.matrix-message-sent, .matrix-message-received {
  white-space: pre-wrap;      /* Préserve les sauts de ligne */
  word-break: normal;          /* Ne casse PAS les mots */
  overflow-wrap: anywhere;     /* Casse SEULEMENT si nécessaire */
  display: block;              /* Comportement de bloc */
  padding: 8px 12px;
  margin: 4px 0;
  font-size: 15px;
  line-height: 1.4;
}
```

## 📝 Notes importantes

- **Cette page de test n'a pas besoin d'authentification**
- Elle utilise exactement les mêmes classes CSS que le vrai chat
- Tous les tests sont statiques sauf le test interactif
- Vous pouvez redimensionner la fenêtre pour tester le responsive

## 🔍 Vérifications spécifiques

### Pour le problème rapporté :
> "3 mots devient 3 lignes"

Regardez particulièrement :
- TEST 6 : "Bonjour", "Comment", "Va" (3 bulles séparées avec 1 mot chacune)
- TEST 9 : "Bonjour comment vas tu" (devrait être sur 1 ligne)

Si ces mots se retrouvent chacun sur une ligne différente **dans la même bulle**, c'est le problème !

## 🚨 Si le problème persiste

Si vous voyez encore des problèmes après avoir testé :
1. Ouvrez la console du navigateur (F12)
2. Inspectez un élément `.matrix-message-sent`
3. Regardez les propriétés CSS appliquées (onglet "Styles" ou "Computed")
4. Vérifiez s'il y a des classes Tailwind qui surchargent nos styles

---

**Prochaine étape** : Après avoir testé, dites-moi exactement quel(s) test(s) pose(nt) problème et je pourrai corriger précisément.


