import mongoose from 'mongoose';

const favoritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuthUser',
    required: true
  },
  cuentaDestino: {
    type: String, 
    required: true
  },
  tipoCuenta: {
    type: String,
    enum: ['ahorro', 'monetaria', 'empresarial'],
    required: true
  },
  alias: {
    type: String,
    required: true
  }
});

export default mongoose.model('Favorito', favoritoSchema);
