import cuentaModel from "../account/account.model.js";
import authUserModel from "../auth/authUser.model.js";

export const validarTipoCuenta = async (tipo) => {
  const tiposValidos = ['ahorro', 'monetaria', 'empresarial'];
  if (!tiposValidos.includes(tipo)) {
    throw new Error(`Tipo de cuenta no válido: ${tipo}`);
  }
};

export const encontrarCuentaUsuario = async (req, id) => {
  const usuario = req.user;
  const cuenta = await cuentaModel.findOne({ numeroCuenta: id, propietario: usuario._id });
  if (!cuenta) {
    throw new Error("Cuenta no encontrada o no pertenece al usuario");
  }
  return cuenta;
}

export const validarAprobacionPorAdmin = async (req) => {
  const usuario = req.user;

  if (usuario.role !== "ADMIN") {
    throw new Error("No tienes permisos para aprobar cuentas");

  }
};

export const validarVerCuentasPorAdmin = async (req) => {
  const usuario = req.user;

  if (usuario.role !== "ADMIN") {
    throw new Error("No tienes permisos para ver todas las cuentas");

  }
};


export const saldoCuenta = async (saldo = '') => {
  if(!saldo || Number(saldo) < 100) {
    throw new Error("El saldo de su cuenta bancaria debe ser mayor o igual a Q100");
  }
}

export const eliminarCuentAdmin = async (req) => {
  const user = req.user;
  if (user.role !== "ADMIN") {
    throw new Error("No tienes permisos para eliminar cuentas");
  }}