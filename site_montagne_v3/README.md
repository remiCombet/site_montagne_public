# Site Montagne V3

## Description
Site Montagne V3 est un projet de gestion d'articles pour un site web dédié à la montagne. Il permet à un administrateur de gérer les articles, y compris l'ajout, la modification et la suppression d'articles, ainsi que la gestion des images associées.

## Structure du projet
Le projet est structuré comme suit :

```
site_montagne_v3
├── front
│   ├── src
│   │   ├── sass
│   │   │   ├── components
│   │   │   │   ├── _stayImage.scss
│   │   │   │   └── _editableComponent.scss
│   │   │   ├── utils
│   │   │   │   ├── _variables.scss
│   │   │   │   └── _mixins.scss
│   │   │   ├── main.scss
│   │   ├── components
│   │   │   └── autre
│   │   │       └── articles
│   │   │           ├── article.jsx
│   │   │           ├── articleList.jsx
│   │   │           └── articleForm.jsx
│   │   └── api
│   │       └── publicApi.js
└── README.md
```

## Technologies utilisées
- React pour la création de l'interface utilisateur.
- SASS pour la gestion des styles.
- Express pour le backend (si applicable).
- Cloudinary pour la gestion des images.

## Installation
1. Clonez le dépôt :
   ```
   git clone <url-du-dépôt>
   ```
2. Accédez au répertoire du projet :
   ```
   cd site_montagne_v3
   ```
3. Installez les dépendances :
   ```
   npm install
   ```

## Utilisation
Pour démarrer le projet, utilisez la commande suivante :
```
npm start
```

## Contribuer
Les contributions sont les bienvenues ! Veuillez soumettre une demande de tirage pour toute modification.

## License
Ce projet est sous licence MIT.