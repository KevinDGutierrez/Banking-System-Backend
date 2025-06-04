import favoritosModel from "./favoritos.model.js";

export const agregarFavorito = async (req, res) => {
  try {
    const user = req.user;
    const { cuentaDestino, tipoCuenta, alias } = req.body;

    const nuevoFavorito = await favoritosModel.create({
      usuario: user._id,
      cuentaDestino,
      tipoCuenta,
      alias
    });

    res.status(201).json({ msg: "Favorito agregado", favorito: nuevoFavorito });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};