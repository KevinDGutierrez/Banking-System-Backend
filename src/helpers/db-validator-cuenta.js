import cuentaModel from "../account/account.model.js";
import authUserModel from "../auth/authUser.model.js";


export const validarPropietarioCuenta = async (userId, cuentaId) => {
  const cuenta = await cuentaModel.findById(cuentaId);
  if (!cuenta) throw new Error("Cuenta no encontrada");
  if (cuenta.propietario.toString() !== userId.toString()) {
    throw new Error("No tienes permisos para modificar esta cuenta");
  }
};

export const validarTipoCuenta = async (tipo) => {
  const tiposValidos = ['ahorro', 'corriente', 'nomina', 'empresarial'];
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de cuenta no válido: ${tipo}`);
  }
};