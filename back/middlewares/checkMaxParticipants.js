const express = require('express');
const { Stay, StayRequest } = require('../models');

// Middleware pour vérifier la capacité du séjour
const checkMaxParticipants = async (req, res, next) => {
    const { stayId, numberOfPeople, userId } = req.body;
    
    try {
        // Trouver le séjour correspondant
        const stay = await Stay.findByPk(stayId);
        if (!stay) {
            return res.status(404).json({ status: 404, msg: "Stay not found" });
        }

        // Récupérer le nombre total de participants pour ce séjour
        const totalParticipants = await StayRequest.sum('numberOfPeople', {
            where: { stayId }
        }) + 1;

        // Vérifier si la demande dépasse la capacité
        if (totalParticipants + numberOfPeople > stay.maxParticipants) {
            return res.status(400).json({
                status: 400,
                msg: `Le nombre total de participants pour ce séjour ne peut pas dépasser ${stay.maxParticipants}.`
            });
        }

        // Si tout va bien, passer au contrôleur suivant
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur" });
    }
};

module.exports = checkMaxParticipants;