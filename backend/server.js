require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const app = require('./app');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const dbName = process.env.MONGODB_DB || 'controlstock';
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('No se pudo iniciar la API: falta MONGODB_URI en .env.');
  process.exit(1);
}

mongoose.connect(mongoUri, { dbName })
  .then(() => {
    app.listen(port, () => {
      console.log(`controlstock disponible en http://localhost:${port}`);
      console.log(`Base de datos conectada: ${mongoose.connection.name}`);
    });
  })
  .catch((error) => {
    console.error('No se pudo conectar con MongoDB:', error.message);
    process.exit(1);
  });
