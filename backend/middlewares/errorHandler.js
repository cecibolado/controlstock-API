function errorHandler(error, req, res, next) {
  console.error(error);
  if (error.name === 'ValidationError') return res.status(400).json({ mensaje: 'Datos inválidos', detalles: Object.values(error.errors).map((e) => e.message) });
  if (error.name === 'CastError') return res.status(400).json({ mensaje: 'Identificador inválido' });
  if (error.code === 11000) return res.status(409).json({ mensaje: 'El SKU ya existe' });
  res.status(500).json({ mensaje: 'Error interno del servidor' });
}
module.exports = errorHandler;