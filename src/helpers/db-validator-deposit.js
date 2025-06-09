import cuentaModel from '../account/account.model.js'

export const encontrarCuenta = async (id) => {
    const cuenta = await cuentaModel.findById(id);
    if (!cuenta) {
        throw new Error("Cuenta no encontrada");
    }
    return cuenta;
}
