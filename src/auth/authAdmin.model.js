import { Schema } from "mongoose";


const AdminSchema = Schema({

    name: {
        type: String,
    },
    username : {
        type : String,
        unique: true
    },
    NoCuenta : {
        type : String,
        unique: true
    },
    dpi : {
        type: String,
        unique : true
    },
    direccion : {
        type: String,
        unique : true
    },
    celular : {
        type : String,
        unique : true
    },
    correo : {
        type : String,
        unique: true
    },
    password: {
        type: String,
        required : true
    },
    NameTrabajo : {
        type: String,
        required : true
    },
    role : {
        type: String,
        enum : ["ADMIN", "CLIENTE"],
        default : "CLIENTE"
    },
    ingresos : {
        type : Number,
        required : true  
    },
    status : {
        type : Boolean,
        default : false
    },
}, {
    timestamps: true,
    versionKey: false
})


export default model('Admin', AdminSchema)