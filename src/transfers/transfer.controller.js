import Transfer from './transfer.model.js';
import Cuenta from '../account/account.model.js';
import { request, response } from 'express';
import {
  cuentaActiva,
  cuentaExistente,
  fondosSuficientes,
  validarMontoTransferencia,
  cuentasDiferentes,
  validarDatosTransferencia,
  validarLimiteDiario,
  obtenerMontosConvertidos,
  existeTransferenciaById,
  soloClient,
  soloAdmin,
  validarTipoCuentaReceptor,
  validarAliasReceptor,
  validarBancoDestinoTransferencia,
  asignarPuntosPorTransferencias,
  validarTipoCuentaCoincide,
  validarCuentaReceptorInnovaParaNormal
} from '../helpers/db-validator-tranfers.js';

export const realizarTransferencia = async (req = request, res = response) => {
  try {
    const userId = req.user._id;
    const {
      cuentaEmisor: numeroCuentaEmisor,
      cuentaReceptor,
      tipoCuentaReceptor,
      monto,
      moneda,
      aliasReceptor,
      tipoTransferencia = 'normal'
    } = req.body;

    const { bancoReceptor } = req.params;

    await soloClient(req);
    validarTipoCuentaReceptor(tipoCuentaReceptor);
    validarAliasReceptor(aliasReceptor);
    await validarDatosTransferencia({ cuentaReceptor, monto, moneda });
    await validarMontoTransferencia(monto);
    await validarLimiteDiario(userId, monto);

    const bancoDestino = await validarBancoDestinoTransferencia({ bancoReceptor, tipoTransferencia });
    const cuentaEmisor = await Cuenta.findOne({ numeroCuenta: numeroCuentaEmisor, propietario: userId, estado: 'activa' });
    const cuentaReceptorDB = await Cuenta.findOne({ numeroCuenta: cuentaReceptor, estado: 'activa' }).populate('entidadBancaria');

    if (!cuentaEmisor || !cuentaReceptorDB) {
      return res.status(404).json({ success: false, msg: 'Cuenta emisora o receptora no encontrada o inactiva.' });
    }

    validarCuentaReceptorInnovaParaNormal(cuentaReceptorDB, tipoTransferencia);

    validarTipoCuentaCoincide(cuentaReceptorDB, tipoCuentaReceptor);

    await cuentasDiferentes(cuentaEmisor, cuentaReceptorDB);
    await cuentaActiva(cuentaEmisor);
    await cuentaActiva(cuentaReceptorDB);

    const { montoDescontar, montoRecibir } = await obtenerMontosConvertidos({
      cuentaEmisor,
      cuentaReceptor: cuentaReceptorDB,
      monto,
      moneda
    });

    await fondosSuficientes(cuentaEmisor, montoDescontar);

    const transferencia = await Transfer.create({
      emisor: userId,
      receptor: cuentaReceptorDB.propietario,
      cuentaEmisor: cuentaEmisor._id,
      tipoCuentaEmisor: cuentaEmisor.tipo,
      cuentaReceptor: cuentaReceptorDB._id,
      tipoCuentaReceptor,
      monto,
      moneda,
      aliasReceptor,
      tipo: 'transferencia',
      bancoReceptor: bancoDestino._id
    });

    cuentaEmisor.saldo -= montoDescontar;
    cuentaReceptorDB.saldo += montoRecibir;
    await Promise.all([cuentaEmisor.save(), cuentaReceptorDB.save()]);
    await asignarPuntosPorTransferencias(userId);
    return res.status(201).json({
      success: true,
      msg: 'Transferencia realizada exitosamente.',
      transferencia
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al realizar la transferencia.',
      error: error.message
    });
  }
};

export const getTransfers = async (req = request, res = response) => {
  try {
    const { limite = 10, desde = 0 } = req.query;

    const [total, transferencias] = await Promise.all([
      Transfer.countDocuments(),
      Transfer.find()
        .populate('emisor', 'username')
        .populate('receptor', 'username')
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ createdAt: -1 })
    ]);

    res.status(200).json({
      success: true,
      total,
      msg: 'Transferencias internas obtenidas exitosamente.',
      transferencias
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al obtener las transferencias internas.',
      error: error.message
    });
  }
};

export const getTransferById = async (req = request, res = response) => {
  try {
    const { id } = req.params;

    await existeTransferenciaById(id);
    await soloAdmin(req);

    const transferencia = await Transfer.findById(id)
      .populate('emisor', 'username')
      .populate('receptor', 'username');

    if (!transferencia) {
      return res.status(404).json({ success: false, msg: 'Transferencia no encontrada.' });
    }

    res.status(200).json({
      success: true,
      msg: 'Transferencia interna obtenida exitosamente.',
      transferencia
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al obtener la transferencia interna.',
      error: error.message
    });
  }
};

export const getNumeroTotalTransferencias = async (req = request, res = response) => {
  const usuario = req.user;
  try {
    if (usuario.role !== "ADMIN") {
      return res.status(403).json({ message: "Solo los administradores pueden  ver esta seccion" });
    }
    const total = await Transfer.countDocuments();
    res.status(200).json({ total });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al obtener el numero de transferencias',
      error: error.message
    });
  }
}

export const getUltimaTransferencia = async (req = request, res = response) => {
  const usuario = req.user;
  try {
    
    const ultimaTransferencia = await Transfer.find({role: "CLIENTE", emisor: usuario._id}).sort({createdAt: -1}).limit(1);
    res.status(200).json({ ultimaTransferencia });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: 'Error al obtener la ultima transferencia',
      error: error.message
    });
  }
}