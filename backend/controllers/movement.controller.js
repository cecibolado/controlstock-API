const StockMovement = require('../models/StockMovement');

exports.list = async (req, res, next) => {
  try {
    const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 20, 1), 100);
    const filtro = {};
    if (req.query.tipo === 'entrada' || req.query.tipo === 'salida') filtro.tipo = req.query.tipo;
    const [movimientos, total] = await Promise.all([
      StockMovement.find(filtro).populate('producto', 'nombre sku imagen').sort({ createdAt: -1 }).skip((pagina - 1) * limite).limit(limite),
      StockMovement.countDocuments(filtro),
    ]);
    res.json({ movimientos, paginacion: { total, pagina, limite, paginas: Math.ceil(total / limite) } });
  } catch (error) { next(error); }
};
