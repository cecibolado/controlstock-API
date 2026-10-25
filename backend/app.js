const express = require('express');
const productRoutes = require('./routes/product.routes');
const movementRoutes = require('./routes/movement.routes');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(express.json());
app.get('/api/health', (req, res) => res.json({ estado: 'ok' }));
app.use('/api/productos', productRoutes);
app.use('/api/movimientos', movementRoutes);
const frontendDist = path.resolve(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.join(frontendDist, 'index.html')));
}
app.use((req, res) => res.status(404).json({ mensaje: 'Ruta no encontrada' }));
app.use(errorHandler);
module.exports = app;
