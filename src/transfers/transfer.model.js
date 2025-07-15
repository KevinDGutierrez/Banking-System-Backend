import { Schema, model } from 'mongoose';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

const TransferSchema = new Schema({
  emisor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receptor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cuentaEmisor: {
    type: Schema.Types.ObjectId,
    ref: 'Cuenta',
    required: true
  },
  tipoCuentaEmisor: {
    type: String,
    enum: ['ahorro', 'monetaria', 'empresarial'],
    required: true
  },
  cuentaReceptor: {
    type: Schema.Types.ObjectId,
    ref: 'Cuenta',
    required: true
  },
  tipoCuentaReceptor: {
    type: String,
    enum: ['ahorro', 'monetaria', 'empresarial'],
    required: true
  },
  monto: {
    type: Number,
    required: true,
    min: [1, 'El monto mínimo debe ser mayor a 0']
  },
  moneda: {
    type: String,
    enum: ['GTQ', 'USD', 'EUR'],
    default: 'GTQ'
  },
  fecha: {
    type: String,
    default: () => dayjs().format("DD-MM-YYYY HH:mm:ss")
  },
  aliasReceptor: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  referencia: {
    type: String,
    default: () => `REF-${nanoid(10)}`
  },
  bancoReceptor: {
    type: Schema.Types.ObjectId,
    ref: 'Banking',
    required: [true, 'El banco receptor es obligatorio']
  }
  
}, {
  timestamps: true,
  versionKey: false
});

export default model("Transfer", TransferSchema);
