import mongoose from "mongoose";


const cuentaSchema = new mongoose.Schema({

    numeroCuenta : { type: String, unique: true, required: true },
    propietario : {type : mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: true },
    tipo: { type: String, enum: ['ahorro', 'corriente', 'nomina', 'empresarial'],    required: true},
    saldo : {type: Number, default: 0},
    moneda : {type : String, enum : ['GTQ', 'USD', 'EUR'], default: 'GTQ'},
    entidadBancaria : { type: String, required: true },
    fechaApertura : { type: Date, default: Date.now },
    estado : { type: String, enum: ['activa', 'bloqueada' ], default: 'activa' },
    tasaInteres : { type: Number, default: 0 },
})


export default mongoose.model('Cuenta', cuentaSchema);