const Product = require('../models/Product');

exports.create = async (req, res, next) => { try { const producto = await Product.create(req.body); res.status(201).json({ mensaje: 'Producto creado', producto }); } catch (error) { next(error); } };

exports.list = async (req, res, next) => {
  try {
    const pagina = Math.max(parseInt(req.query.pagina, 10) || 1, 1);
    const limite = Math.min(Math.max(parseInt(req.query.limite, 10) || 10, 1), 100);
    const filtros = {};
    if (req.query.categoria) filtros.categoria = new RegExp(`^${req.query.categoria}$`, 'i');
    if (req.query.buscar) { const texto = new RegExp(req.query.buscar, 'i'); filtros.$or = [{ nombre: texto }, { sku: texto }]; }
    if (req.query.bajoStock === 'true') filtros.$expr = { $lte: ['$stock', '$stockMinimo'] };
    const [productos, total] = await Promise.all([Product.find(filtros).sort({ createdAt: -1 }).skip((pagina - 1) * limite).limit(limite), Product.countDocuments(filtros)]);
    res.json({ productos, paginacion: { total, pagina, limite, paginas: Math.ceil(total / limite) } });
  } catch (error) { next(error); }
};

exports.getById = async (req, res, next) => { try { const producto = await Product.findById(req.params.id); if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' }); res.json({ producto }); } catch (error) { next(error); } };
exports.update = async (req, res, next) => { try { const producto = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' }); res.json({ mensaje: 'Producto actualizado', producto }); } catch (error) { next(error); } };
exports.remove = async (req, res, next) => { try { const producto = await Product.findByIdAndDelete(req.params.id); if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' }); res.status(204).send(); } catch (error) { next(error); } };
exports.adjustStock = async (req, res, next) => {
  try {
    const cantidad = Number(req.body.cantidad);
    if (!Number.isInteger(cantidad) || cantidad === 0) return res.status(400).json({ mensaje: 'cantidad debe ser un entero distinto de cero' });
    const producto = await Product.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    if (producto.stock + cantidad < 0) return res.status(400).json({ mensaje: 'Stock insuficiente para realizar la salida' });
    producto.stock += cantidad; await producto.save(); res.json({ mensaje: 'Stock actualizado', producto });
  } catch (error) { next(error); }
};
