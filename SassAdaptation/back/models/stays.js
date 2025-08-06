const {DataTypes} = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Stay = sequelize.define(
    'Stay',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      physical_level: {
        type: DataTypes.ENUM('facile', 'modéré', 'sportif', 'difficile', 'extrême'),
        allowNull: false,
      },
      technical_level: {
        type: DataTypes.ENUM('facile', 'modéré', 'sportif', 'difficile', 'extrême'),
        allowNull: false,
      },
      min_participant: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_participant: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      reception_point_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('en_attente', 'validé', 'refusé', 'annulé'),
        allowNull: false,
        defaultValue: 'en_attente',
      },
      // Définir fill_status comme un attribut virtuel
      fill_status: {
        type: DataTypes.VIRTUAL,
        get() {
          // Cette méthode sera appelée automatiquement quand l'attribut fill_status est demandé
          return this.calculateFillStatus();
        }
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'stays',
      timestamps: true,
    }
  );

  // Définir un prototype de la méthode calculateFillStatus pour une instance 
  Stay.prototype.calculateFillStatus = function() {
    if (!this.stayParticipants) {
      // Si les participants ne sont pas chargés, renvoyer une valeur par défaut
      return 'en_attente_de_validation';
    }

    // Compter le nombre de participants confirmés
    let confirmedParticipants = 0;
    this.stayParticipants.forEach(participant => {
      if (participant.status === 'validé') {
        // Compter le demandeur + accompagnants
        confirmedParticipants += 1 + (participant.people_number || 0);
      }
    });

    // Déterminer le statut
    if (confirmedParticipants < this.min_participant) {
      return 'participants_insuffisants';
    } else if (confirmedParticipants >= this.max_participant) {
      return 'complet';
    } else {
      return 'en_attente_de_validation';
    }
  };

  Stay.associate = function(models) {
    // Associations
    Stay.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });

    Stay.belongsTo(models.ReceptionPoint, {
      foreignKey: 'reception_point_id',
      as: 'receptionPoint',
    });

    Stay.hasMany(models.StayEquipment, {
      foreignKey: 'stay_id',
      as: 'equipments',
    });

    Stay.hasMany(models.StayTheme, {
      foreignKey: 'stay_id',
      as: 'stayThemes',
    });

    Stay.hasMany(models.StayStep, {
      foreignKey: 'stay_id',
      as: 'staySteps',
    });

    Stay.hasMany(models.StayToPrepare, {
      foreignKey: 'stay_id' ,
      as: 'toPrepares',
    });

    // Association avec StayParticipant (et non StayRequest)
    Stay.hasMany(models.StayParticipant, {
      foreignKey: 'stay_id',
      as: 'stayParticipants',
    });

    Stay.hasOne(models.StayImage, {
      foreignKey: 'stay_id',
      as: 'image',
      onDelete: 'CASCADE' 
    });

    // Déplacer la méthode statique ici pour avoir accès aux modèles
    Stay.calculateFillStatus = async function(stayId) {
      const stay = await this.findByPk(stayId, {
        include: [
          {
            model: models.StayParticipant,  // Utiliser le bon nom de modèle
            as: 'stayParticipants',  // Utiliser le même alias que dans l'association
            where: { status: 'validé' },
            required: false
          }
        ]
      });

      if (!stay) return null;

      // Compter le nombre de participants confirmés
      let confirmedParticipants = 0;
      if (stay.stayParticipants && stay.stayParticipants.length > 0) {
        stay.stayParticipants.forEach(participant => {
          confirmedParticipants += 1 + (participant.people_number || 0);
        });
      }

      // Déterminer le statut
      if (confirmedParticipants < stay.min_participant) {
        return 'participants_insuffisants';
      } else if (confirmedParticipants >= stay.max_participant) {
        return 'complet';
      } else {
        return 'en_attente_de_validation';
      }
    };
  };

  // Ajouter un hook pour initialiser le fill_status lors du chargement
  Stay.addHook('afterFind', async (stays, options) => {
    if (!stays) return;
    
    // Si c'est un seul séjour (non-array)
    if (!Array.isArray(stays)) {
      stays = [stays];
    }
    
    // Pour chaque séjour, calculer le fill_status si des stayParticipants sont chargés
    for (const stay of stays) {
      // Si les participants sont déjà chargés
      if (stay.stayParticipants) {
        let confirmedParticipants = 0;
        stay.stayParticipants
          .filter(participant => participant.status === 'validé')
          .forEach(participant => {
            confirmedParticipants += 1 + (participant.people_number || 0);
          });
        
        // Ajouter une propriété dataValues.confirmedParticipants pour usage dans les contrôleurs
        stay.dataValues.confirmedParticipants = confirmedParticipants;
        
        // Définir un getter personnalisé pour ce séjour spécifique
        const fillStatus = confirmedParticipants < stay.min_participant 
          ? 'participants_insuffisants' 
          : confirmedParticipants >= stay.max_participant 
            ? 'complet' 
            : 'en_attente_de_validation';
            
        stay.dataValues.fill_status = fillStatus;
      }
    }
  });

  return Stay;
};
