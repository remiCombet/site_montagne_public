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
    try {
        const receptionPoints = await ReceptionPoint.findAll();
        res.json({
            status: 200,
            data: receptionPoints,
        });
    } catch (error) {
        console.error(error);
        res.json({
            status: 500,
            msg: "Erreur lors de la récupération des points de réception",
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

// Récupérer un point de réception par receptionPointId
exports.getReceptionPointByStayId = async (req, res) => {
    const { receptionPointId } = req.params;

    try {
        // Chercher le point de réception avec receptionPointId
        const receptionPoint = await ReceptionPoint.findByPk(receptionPointId);

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

// Mettre à jour un point de réception
exports.updateReceptionPoint = async (req, res) => {
    const { id } = req.params;
    const { location, contact_name, contact_phone, contact_email, opening_time, closing_time } = req.body;

    try {
        const receptionPoint = await ReceptionPoint.findByPk(id);

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
    const { id } = req.params;

    try {
        const receptionPoint = await ReceptionPoint.findByPk(id);

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
        res.json({
            status: 500,
            msg: "Erreur lors de la suppression du point de réception",
        });
    }
};
