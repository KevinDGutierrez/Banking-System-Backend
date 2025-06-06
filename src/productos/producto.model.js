import { Schema, model } from "mongoose";

const ProductoSchema = Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es requerido!"],
        maxLength: [200, "El máximo de carácteres es 200!"],
    },

    descripcion: {
        type: String,
        required: [true, "La descripción es requerida!"],
        maxLength: [5000, "El máximo de carácteres es 5,000!"],
    },

    existencias: {
        type: Number,
        required: [true, "La cantidad de existencias es requerida!"],
        max: [100, "El máximo de existentes es 100!"],
        min: [1, "El mínimo de existentes es 1!"],
        default: 1
    },

    puntos: {
        type: Number,
        required: [true, "La cantidad de puntos es requerida!"],
        max: [100000, "El máximo de puntos es 100,000!"],
        min: [1000, "El mínimo de puntos es 1,000!"],
        default: 1000
    },

    status: {
        type: Boolean,
        default: true,
    }

}, {
    timestamps: true,
    versionKey: false
});

export default model('Producto', ProductoSchema);