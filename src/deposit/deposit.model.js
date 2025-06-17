import {Schema, model} from 'mongoose'

const depositoSchema = Schema({
    cuenta:{type: Schema.Types.ObjectId,required: [true, "El numero de cuenta es requerido"],ref: "Cuenta"},
    fecha:{type: Date,default: Date.now()},
    monto:{type: Number, required:[true,"El monto del deposito es necesario"]},
    moneda: {type: String, enum: ['GTQ', 'USD', 'EUR'], default: 'GTQ'},
    descripcion:{type: String},
    status: {type: Boolean,default: true}
}, {
    timestamps: true,
    versionKey: false
})

export default model('Deposit', depositoSchema)