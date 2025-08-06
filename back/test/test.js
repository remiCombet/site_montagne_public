const express = require('express');
const { Stay, StayRequest } = require ('../models');

const check = async (req, res, next) => {
    const { stayId } = req.body;
    console.log('stayId : ', stayId);

    try {
        const stay = await Stay.findByPk(stayId);
        if (!stay) {
            return res.status(404).json({ status: 404, msg: "Stay not found" });
        }
        console.log('oui: ', stay);

        
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, msg: "Erreur serveur" });
    }
};

module.exports = check;