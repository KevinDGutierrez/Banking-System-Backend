import dayjs from 'dayjs';
import { Schema, model } from 'mongoose';

const CreditoSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: [true, "El usuario es requerido"],
        ref: "User"
    },
    montoSolicitado: {
        type: Number,
        default: 0
    },
    montoAprobado: {
        type: Number,
        default: 0
    },
    plazo: {
        type: Number,
        required: [true, "El plazo es requerido"]
    },
    fechaAprobacion: {
        type: String,
        default: () => dayjs().format("DD-MM-YYYY")
    },
    fechaVencimiento: {
        type: String,
        default: () => dayjs().add(12, 'month').format("DD-MM-YYYY")
    },
    moneda: {
        type: String,
        enum: ['GTQ', 'USD', 'EUR'],
        default: 'GTQ'
    },
    status: {
        type: Boolean,
        default: false
    },
    yaAprobado: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    versionKey: false
})

CreditoSchema.methods.aprobarCredito = async function (montoAprobado) {
    this.status = true;
    this.yaAprobado = true;
    this.montoAprobado = montoAprobado || this.montoSolicitado;
    await this.save();
}

export default model("Credito", CreditoSchema);