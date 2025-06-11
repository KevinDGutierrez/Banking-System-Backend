import { Schema, model } from 'mongoose';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';

const InterbankTransferSchema = new Schema({
  emisor: {
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
  cuentaReceptorExterno: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: v => v.trim().length > 0,
      message: 'La cuenta del receptor externo es obligatoria'
    }
  },
  tipoCuentaReceptor: {
    type: String,
    enum: ['ahorro', 'monetaria', 'empresarial'],
    required: true
  },
  aliasReceptor: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
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
  bancoReceptor: {
    type: Schema.Types.ObjectId,
    ref: 'Banking',
    required: [true, 'El banco receptor es obligatorio']
  },
  fecha: {
    type: String,
    default: () => dayjs().format("DD-MM-YYYY HH:mm:ss")
  },
  referencia: {
    type: String,
    default: () => `REF-${nanoid(10)}`
  }
}, {
  timestamps: true,
  versionKey: false
});

export default model("InterbankTransfer", InterbankTransferSchema);
