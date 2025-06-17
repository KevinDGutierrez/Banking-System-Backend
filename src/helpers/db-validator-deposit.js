
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
        // Buscar la cuenta por número de cuenta
        const cuenta = await accountModel.findOne({ numeroCuenta });

        // Si no se encuentra la cuenta, lanzar error
        if (!cuenta) {
            throw new Error('La cuenta especificada no existe');
        }

        console.log('Cuenta encontrada:', cuenta);

        // Buscar al propietario de la cuenta usando su ObjectId
        const user = await authUserModel.findById(cuenta.propietario);

        // Si no se encuentra al usuario, lanzar error
        if (!user) {
            throw new Error('No se pudo encontrar al propietario de la cuenta');
        }

        console.log('Usuario encontrado:', user);

        // Retornar el usuario
        return user;

    } catch (error) {
        console.error('Error al validar cuenta o usuario:', error.message);
        throw error; // Rethrow el error para manejarlo en otro lugar si es necesario
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