const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const { Sequelize } = require('sequelize');
const db = require('./models');
const cors = require('cors');
const helmet = require('helmet');

// Routes
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes')
const stayRoutes = require('./routes/stayRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const highlightsRoutes = require('./routes/highlightRoutes');
const themeRoutes = require('./routes/themeRoutes');
const accessRoutes = require('./routes/accessRoutes');
const stayAccessRoutes = require('./routes/stayAccessRoutes');
const stayEquipmentRoutes = require('./routes/stayEquipmentRoutes');
const stayThemeRoutes = require('./routes/stayThemeRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const stayStepRoutes = require('./routes/stayStepRoutes');
const stayToPrepareRoutes = require('./routes/stayToPrepareRoutes');
const receptionPointRoutes = require('./routes/receptionPointRoutes');
const stayParticipantsRoutes = require('./routes/stayParticipantsRoutes');

app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
// routes utilisateurs
app.use('/api/users', userRoutes);

// routes de connexion
app.use('/api/login', loginRoutes);

// routes séjour
app.use('/api/stays', stayRoutes);

// routes catégories
app.use('/api/categories', categoryRoutes);

// routes points positifs
app.use('/api/highlights', highlightsRoutes);

// routes acces
app.use('/api/accesses', accessRoutes);

// routes themes
app.use('/api/themes', themeRoutes);

// routes receptionPoint
app.use('/api/reception-point', receptionPointRoutes);

// routes stayAccess
app.use('/api/stay-accesses', stayAccessRoutes);

// routes stayCatégory
app.use('/api/stay-equipments', stayEquipmentRoutes);

// routes stayTheme
app.use('/api/stay-themes', stayThemeRoutes);

// routes accommodation
app.use('/api/accommodations', accommodationRoutes);

// routes pour stayStep
app.use('/api/stay-steps', stayStepRoutes);

// routes stayToPrepare
app.use('/api/stay-to-prepare', stayToPrepareRoutes);

// routes stayParticipants
app.use('/api/stay-participants', stayParticipantsRoutes);


const testRoutes = require('./routes/testRoutes');
app.use ('/api', testRoutes);

// Route d'accueil du site
app.get('/', async (req, res, next) => {
    res.json({
        status: 200,
        msg: "connecté à l'API du site Au Vas-nus-pieds"
    })
})

// Synchronisation des modèles avec la base de données
// db.sequelize.sync().then(() => {
//     app.listen(9500, () => {
//         console.log('Server is running on http://localhost:9500');
//     });
// });

app.listen(9500, () => {
    console.log('Server is running on http://localhost:9500');
});