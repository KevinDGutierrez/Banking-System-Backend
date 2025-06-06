import mongoose from "mongoose";
import authUserModel from "../auth/authUser.model.js";

const cuentaSchema = new mongoose.Schema({

    numeroCuenta: { type: String, unique: true, required: true },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, enum: ['ahorro', 'monetaria', 'empresarial'] },
    saldo: { type: Number, default: 0 },
    moneda: { type: String, enum: ['GTQ', 'USD', 'EUR'], default: 'GTQ' },
    entidadBancaria: { type: mongoose.Schema.Types.ObjectId, ref: 'Banking', required: true },
    fechaApertura: { type: Date, default: Date.now },
    estado: { type: String, enum: ['activa', 'bloqueada'], default: 'bloqueada' },
})

export default mongoose.model('Cuenta', cuentaSchema);