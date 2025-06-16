import { Schema, model } from "mongoose";

const ServicioSchema = Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es requerido!"],
        maxLength: [200, "El máximo de carácteres es 200!"],
        lowercase: true
    },

    descripcion: {
        type: String,
        required: [true, "La descripción es requerida!"],
        maxLength: [5000, "El máximo de carácteres es 5,000!"],
    },
    precio: {
        type: Number,
        required: [true, "El precio es requerido!"],
        max: [100000, "El máximo del precio es 100,000!"],
        min: [1, "El mínimo del precio es 1!"],
        default: 1
    },
    puntos: {
        type: Number,
        required: [true, "La cantidad de puntos es requerida!"],
        max: [100000, "El máximo de puntos es 100,000!"],
        min: [1000, "El mínimo de puntos es 1,000!"],
        default: 1000
    },

    moneda: {
        type: String,
        enum: ['GTQ', 'USD', 'EUR'],
        default: 'GTQ'
    },

    status: {
        type: Boolean,
        default: true,
    }

}, {
    timestamps: true,
    versionKey: false
});

export default model('Servicio', ServicioSchema);