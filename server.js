const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors');
const helmet = require('helmet');

// Routes
const userRoutes = require('./routes/userRoutes');
const stayRoutes = require('./routes/stayRoutes');

app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
// routes utilisateurs
app.use('/api/users', userRoutes);

// routes séjour
app.use('/api/stays', stayRoutes);

// Route d'accueil du site
app.get('/', async (req, res, next) => {
    res.json({
        status: 200,
        msg: "connecté à l'API du site Au Vas-nus-pieds"
    })
})

// Synchronisation des modèles avec la base de données
db.sequelize.sync().then(() => {
    app.listen(9500, () => {
        console.log('Server is running on http://localhost:9500');
    });
});