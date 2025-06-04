import mongoose from "mongoose";


const cuentaSchema = new mongoose.Schema({

    numeroCuenta : { type: String, unique: true, required: true },
    propietario : {type : mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: true },
    tipo: { type: String, enum: ['ahorro', 'monetaria', 'empresarial'],    required: true},
    saldo : {type: Number, default: 0},
    moneda : {type : String, enum : ['GTQ', 'USD', 'EUR'], default: 'GTQ'},
    entidadBancaria : { type: String, required: true },
    fechaApertura : { type: Date, default: Date.now },
    estado : { type: String, enum: ['activa', 'bloqueada' ], default: 'activa' },
})


export default mongoose.model('Cuenta', cuentaSchema);