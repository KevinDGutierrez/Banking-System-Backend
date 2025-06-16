
import Deposit from '../deposit/deposit.model.js'
import accountModel from '../account/account.model.js'
import authUserModel from '../auth/authUser.model.js';

export const encontrarCuenta = async (id) => {
    const cuenta = await accountModel.findById(id);
    if (!cuenta) {
        throw new Error("Cuenta no encontrada");
    }
    return cuenta;
}

export const validarCuentaUsuario = async (numeroCuenta) => {
    // Buscar la cuenta
    const cuenta = await accountModel.findOne({ numeroCuenta: numeroCuenta });
    if (!cuenta) {
        throw new Error('La cuenta especificada no existe');
    }

    user= await authUserModel.findOne({_id: cuenta.propietario})

    if (!user) {
        throw new Error('Error al encontrar usuario');
    }

    return user;
}

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