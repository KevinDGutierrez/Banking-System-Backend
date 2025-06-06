import mongoose from 'mongoose';

const favoritoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cuentaDestino: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cuenta',
    required: true
  },
  tipoCuenta: {
    type: String,
    ref: 'Cuenta',
  },
  alias: {
    type: String,
    required: true
  }
});

export default mongoose.model('Favorito', favoritoSchema);