const { ReceptionPoint, Stay } = require('../models'); // Assurez-vous que le modèle `ReceptionPoint` est bien importé

// Créer un point de réception
exports.createReceptionPoint = async (req, res) => {
    const { location, contact_name, contact_phone, contact_email, opening_time, closing_time } = req.body;

    try {
        const newReceptionPoint = await ReceptionPoint.create({
            location,
            contact_name,
            contact_phone,
            contact_email,
            opening_time,
            closing_time,
        });

        res.json({
            status: 201,
            msg: "Point de réception créé avec succès",
            data: newReceptionPoint,
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors de la création du point de réception",
        });
    }
};

// Récupérer tous les points de réception
exports.getAllReceptionPoints = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    try {
        const points = await ReceptionPoint.findAndCountAll({
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            status: 200,
            data: points.rows,
            total: points.count,
            currentPage: page,
            totalPages: Math.ceil(points.count / limit)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            status: 500,
            message: "Erreur lors de la récupération des points de réception" 
        });
    }
};

// Récupérer un point de réception par ID
exports.getReceptionPointById = async (req, res) => {
    const { id } = req.params;

    try {
        const receptionPoint = await ReceptionPoint.findByPk(id);

        if (!receptionPoint) {
            return res.json({
                status: 404,
                msg: "Point de réception non trouvé",
            });
        }

        res.json({
            status: 200,
            data: receptionPoint,
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors de la récupération du point de réception",
        });
    }
};

// Récupérer un point de réception pour un séjour
exports.getReceptionPointByStayId = async (req, res) => {
    const { stayId } = req.params;
    console.log('Recherche du point de réception pour le séjour:', stayId);

    try {
        const stay = await Stay.findByPk(stayId, {
            attributes: ["reception_point_id"],
        });
        console.log('Séjour trouvé:', stay);

        if (!stay || !stay.reception_point_id) {
            console.log('Aucun point de réception associé au séjour');
            return res.json({
                status: 404,
                msg: "Point de réception non trouvé pour ce séjour",
            });
        }

        const receptionPoint = await ReceptionPoint.findByPk(stay.reception_point_id);
        console.log('Point de réception trouvé:', receptionPoint);

        if (!receptionPoint) {
            return res.json({
                status: 404,
                msg: "Les informations du point de réception sont introuvables",
            });
        }

        res.json({
            status: 200,
            data: receptionPoint,
        });
    } catch (error) {
        console.error('Erreur complète:', error);
        res.json({
            status: 500,
            msg: "Erreur lors de la récupération du point de réception",
        });
    }
};

// Mettre à jour un point de réception
exports.updateReceptionPoint = async (req, res) => {
    const { receptionPointId } = req.params;
    const { location, contact_name, contact_phone, contact_email, opening_time, closing_time } = req.body;

    try {
        const receptionPoint = await ReceptionPoint.findByPk(receptionPointId);

        if (!receptionPoint) {
            return res.json({
                status: 404,
                msg: "Point de réception non trouvé",
            });
        }

        await receptionPoint.update({
            location,
            contact_name,
            contact_phone,
            contact_email,
            opening_time,
            closing_time,
        });

        res.json({
            status: 200,
            msg: "Point de réception mis à jour avec succès",
            data: receptionPoint,
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors de la mise à jour du point de réception",
        });
    }
};

// Supprimer un point de réception
exports.deleteReceptionPoint = async (req, res) => {
    const { receptionPointId } = req.params;

    try {
        const receptionPoint = await ReceptionPoint.findByPk(receptionPointId);

        if (!receptionPoint) {
            return res.json({
                status: 404,
                msg: "Point de réception non trouvé",
            });
        }

        await receptionPoint.destroy();

        res.json({
            status: 200,
            msg: "Point de réception supprimé avec succès",
        });
    } catch (error) {
        console.error(error);
        console.log(error)
        res.json({
            status: 500,
            msg: "Erreur lors de la suppression du point de réception",
        });
    }
};
