const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  tipo: { type: String, enum: ['entrada', 'salida'], required: true },
  cantidad: { type: Number, required: true, min: 1 },
  stockAntes: { type: Number, required: true, min: 0 },
  stockDespues: { type: Number, required: true, min: 0 },
}, { timestamps: true, versionKey: false });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
