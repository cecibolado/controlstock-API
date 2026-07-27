require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000;
if (!process.env.MONGODB_URI) throw new Error('Falta MONGODB_URI en .env');
mongoose.connect(process.env.MONGODB_URI).then(() => app.listen(port, () => console.log(`controlstock-API disponible en http://localhost:${port}`))).catch((error) => { console.error('No se pudo iniciar la API:', error.message); process.exit(1); });
