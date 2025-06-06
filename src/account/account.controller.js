import accountModel from "./account.model.js";
import bankingModel from "../banking/banking.model.js";

import {  validarTipoCuenta,  validarAprobacionPorAdmin } from "../helpers/db-validator-cuenta.js";

export const crearCuenta = async (req, res) => {
  try {
    const user = req.user;
    const { tipo, moneda, entidadBancaria } = req.body;

    await validarTipoCuenta(tipo);

    const banco = await bankingModel.findOne({name: { $regex: new RegExp(entidadBancaria, "i") }});
    if (!banco) {
      return res.status(404).json({ msg: "Entidad bancaria no encontrada" });
    }
    

    const generarNumeroCuenta = () =>
      Math.floor(100000000 + Math.random() * 900000000).toString();

    const nuevaCuenta = await accountModel.create({
      numeroCuenta: generarNumeroCuenta(),
      propietario: user._id,
      tipo,
      moneda,
      entidadBancaria: banco._id,
      saldo: 0,
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
    .populate('propietario', 'name');

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
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        msg: "No tienes permisos para ver todas las cuentas"
      });
    }

    const cuentas = await accountModel.find().populate("propietario", "nombre correo");

    res.status(200).json(cuentas);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener las cuentas", error: error.message });
  }
}


export const aprobarCuenta = async (req, res) => {
  try {
    const {numeroCuenta} = req.params;


    await validarAprobacionPorAdmin(req);

    const cuenta = await accountModel.findOneAndUpdate(
      {numeroCuenta},
      { estado: 'activa' },
      { new: true }
    )

    if (!cuenta) {
      return res.status(404).json({
        success: false,
        msg: "Cuenta no encontrada"
      });
    }

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