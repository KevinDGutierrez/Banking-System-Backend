
import Deposit from '../deposit/deposit.model.js'
import accountModel from '../account/account.model.js'
import authUserModel from '../auth/authUser.model.js';

export const encontrarCuenta = async (cuenta) => {
    const account = await accountModel.findOne({numeroCuenta: cuenta});
    if (!account) {
        throw new Error("Cuenta no encontrada");
    }
    return account;
}

export const validarCuentaUsuario = async (numeroCuenta) => {
    try {
        const cuenta = await accountModel.findOne({ numeroCuenta });

        if (!cuenta) {
            throw new Error('La cuenta especificada no existe');
        }

        const user = await authUserModel.findById(cuenta.propietario);

        if (!user) {
            throw new Error('No se pudo encontrar al propietario de la cuenta');
        }

        return user;

    } catch (error) {
        console.error('Error al validar cuenta o usuario:', error.message);
        throw error;
    }
};


export const asignarPuntosPorDepositos = async(userId)=>{

    const totalDeposits = await Deposit.countDocuments({user: userId})

    if(totalDeposits>0 && totalDeposits%5=== 0){
        const user = await authUserModel.findById(userId);
        if (!user) {
            throw new Error("Usuario no encontrado para asignar puntos");
        }
    
        user.puntos += 500;
        await user.save();
    
        console.log(`Se han asignado 500 puntos al usuario ${user.username} por alcanzar ${totalTransferencias} transferencias`);
        }
}