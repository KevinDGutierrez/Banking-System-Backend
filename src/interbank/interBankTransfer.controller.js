import InterbankTransfer from './interBankTransfer.model.js';
import Cuenta from '../account/account.model.js';
import Banking from '../banking/banking.model.js';
import { request, response } from 'express';
import {
  cuentaActiva,
  fondosSuficientes,
  validarMontoTransferencia,
  validarLimiteDiario,
  validarDatosTransferenciaInterbancaria,
  validarTipoCuentaReceptor,
  validarAliasReceptor,
  soloClient,
  soloAdmin,
  validarBancoDestinoTransferencia,
  asignarPuntosPorTransferencias,
  validarTipoCuentaCoincide
} from '../helpers/db-validator-tranfers.js';
import { verificarSiCuentaEsDePromerica } from '../middlewares/validar-cuenta.js';


export const realizarTransferenciaInterbancaria = async (req = request, res = response) => {
  try {
    const userId = req.user._id;
    const {
      cuentaEmisor: numeroCuentaEmisor,
      cuentaReceptorExterno,
      bancoReceptor,
      tipoCuentaReceptor,
      aliasReceptor,
      monto,
      moneda
    } = req.body;

    const posibleCuentaInternaInnova = await Cuenta.findOne({ numeroCuenta: cuentaReceptorExterno }).populate('entidadBancaria');
    if (posibleCuentaInternaInnova && posibleCuentaInternaInnova.entidadBancaria && posibleCuentaInternaInnova.entidadBancaria.name.toLowerCase() === 'banco innova') {
      return res.status(400).json({
        success: false,
        msg: 'La cuenta receptora pertenece a Banco Innova. Utilice la opción de transferencia interna para este tipo de cuentas.'
      });
    }

    await soloClient(req);
    await validarDatosTransferenciaInterbancaria({
      cuentaReceptorExterno,
      bancoReceptor,
      tipoCuentaReceptor,
      aliasReceptor,
      monto,
      moneda
    });

    validarTipoCuentaReceptor(tipoCuentaReceptor);
    validarAliasReceptor(aliasReceptor);
    await validarMontoTransferencia(monto);
    await validarLimiteDiario(userId, monto);

    const bancoEncontrado = await Banking.findOne({ name: new RegExp(`^${bancoReceptor}$`, 'i') });

    if (!bancoEncontrado) {
      return res.status(404).json({ success: false, msg: 'Banco receptor no encontrado.' });
    }

    const cuentaEmisor = await Cuenta.findOne({
      numeroCuenta: numeroCuentaEmisor,
      propietario: userId,
      estado: 'activa'
    });

    if (!cuentaEmisor) {
      return res.status(404).json({ success: false, msg: 'Cuenta emisora no encontrada o inactiva.' });
    }

    await cuentaActiva(cuentaEmisor);
    await fondosSuficientes(cuentaEmisor, monto);

    await validarBancoDestinoTransferencia({
      bancoReceptor: bancoEncontrado.name,
      tipoTransferencia: 'interbancaria'
    });

    const transferencia = await InterbankTransfer.create({
      emisor: userId,
      cuentaEmisor: cuentaEmisor._id,
      tipoCuentaEmisor: cuentaEmisor.tipo,
      cuentaReceptorExterno,
      tipoCuentaReceptor,
      aliasReceptor,
      monto,
      moneda,
      bancoReceptor: bancoEncontrado._id
    });

    cuentaEmisor.saldo -= monto;
    await cuentaEmisor.save();

    await asignarPuntosPorTransferencias(userId);

    const cuentaReceptora = await Cuenta.findOne({
      numeroCuenta: cuentaReceptorExterno,
      tipo: tipoCuentaReceptor,
      entidadBancaria: bancoEncontrado._id,
      estado: 'activa'
    });

    if (cuentaReceptora) {
      validarTipoCuentaCoincide(cuentaReceptora, tipoCuentaReceptor);
      
      cuentaReceptora.saldo += monto;
      await cuentaReceptora.save();
      console.log(`Saldo actualizado para la cuenta receptora: ${cuentaReceptorExterno}`);
    } else {
      console.log(`Cuenta receptora ${cuentaReceptorExterno} no registrada localmente, no se actualiza saldo.`);
    }

    return res.status(201).json({
      success: true,
      msg: 'Transferencia interbancaria realizada exitosamente.',
      transferencia
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      msg: 'Error al realizar la transferencia interbancaria.',
      error: error.message
    });
  }
};

export const getInterbankTransfers = async (req = request, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;

    const [total, transferencias] = await Promise.all([
      InterbankTransfer.countDocuments(),
      InterbankTransfer.find()
        .populate('emisor', 'username')
        .populate('bancoReceptor', 'nombre')
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      total,
      msg: 'Transferencias interbancarias obtenidas exitosamente.',
      transferencias
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al obtener las transferencias interbancarias.',
      error: error.message
    });
  }
};

export const getInterbankTransferById = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    await soloAdmin(req);

    const transferencia = await InterbankTransfer.findById(id)
      .populate('emisor', 'username')
      .populate('bancoReceptor', 'nombre');

    if (!transferencia) {
      return res.status(404).json({ success: false, msg: 'Transferencia interbancaria no encontrada.' });
    }

    res.status(200).json({
      success: true,
      msg: 'Transferencia interbancaria obtenida exitosamente.',
      transferencia
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al obtener la transferencia interbancaria.',
      error: error.message
    });
  }
};
