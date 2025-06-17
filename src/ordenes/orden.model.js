import { Schema, model } from "mongoose";

const OrdenSchema = new Schema({
  cliente: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      tipo: { type: String, enum: ['producto', 'servicio'], required: true },
      nombre: { type: String, required: true },
      cantidad: { type: Number, default: 1 },
      precioUnitario: { type: Number },
      subtotal: { type: Number },
      puntos: { type: Number }
    }
  ],

  moneda: {
    type: String,
    enum: ['GTQ', 'USD', 'EUR'],
    required: true
  },

  metodoPago: {
    type: String,
    enum: ['dinero', 'puntos'],
    required: true
  },

  total: { type: Number, default: 0 },
  puntosUsados: { type: Number, default: 0 },
  puntosGanados: { type: Number, default: 0 },

}, {
  timestamps: true,
  versionKey: false
});

export default model("Orden", OrdenSchema);