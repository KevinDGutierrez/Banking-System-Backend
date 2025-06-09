import mongoose from "mongoose";

const bankingSchema = new mongoose.Schema({
    name: { type: String, required: true, lowercase: true },
    description: { type: String, required: true },
    pais: { type: String, default: 'Guatemala' },
    moneda: { type: String, enum: ['GTQ', 'USD', 'EUR'], default: 'GTQ' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, {
    timestamps: true,
    versionKey: false
})

export default mongoose.model('Banking', bankingSchema);