import cuentaModel from "../account/account.model.js";
import authUserModel from "../auth/authUser.model.js";




export const validarTipoCuenta = async (tipo) => {
  const tiposValidos = ['ahorro', 'monetaria', 'empresarial'];
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de cuenta no válido: ${tipo}`);
  }
};