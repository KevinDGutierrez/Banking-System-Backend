import { Schema, model } from "mongoose";


const UserSchema = Schema({
    name: { type: String },
    username: { type: String, unique: [true, "Usuario ya existe en nuestro banco."], required: true },
    NoCuenta: { type: String, unique: [true, "Número de cuenta ya existe en nuestro banco."] },
    dpi: { type: String, unique: [true, "Dpi ya existe en nuestro banco."] },
    direccion: { type: String },
    celular: { type: String, unique: [true, "Celular ya existe en nuestro banco"] }, 
    correo: { type: String, unique: [true, "Correo ya existe en nuestro banco."] },
    password: { type: String, required: true },
    NameTrabajo: { type: String },
    role: { type: String, enum: ["ADMIN", "CLIENTE"], default: "CLIENTE" },
    ingresos: { type: Number },
    codigoGenerado : {type : String}, 
    codigoGeneradoCreatedAt : {type : Date}, 
    datosPendientes: {type: Object, default: null},
    puntos: { type: Number, default: 0 },
    status: { type: Boolean, default: false }
}, {
    timestamps: true,
    versionKey: false
});



export default model('User', UserSchema)