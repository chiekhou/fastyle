'use strict';
require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Tester la connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL établie.');

    // Démarrer le serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement : ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API disponible sur : http://localhost:${PORT}/api`);
      console.log(`❤️  Health check : http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Impossible de démarrer le serveur :', err);
    process.exit(1);
  }
};

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('⚠️  Signal SIGTERM reçu. Arrêt en cours...');
  await sequelize.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesse rejetée non gérée :', reason);
  process.exit(1);
});

startServer();
