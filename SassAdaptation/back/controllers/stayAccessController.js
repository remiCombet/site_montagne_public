const { StayAccess, Stay, Access } = require('../models');

// Ajouter un accès à un séjour
exports.addStayAccess = async (req, res) => {
    const { stayId, accessId } = req.params;
    
    try {
        // Vérifier si l'accès est déjà associé à ce séjour
        const existingAssociation = await StayAccess.findOne({
            where: { 
                stay_id: stayId, 
                access_id: accessId 
            }
        });

        if (existingAssociation) {
            return res.status(400).json({ 
                status: 400, 
                msg: "Cet accès est déjà associé à ce séjour." 
            });
        }

        const stayAccess = await StayAccess.create({
            stay_id: stayId,
            access_id: accessId
        });

        res.json({
            status: 201,
            msg: 'Accès ajouté au séjour avec succès',
            access: stayAccess
        });

    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Oups, une erreur est survenue",
            error: error
        });
    }
};

// Récupérer tous les accès liés à un séjour
exports.getAccessByStay = async (req, res) => {
    const { stayId } = req.params;

    try {
        const stayAccesses = await StayAccess.findAll({
            where: { stay_id: stayId },
            include: [{ 
                model: Access,
                as: 'access',
                attributes: ['id', 'category', 'informations']
            }],
            attributes: ['id']
        });

        if (stayAccesses.length === 0) {
            return res.json({
                status: 404,
                msg: 'Aucun accès trouvé pour ce séjour.'
            });
        }

        // Transformation des données pour un format plus simple
        const formattedAccesses = stayAccesses.map(sa => ({
            id: sa.access.id,
            category: sa.access.category,
            informations: sa.access.informations,
            stayAccessId: sa.id
        }));

        res.json({
            status: 200,
            msg: 'Accès récupérés avec succès',
            accesses: formattedAccesses
        });

    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Oups, une erreur est survenue"
        });
    }
};

// Supprimer un accès d'un séjour
exports.removeStayAccess = async (req, res) => {
    const { stayId, accessId } = req.params;

    try {
        const deleted = await StayAccess.destroy({
            where: {
                stay_id: stayId,
                access_id: accessId
            }
        });

        if (deleted) {
            res.json({
                status: 200,
                msg: 'Accès supprimé du séjour avec succès'
            });
        } else {
            res.json({
                status: 404,
                msg: 'Association non trouvée'
            });
        }

    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Oups, une erreur est survenue"
        });
    }
};

// Vérifier si un accès est utilisé par d'autres séjours
exports.checkAccessUsage = async (req, res) => {
    const { accessId } = req.params;
    
    try {
        const usages = await StayAccess.findAll({
            where: { access_id: accessId },
            include: [{ 
                model: Stay,
                as: 'stay',
                attributes: ['id', 'title']
            }]
        });

        res.json({
            status: 200,
            isUsed: usages.length > 0,
            usages: usages.map(usage => ({
                stayId: usage.stay.id,
                stayTitle: usage.stay.title
            }))
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors de la vérification de l'utilisation de l'accès"
        });
    }
};