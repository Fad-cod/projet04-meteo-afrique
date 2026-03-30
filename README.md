# AfriMeteo ⛅ - Projet 04 : Météo Afrique

Bienvenue sur le **Projet 04** de la série de développement web : **AfriMeteo**.  
AfriMeteo est une application web de type tableau de bord (dashboard) météo dédiée spécifiquement aux grandes villes africaines. L’objectif principal est de proposer une lecture claire, rapide et moderne des conditions météorologiques avec une interface utilisateur dynamique et animée.

## 🌟 Fonctionnalités

- **Dashboard en temps réel :** Indicateurs clés, tendances et alertes visibles d’un seul coup d’œil.
- **Carte interactive :** Visualisation des conditions météorologiques dans les grandes zones urbaines d'Afrique.
- **Prévisions sur 7 jours :** Planification avec des prévisions détaillées.
- **Comparaison de villes :** Outil pour comparer la météo de plusieurs capitales africaines.
- **Animations modernes :** Interface fluide avec des animations d'apparition, de survol et de rafraîchissement au scroll (via `animations.css` et `animations.js`).

## 🛠️ Technologies utilisées

- **HTML5 :** Structure sémantique multipage (Accueil, Dashboard, Carte, Prévisions, Comparaison, À propos).
- **CSS3 :** Styles modernes (Flexbox/Grid), variables CSS, typographie importée (Google Fonts : DM Sans, Space Grotesk) et animations sur mesure.
- **JavaScript (Vanilla) :** Gestion de la logique d'animation (Intersection Observer), interactions du DOM et simulation des données.

## 🚀 Installation et exécution

Ce projet est purement front-end (HTML/CSS/JS). Aucun serveur backend complexe n'est requis pour le tester localement.

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/Fad-cod/projet04-meteo-afrique.git
   ```
2. **Ouvrir le projet**
   Allez dans le dossier du projet :
   ```bash
   cd projet04-meteo-afrique
   ```
3. **Lancer l'application**
   Ouvrez le fichier `index.html` directement dans votre navigateur web préféré (Chrome, Firefox, Safari, Edge), ou utilisez une extension comme **Live Server** sur VS Code pour une meilleure expérience d'itération.

## 📁 Structure du projet

```text
projet04-meteo-afrique/
├── index.html        # Page d'accueil
├── README.md         # Documentation du projet
├── assets/           # Images, icônes et autres ressources
├── css/              # Feuilles de styles (style-accueil.css, animations.css, etc.)
├── js/               # Scripts JavaScript (animations.js, etc.)
└── pages/            # Les différentes vues du dashboard
    ├── about.html
    ├── compare.html
    ├── dashboard.html
    ├── forecast.html
    └── map.html
```

