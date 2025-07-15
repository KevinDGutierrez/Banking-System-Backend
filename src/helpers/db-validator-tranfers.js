import Cuenta from "../account/account.model.js";
import Transfers from "../transfers/transfer.model.js";
import Banking from "../banking/banking.model.js";
import User from "../auth/authUser.model.js";
import InterbankTransfer from "../interbank/interBankTransfer.model.js";
import { obtenerTipoCambio } from "../utils/apiDivisa.js";
import dayjs from 'dayjs';

const LIMITE_POR_TRANSFERENCIA = 2000;
const LIMITE_DIARIO = 10000;

export const cuentaExistente = async (id = '') => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new Error(`El ID ${id} no tiene un formato válido`);
  }

  const cuenta = await Cuenta.findById(id);
  if (!cuenta) {
    throw new Error(`La cuenta con ID ${id} no existe`);
  }
};

export const cuentaActiva = async (cuenta) => {
  if (!cuenta || cuenta.estado !== "activa") {
    throw new Error("La cuenta no está activa");
  }
};

export const fondosSuficientes = async (cuenta, monto) => {
  if (cuenta.saldo < monto) {
    throw new Error("Fondos insuficientes para realizar la transferencia");
  }
};

export const validarMontoTransferencia = async (monto) => {
  if (!monto || monto <= 0) {
    throw new Error("El monto de la transferencia debe ser mayor a 0");
  }
  if (monto > LIMITE_POR_TRANSFERENCIA) {
    throw new Error(`El monto no puede superar Q${LIMITE_POR_TRANSFERENCIA}`);
  }
};

export const cuentasDiferentes = async (cuentaOrigen, cuentaDestino) => {
  if (cuentaOrigen._id.toString() === cuentaDestino._id.toString()) {
    throw new Error("No se puede transferir a la misma cuenta");
  }
};

export const validarDatosTransferencia = async ({ cuentaReceptor, monto, moneda }) => {
  if (!cuentaReceptor || !monto || !moneda) {
    throw new Error("Datos incompletos para realizar la transferencia");
  }
};

export const validarLimiteDiario = async (userId, monto) => {
  const hoy = dayjs().format('YYYY-MM-DD');
  const transferenciasHoy = await Transfers.find({
    emisor: userId,
    fecha: { $regex: hoy },
  });

  const totalHoy = transferenciasHoy.reduce((acc, t) => acc + t.monto, 0);
  if (totalHoy + monto > LIMITE_DIARIO) {
    throw new Error(`Límite diario de Q${LIMITE_DIARIO} excedido`);
  }
};

export const obtenerMontosConvertidos = async ({ cuentaEmisor, cuentaReceptor, monto, moneda }) => {
  let montoDescontar = monto;
  let montoRecibir = monto;

  if (cuentaEmisor.moneda !== moneda) {
    const tipoCambio = await obtenerTipoCambio(moneda, cuentaEmisor.moneda);
    montoDescontar = monto * tipoCambio;
  }

  if (cuentaReceptor.moneda !== moneda) {
    const tipoCambio = await obtenerTipoCambio(moneda, cuentaReceptor.moneda);
    montoRecibir = monto * tipoCambio;
  }

  return { montoDescontar, montoRecibir };
};

export const existeTransferenciaById = async (id = '') => {
  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new Error(`El ID ${id} no tiene un formato válido`);
  }

  const transferencia = await Transfers.findById(id);
  if (!transferencia) {
    throw new Error(`No existe una transferencia con el ID: ${id}`);
  }
};

export const soloAdmin = async (req) => {
    if (req.user.role !== "ADMIN") {
        throw new Error("Solo los administradores pueden realizar esta acción");
    }
}

export const soloClient = async (req) => {
    if (req.user.role !== "CLIENTE") {
        throw new Error("Solo los clientes pueden realizar transferencias");
    }
}

export const validarDatosTransferenciaInterbancaria = async ({ cuentaReceptorExterno, bancoReceptor, monto, moneda }) => {
  if (!cuentaReceptorExterno || !bancoReceptor || !monto || !moneda) {
    throw new Error('Todos los campos son requeridos para una transferencia interbancaria');
  }

  if (typeof cuentaReceptorExterno !== 'string' || cuentaReceptorExterno.trim().length < 6) {
    throw new Error('El número de cuenta del receptor debe tener al menos 6 caracteres');
  }

  if (!['GTQ', 'USD', 'EUR'].includes(moneda)) {
    throw new Error('La moneda especificada no es válida (GTQ, USD, EUR)');
  }

  if (typeof monto !== 'number' || isNaN(monto) || monto <= 0) {
    throw new Error('El monto debe ser un número mayor a 0');
  }

  const banco = await Banking.findOne({ name: new RegExp(`^${bancoReceptor}$`, 'i') });
  if (!banco || banco.status !== 'active') {
    throw new Error('El banco receptor no es válido o está inactivo');
  }
};

export const validarTipoCuentaReceptor = (tipoCuentaReceptor = '') => {
  const tiposValidos = ['ahorro', 'monetaria', 'empresarial'];
  if (!tiposValidos.includes(tipoCuentaReceptor)) {
    throw new Error(`El tipo de cuenta receptor debe ser uno de: ${tiposValidos.join(', ')}`);
  }
};

export const validarAliasReceptor = (aliasReceptor = '') => {
  if (!aliasReceptor || aliasReceptor.trim().length === 0) {
    throw new Error('El alias del receptor es obligatorio y no puede estar vacío.');
  }
};

export const validarBancoDestinoTransferencia = async ({ bancoReceptor, tipoTransferencia }) => {
  if (!bancoReceptor || !tipoTransferencia) {
    throw new Error("El banco receptor y el tipo de transferencia son requeridos");
  }

  const banco = await Banking.findOne({ name: bancoReceptor.trim(), status: 'active' }); // ← busca por nombre
  if (!banco) {
    throw new Error("El banco receptor no es válido o está inactivo");
  }

  const esBancoInnova = banco.name.toLowerCase() === 'banco innova';

  if (tipoTransferencia === 'normal' && !esBancoInnova) {
    throw new Error("Las transferencias normales solo se pueden realizar al Banco Innova");
  }

  if (tipoTransferencia === 'interbancaria' && esBancoInnova) {
    throw new Error("Las transferencias interbancarias no se pueden realizar al Banco Innova");
  }

  return banco; // Retorna el objeto banco encontrado
};

/**
 * Valida que el tipo de cuenta del receptor coincida con el tipo de cuenta especificado en la solicitud.
 * @param {object} cuentaReceptorDB - El documento de la cuenta receptora de la base de datos.
 * @param {string} tipoCuentaReceptor - El tipo de cuenta del receptor enviado en la solicitud.
 */
export const validarTipoCuentaCoincide = (cuentaReceptorDB, tipoCuentaReceptor) => {
  if (cuentaReceptorDB.tipo !== tipoCuentaReceptor) {
    throw new Error(`El tipo de cuenta del receptor (${cuentaReceptorDB.tipo}) no coincide con el tipo especificado (${tipoCuentaReceptor}).`);
  }
};

/**
 * Valida que la cuenta receptora pertenezca a Banco Innova si el tipo de transferencia es 'normal'.
 * @param {object} cuentaReceptorDB - El documento de la cuenta receptora de la base de datos (debe estar populado con 'entidadBancaria').
 * @param {string} tipoTransferencia - El tipo de transferencia ('normal' o 'interbancaria').
 */
export const validarCuentaReceptorInnovaParaNormal = (cuentaReceptorDB, tipoTransferencia) => {
  if (tipoTransferencia === 'normal') {
    if (!cuentaReceptorDB.entidadBancaria || cuentaReceptorDB.entidadBancaria.name.toLowerCase() !== 'banco innova') {
      throw new Error('La cuenta receptora no pertenece a Banco Innova para una transferencia normal.');
    }
  }
};

export const asignarPuntosPorTransferencias = async (userId) => {
  
  const totalTransfer = await Transfers.countDocuments({ emisor: userId });

  const totalInterbankTransfer = await InterbankTransfer.countDocuments({ emisor: userId });

  const totalTransferencias = totalTransfer + totalInterbankTransfer;

  if (totalTransferencias > 0 && totalTransferencias % 5 === 0) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Usuario no encontrado para asignar puntos");
    }

    user.puntos += 500;
    await user.save();

    console.log(`Se han asignado 500 puntos al usuario ${user.username} por alcanzar ${totalTransferencias} transferencias`);
  }
}