import { Schema, model } from "mongoose";


const UserSchema = Schema({
    name: { type: String },
    username: { type: String, unique: true, required: true },
    NoCuenta: { type: String, unique: true },
    dpi: { type: String, unique: true }, 
    direccion: { type: String },
    celular: { type: String }, 
    correo: { type: String, unique: true },
    password: { type: String, required: true },
    NameTrabajo: { type: String },
    role: { type: String, enum: ["ADMIN", "CLIENTE"], default: "CLIENTE" },
    ingresos: { type: Number },
    codigoGenerado : {type : Number } ,
    status: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
});



export default model('User', UserSchema)