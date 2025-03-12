# Introduction
Ce document détaille les choix techniques particuliers effectués lors du développement du backend de l'application pour un guide de montagne. Il met en lumière les solutions créatives mises en œuvre pour répondre à des besoins spécifiques.


## Architecture générale

Le backend est construit avec:
- **Node.js & Express** : Pour l'API REST
- **Sequelize ORM** : Pour les interactions avec la base de données MySQL
- **JWT** : Pour l'authentification
- **Express-validator** : Pour la validation des données
- **Cloudinary** : Pour la gestion des images

## 1. Middleware de validation conditionnelle pour les images d'articles

### Problème
Les opérations de mise à jour d'images d'articles peuvent concerner différents aspects (texte alternatif, statut de miniature, fichier image), chacun nécessitant des validations spécifiques.

### Solution
Un middleware personnalisé qui analyse le contenu de la requête et applique dynamiquement les validations appropriées :

```javascript
router.put('/:imageId', 
    withAuth, 
    withAdminAuth, 
    // Middleware personnalisé pour sélectionner et appliquer les validations appropriées
    // selon le type de mise à jour demandée
    (req, res, next) => {
        // CAS 1: Mise à jour du texte alternatif (description de l'image)
        if (req.body.image_alt !== undefined) {
            // Applique chaque fonction de validation du tableau validateImageAlt
            validators.validateImageAlt.forEach(validator => {
                validator(req, res, () => {});
            });
            next();
        } 
        // CAS 2: Modification du statut de miniature
        else if (req.body.thumbnail !== undefined) {
            // Applique les validateurs spécifiques pour le champ thumbnail
            validators.validateThumbnail.forEach(validator => {
                validator(req, res, () => {});
            });
            next();
        } 
        // CAS 3: Téléchargement d'une nouvelle image
        else if (req.files?.image) {
            // Pour les fichiers images, la validation se fait côté contrôleur
            next();
        } 
        // CAS 4: Aucune modification valide n'a été envoyée
        else {
            return res.status(400).json({
                status: 400,
                message: "Aucune modification spécifiée"
            });
        }
    },
    validate, 
    articleImageController.updateImage
);
```

### Avantages
- **Flexibilité** : Permet d'appliquer différents ensembles de règles selon le contexte
- **Clarté des erreurs** : Chaque type d'opération génère des messages d'erreur spécifiques
- **Code DRY** : Évite la duplication de code en réutilisant les validateurs
- **API intuitive** : Une seule route avec une logique conditionnelle intelligente


## 2. Statut virtuel "fill_status" dans le modèle Stay

### Problème
Le statut de remplissage d'un séjour (complet, en attente, participants insuffisants) est une information dynamique qui dépend du nombre actuel de participants validés par rapport aux seuils minimum et maximum.

### Solution
Utilisation d'un attribut virtuel en combinaison avec des hooks Sequelize pour calculer ce statut à la volée :

```javascript
// Définir fill_status comme un attribut virtuel
fill_status: {
  type: DataTypes.VIRTUAL,
  get() {
    return this.calculateFillStatus();
  }
},

// Définir la méthode de calcul du statut
Stay.prototype.calculateFillStatus = function() {
  if (!this.stayParticipants) {
    return 'en_attente_de_validation';
  }

  // Compter le nombre de participants confirmés
  let confirmedParticipants = 0;
  this.stayParticipants.forEach(participant => {
    if (participant.status === 'validé') {
      confirmedParticipants += 1 + (participant.people_number || 0);
    }
  });

  // Déterminer le statut dynamique
  if (confirmedParticipants < this.min_participant) {
    return 'participants_insuffisants';
  } else if (confirmedParticipants >= this.max_participant) {
    return 'complet';
  } else {
    return 'en_attente_de_validation';
  }
};

// Hook pour précalculer le statut lors du chargement des données
Stay.addHook('afterFind', async (stays, options) => {
  if (!stays) return;
  
  if (!Array.isArray(stays)) {
    stays = [stays];
  }
  
  for (const stay of stays) {
    if (stay.stayParticipants) {
      // Calcul du statut et stockage dans dataValues pour accès direct
      let confirmedParticipants = 0;
      stay.stayParticipants
        .filter(participant => participant.status === 'validé')
        .forEach(participant => {
          confirmedParticipants += 1 + (participant.people_number || 0);
        });
      
      stay.dataValues.confirmedParticipants = confirmedParticipants;
      
      const fillStatus = confirmedParticipants < stay.min_participant 
        ? 'participants_insuffisants' 
        : confirmedParticipants >= stay.max_participant 
          ? 'complet' 
          : 'en_attente_de_validation';
          
      stay.dataValues.fill_status = fillStatus;
    }
  }
});
```

### Avantages
- **Données toujours à jour** : Le statut reflète l'état actuel des inscriptions
- **Encapsulation** : La logique métier reste dans le modèle
- **Économie en base** : Pas de colonne supplémentaire à synchroniser
- **Performance** : Précalcul via hook pour éviter des appels multiples à la méthode


## 3. Gestion des images avec Cloudinary

### Problème
Le stockage et la gestion des images d'articles nécessitent une solution robuste, avec gestion de la déduplication et optimisation pour le web.

### Solution
Service d'upload personnalisé utilisant Cloudinary avec détection des images existantes :

```javascript
// Service d'upload avec Cloudinary
async uploadImage(imagePath, folderName = 'montagne_app') {
    try {
        const result = await cloudinary.uploader.upload(
            imagePath,
            {
                folder: folderName,
                resource_type: 'image',
                use_filename: true,
                unique_filename: true
            }
        );
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Erreur lors de l\'upload de l\'image');
    }
}

// Dans le contrôleur, vérification si l'image existe déjà
const existingImage = await ArticleImage.findOne({
    where: { image_url: result.secure_url }
});

if (existingImage) {
    // Réutiliser l'image existante plutôt que d'en créer une nouvelle
    // Économise de l'espace de stockage et évite la duplication
}
```

### Avantages
- **Optimisation du stockage** : Détection et réutilisation des images existantes
- **Performance** : Images optimisées et servies via CDN
- **Sécurité** : Validation des types de fichiers
- **Flexibilité** : Support de différents formats et transformations


## 4. Système d'authentification à deux niveaux

### Problème
L'application nécessite différents niveaux d'accès (utilisateur standard, administrateur) avec des restrictions spécifiques.

### Solution
Middleware d'authentification à deux niveaux avec JWT :

```javascript
// Middleware d'authentification de base
const withAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ 
            status: 401, 
            message: 'Accès non autorisé: token manquant' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Erreur JWT:", error.message);
        return res.status(401).json({ 
            status: 401, 
            message: 'Accès non autorisé: token invalide' 
        });
    }
};

// Middleware supplémentaire pour vérifier le rôle administrateur
const withAdminAuth = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ 
            status: 403, 
            message: 'Accès interdit: privilèges administrateur requis' 
        });
    }
    next();
};
```

### Avantages
- **Séparation des préoccupations** : Un middleware vérifie l'authentification, l'autre l'autorisation
- **Réutilisabilité** : Les middlewares peuvent être appliqués séparément ou ensemble
- **Messages d'erreur clairs** : Distinction entre "non authentifié" et "non autorisé"
- **Sécurité renforcée** : Protection explicite des routes sensibles


## 5. Validation modulaire avec express-validator

### Problème
Les différentes routes de l'application nécessitent des validations spécifiques, avec certaines règles communes mais aussi des particularités.

### Solution
Organisation des validateurs en modules réutilisables avec composition :

```javascript
// Validateurs de base réutilisables
const titleValidator = body('title')
    .trim()
    .notEmpty().withMessage('Le titre est requis.')
    .isLength({ min: 3, max: 255 })
    .withMessage('Le titre doit contenir entre 3 et 255 caractères.')
    .escape();

// Composition de validateurs pour différentes entités
exports.validateArticle = [
    titleValidator,
    body('shortDescription')
        .trim()
        .notEmpty().withMessage('La description courte est requise.')
        .isLength({ min: 10, max: 500 })
        .withMessage('La description courte doit contenir entre 10 et 500 caractères.')
        .escape(),
    // autres validateurs...
];

exports.validateStay = [
    titleValidator,
    body('description')
        .trim()
        .notEmpty().withMessage('La description est requise.')
        .isLength({ min: 10 })
        .withMessage('La description doit contenir au moins 10 caractères.')
        .escape(),
    // autres validateurs spécifiques aux séjours...
];
```

### Avantages
- **Code DRY** : Réutilisation des règles communes
- **Maintenance** : Centralisation des règles de validation
- **Expressivité** : Les validateurs reflètent clairement les règles métier
- **Extensibilité** : Facilité d'ajout de nouvelles règles


## 6. Validation manuelle des tableaux dans le contrôleur

### Problème
La validation des tableaux de données (comme les descriptions d'images multiples) est complexe avec express-validator, particulièrement lorsque ces données sont envoyées via FormData avec des fichiers.

### Solution
Implémentation d'une validation manuelle directement dans le contrôleur pour les tableaux de descriptions d'images:

```javascript
// Validation manuelle des descriptions d'images
if (imageAlts && imageAlts.length > 0) {
    for (const alt of imageAlts) {
        if (typeof alt !== 'string' || alt.trim().length < 3 || alt.trim().length > 255) {
            return res.status(400).json({
                status: 400,
                message: "Chaque description d'image doit contenir entre 3 et 255 caractères"
            });
        }
        
        const regex = /^[a-zA-Z0-9àáâãäçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ\s.,!?-]+$/;
        if (!regex.test(alt.trim())) {
            return res.status(400).json({
                status: 400,
                message: "Les descriptions ne peuvent contenir que des lettres, chiffres et caractères spéciaux basiques"
            });
        }
    }
}
```

### Avantages
- **Flexibilité** : Gestion précise des tableaux et de leur contenu
- **Clarté des erreurs** : Messages d'erreur sur mesure pour chaque type de problème
- **Simplicité** : Solution directe sans configuration complexe de express-validator
- **Performance** : Validation arrêtée dès la première erreur rencontrée
- **Cohérence** : Validation effectuée au plus près du traitement des données


## 7. Factory de Helpers pour la gestion des images

### Problème
Avec la gestion d'images pour différentes entités (articles, séjours), nous risquions une duplication importante de code pour des fonctionnalités similaires, compliquant la maintenance et augmentant le risque d'incohérences.

### Solution
Implémentation d'un pattern Factory qui génère dynamiquement des helpers adaptés à chaque type d'entité :

```javascript
// Factory qui crée des helpers d'images spécifiques à une entité
const createImageHelpers = (entityType, EntityImageModel) => {
    // Configuration dynamique basée sur le type d'entité
    const cloudinaryFolder = entityType === 'article' ? 'articles' : 'stays';
    const foreignKeyName = entityType === 'article' ? 'article_id' : 'stay_id';
    
    // Création de l'objet helpers avec toutes les méthodes nécessaires
    const helpers = {
        checkImageExists: async (imageUrl) => {
            // Vérification si l'image existe dans Cloudinary
        },
        
        checkImageExistsInEntity: async (entityId, fileName, excludeImageId = null) => {
            // Vérification si l'image existe déjà pour cette entité
        },
        
        findImageByUrl: async (imageUrl) => {
            // Recherche d'une image par son URL
        },
        
        countImageUsage: async (imageUrl, excludeImageId = null) => {
            // Compte le nombre d'utilisations d'une image
        }
    };
    
    // Ajout de méthodes complexes qui utilisent les méthodes de base
    helpers.checkAndGetExistingImage = async (entityId, fileName) => {
        // Utilisation des autres méthodes helpers pour une vérification complète
    };
    
    return helpers;
};

// Utilisation pour créer des helpers spécifiques
const articleImageHelpers = createImageHelpers('article', ArticleImage);
const stayImageHelpers = createImageHelpers('stay', StayImage);
```

### Avantages
- **Code DRY** : Une source unique pour la logique de gestion des images
- **Maintenance simplifiée** : Les modifications se font à un seul endroit
- **Cohérence** : Même logique appliquée uniformément à toutes les entités
- **Extensibilité** : Facile d'ajouter le support pour de nouveaux types d'entités
- **Configuration dynamique** : Adaptation automatique des clés et des dossiers


# Conclusion 
Ces choix techniques démontrent une approche réfléchie du développement, avec un souci constant d'équilibrer la qualité du code, la maintenabilité et les besoins spécifiques de l'application.