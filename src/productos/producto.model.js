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

    puntos: {
        type: Number,
        required: [true, "Name is required!"],
        max: [100000, "El máximo de puntos es 100,000!"],
        min: [1000, "El mínimo de carácteres es 1,000!"],
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