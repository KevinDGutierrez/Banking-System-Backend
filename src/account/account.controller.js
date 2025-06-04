import accountModel from "./account.model.js";
import { validarPropietarioCuenta, validarTipoCuenta } from "../helpers/db-validator-cuenta.js";

export const crearCuenta = async (req, res) => {
  try {
    const user = req.user;
    const { tipo, moneda, entidadBancaria } = req.body;

    await validarTipoCuenta(tipo);
    await validarPropietarioCuenta(user._id, req.body.cuentaDestino);

    const generarNumeroCuenta = () =>
      Math.floor(100000000 + Math.random() * 900000000).toString();

    const nuevaCuenta = await accountModel.create({
      numeroCuenta: generarNumeroCuenta(),
      propietario: user._id,
      tipo,
      moneda,
      entidadBancaria,
    });

    res.status(201).json({
      msg: "Cuenta creada con éxito",
      cuenta: nuevaCuenta
    });

  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};