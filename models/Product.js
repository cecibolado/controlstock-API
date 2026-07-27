const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, maxlength: 100 },
  sku: { type: String, required: true, trim: true, uppercase: true, unique: true, maxlength: 40 },
  descripcion: { type: String, trim: true, maxlength: 500, default: '' },
  categoria: { type: String, required: true, trim: true, maxlength: 60 },
  precio: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  stockMinimo: { type: Number, required: true, min: 0, default: 0 },
  activo: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('Product', productSchema);