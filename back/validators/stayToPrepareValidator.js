// validators/stayToPrepareValidator.js
const { check, param } = require('express-validator');
const { Stay, Category } = require('../models');

module.exports = {
    validateAddStayToPrepare: [
        // Validation du stayId dans l'URL
        param('stay_id')
            .trim()
            .notEmpty()
            .toInt()
            .custom(async (value, { req }) => {
                console.log('Validation stay_id:', {
                    value,
                    type: typeof value,
                    params: req.params
                });
                
                const stay = await Stay.findByPk(value);
                if (!stay) {
                    throw new Error("Le séjour avec cet ID n'existe pas");
                }
                return true;
            }),

        // Validation du category_id dans le body
        check('category_id')
            .trim()
            .notEmpty()
            .toInt()
            .custom(async (value, { req }) => {
                console.log('Validation category_id:', {
                    value,
                    type: typeof value,
                    body: req.body
                });

                const category = await Category.findByPk(value);
                if (!category) {
                    throw new Error("La catégorie avec cet ID n'existe pas");
                }
                return true;
            })
    ],

    validateDeleteStayToPrepare: [
        param('stay_id')
            .trim()
            .notEmpty()
            .toInt()
            .custom(async (value, { req }) => {
                const stay = await Stay.findByPk(value);
                if (!stay) {
                    throw new Error("Le séjour avec cet ID n'existe pas");
                }
                return true;
            }),

        param('category_id')
            .trim()
            .notEmpty()
            .toInt()
            .custom(async (value, { req }) => {
                const category = await Category.findByPk(value);
                if (!category) {
                    throw new Error("La catégorie avec cet ID n'existe pas");
                }
                return true;
            })
    ]
};
