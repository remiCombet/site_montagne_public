# Conventions de nommage

## Gestion d'images

### Frontend (Termes métier)
- `fichierImage`: Fichier à uploader
- `descriptionImage`: Texte alternatif de l'image 
- `estPrincipale`: Statut de miniature principale

### API Frontend (Transformation)
- Transforme `fichierImage` → `images` (ajout) ou `image` (modification)
- Transforme `descriptionImage` → `image_alt`
- Transforme `estPrincipale` → `thumbnail`

### Backend (Termes techniques)
- `images` ou `image`: Fichier d'image
- `image_alt`: Description de l'image
- `thumbnail`: Indicateur de miniature (booléen)
