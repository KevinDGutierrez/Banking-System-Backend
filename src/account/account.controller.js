import accountModel from "./account.model.js";
import bankingModel from "../banking/banking.model.js";
import { validarTipoCuenta, validarAprobacionPorAdmin, saldoCuenta, eliminarCuentAdmin, validarVerCuentasPorAdmin } from "../helpers/db-validator-cuenta.js";
import { sendApprovalCuenta } from "../utils/sendEmail.js";

export const crearCuenta = async (req, res) => {
  try {
    const user = req.user;
    const { tipo, moneda, entidadBancaria, saldo } = req.body;

    await validarTipoCuenta(tipo);
    await saldoCuenta(saldo);

    const banco = await bankingModel.findOne({ name: { $regex: new RegExp(entidadBancaria, "i") } });
    


    const generarNumeroCuenta = () =>
      Math.floor(Math.random()*(9999999999 - 1000000000 + 1000000000)).toString();

    const nuevaCuenta = await accountModel.create({
      numeroCuenta: generarNumeroCuenta(),
      propietario: user._id,
      tipo,
      moneda,
      saldo,
      entidadBancaria: banco._id,
    });

    res.status(201).json({
      msg: "Cuenta en espera de aprobación",
    });

  } catch (error) {
    console.log(error)
    res.status(400).json({ msg: error.message });
  }
};

export const obtenerCuentasPorUsuario = async (req, res) => {
  try {
    const user = req.user;

    const cuentas = await accountModel.find({ propietario: user._id })
      .populate('entidadBancaria', 'name')
      .populate('propietario', 'correo');

    if (cuentas.length === 0) {
      return res.status(404).json({ msg: "No hay cuentas para este usuario" });
    }

    res.status(200).json(cuentas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener las cuentas", error: error.message });
  }
};

export const obtenerTodasCuentas = async (req, res) => {
  try {
    const user = req.user;
    const cuentas = await accountModel.find().populate('entidadBancaria', 'name')
    .populate('propietario', 'correo name');

    res.status(200).json(cuentas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener las cuentas", error: error.message });
  }
}

export const aprobarCuenta = async (req, res) => {
  try {
    const { numeroCuenta } = req.params;

    await validarAprobacionPorAdmin(req);

    const cuenta = await accountModel.findOneAndUpdate(
      { numeroCuenta },
      { estado: 'activa' },
      { new: true }
    )

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        msg: "Cuenta no encontrada"
      });
    }
    await sendApprovalCuenta(cuenta.propietario.name, cuenta.numeroCuenta, cuenta.tipo);
    res.status(200).json({
      success: true,
      msg: "Cuenta aprobada",
      cuenta
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al aprobar la cuenta", error: error.message });
  }
}


export const deleteAccount = async (req, res) => {
  try {
    const id = req.params.id;
    await eliminarCuentAdmin(req, id)

    const DeleteAccount = await accountModel.findByIdAndUpdate(id, { estado : 'bloqueada' }, { new: true });
    res.status(200).json({
      success: true,
      msg: "Cuenta eliminada",
      DeleteAccount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al eliminar la cuenta", error: error.message });
  }
}


export const getOpciones = async (req, res) => {
  try {
    const tiposCuentas = ['ahorro', 'monetaria', 'empresarial'];
    const monedasCuentas = ['GTQ', 'USD', 'EUR'];
    res.status(200).json({ tiposCuentas, monedasCuentas });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener las opciones", error: error.message });
  }
}