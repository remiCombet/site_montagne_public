# Documentation de la Gestion d'Images Frontend

## Architecture et Principes

### Séparation des Responsabilités

L'architecture de gestion d'images suit une séparation claire des responsabilités :

- **Composants UI** : Utilisent des termes métier (`fichierImage`, `descriptionImage`, `estPrincipale`)
- **Couche API** : Transforme les termes métier en termes techniques attendus par le backend
- **Backend** : Reçoit des données aux formats techniques (`image`, `image_alt`, `thumbnail`)

### Terminologie

| Terme métier (UI) | Terme technique (API) | Description |
|-------------------|----------------------|-------------|
| `fichierImage` | `image` ou `images` | Fichier image à uploader |
| `descriptionImage` | `image_alt` | Texte alternatif de l'image |
| `estPrincipale` | `thumbnail` | Définit si l'image est la miniature principale |

## Fonctionnalités Complexes

### Détection de Doublons

Le système implémente une détection robuste des doublons d'images :

1. Normalisation des noms de fichiers (suppression des tirets, underscores, conversion en minuscules)
2. Vérification bidirectionnelle (A contient B ou B contient A)
3. Exclusion de l'image en cours d'édition lors des mises à jour

```jsx
const newFileName = newImage.name.split('.')[0].replace(/[-_]/g, '').toLowerCase();
const duplicateImage = images.find(existingImage => {
    const existingFileName = extractFileNameFromCloudinaryUrl(existingImage.url)
        .replace(/[-_]/g, '')
        .toLowerCase();
    return existingFileName.includes(newFileName) || newFileName.includes(existingFileName);
});