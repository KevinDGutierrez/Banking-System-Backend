import favoritosModel from "./favoritos.model.js";
import accountModel from "../account/account.model.js";
import authUserModel from "../auth/authUser.model.js";

export const agregarFavorito = async (req, res) => {
  try {
    const user = req.user;
    const { cuentaDestino, alias, tipoCuenta } = req.body;
    const cuenta = await accountModel.findOne({ numeroCuenta: cuentaDestino });

    const nuevoFavorito = await favoritosModel.create({
      usuario: user._id,
      cuentaDestino: cuenta._id,
      tipoCuenta: cuenta.tipo,
      alias
    });

    res.status(201).json({ msg: "Favorito agregado", favorito: nuevoFavorito });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: error.message });
  }
};

export const obtenerFavoritosPorUsuario = async (req, res) => {
  try {
    const user = req.user;

    const favoritos = await favoritosModel.find({ usuario: user._id })
      .populate({
        path: 'cuentaDestino',
        select: 'numeroCuenta moneda propietario entidadBancaria',
        populate: [
          { path: 'propietario', select: 'name' },
          { path: 'entidadBancaria', select: 'name' },
          { path: 'tipo', select: 'name' }
        ]
      })
      .populate('usuario', 'username');

    if (favoritos.length === 0) {
      return res.status(404).json({ msg: "No hay favoritos para este usuario" });
    }

    res.status(200).json(favoritos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al obtener los favoritos", error: error.message });
  }
};