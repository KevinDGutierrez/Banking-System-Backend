import { encontrarCuenta , validarCuentaUsuario, asignarPuntosPorDepositos} from '../helpers/db-validator-deposit.js'
import { asignarPuntosPorTransferencias } from '../helpers/db-validator-tranfers.js' // Asumiendo que el helper está en este archivo
import { obtenerTipoCambio } from '../utils/apiDivisa.js' // Asumiendo que la función está en este archivo
import Deposit from '../deposit/deposit.model.js'
import cuentaModel from '../account/account.model.js'

export const postDeposit = async (req, res) => {
    try {
        const { cuenta, monto, descripcion, moneda = 'GTQ' } = req.body;

         if (!cuenta || !monto ) {
            return res.status(400).json({
                success: false,
                message: 'Cuenta y el monto son requeridos'
            });
        }

        const cuentaExistente = await encontrarCuenta(cuenta);
        
        console.log("BP")        
        
        const user = await validarCuentaUsuario(cuentaExistente.numeroCuenta)

        if (moneda !== cuentaExistente.moneda) {
            return res.status(400).json({ 
                message: 'La moneda del depósito debe coincidir con la moneda de la cuenta' 
            });
        }

        cuentaExistente.saldo += monto;
        await cuentaExistente.save();

        const newDeposit = new Deposit({
            cuenta: cuentaExistente._id,
            monto,
            moneda,
            descripcion
        });

        const savedDeposit = await newDeposit.save();

        if (user) {
            try {
                await asignarPuntosPorDepositos(user._id);
                console.log("BP")            
        } catch (pointsError) {
                console.error('Error al asignar puntos:', pointsError.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Depósito realizado exitosamente',
            data: savedDeposit
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error al crear el depósito', 
            error: error.message 
        });
    }
}

export const postDepositWithExchange = async (req, res) => {
    try {
        const { cuenta, monto, monedaOrigen, descripcion } = req.body;

        if (!cuenta || !monto || !monedaOrigen) {
            return res.status(400).json({
                success: false,
                message: 'Cuenta, monto y moneda de origen son requeridos'
            });
        }

        const cuentaExistente = await encontrarCuenta(cuenta);
        const monedaDestino = cuentaExistente.moneda;

        let montoConvertido = monto;
        let tipoCambio = 1;

        if (monedaOrigen !== monedaDestino) {
            try {
                tipoCambio = await obtenerTipoCambio(monedaOrigen, monedaDestino);
                montoConvertido = monto * tipoCambio;
            } catch (exchangeError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error al obtener el tipo de cambio',
                    error: exchangeError.message
                });
            }
        }

        cuentaExistente.saldo += montoConvertido;
        await cuentaExistente.save();

        const newDeposit = new Deposit({
            cuenta: cuentaExistente._id,
            monto: montoConvertido, 
            moneda: monedaDestino,
            descripcion: descripcion ? 
                `${descripcion} | Conversión: ${monto} ${monedaOrigen} → ${montoConvertido.toFixed(2)} ${monedaDestino} (TC: ${tipoCambio})` :
                `Depósito con conversión: ${monto} ${monedaOrigen} → ${montoConvertido.toFixed(2)} ${monedaDestino} (TC: ${tipoCambio})`
        });

        const savedDeposit = await newDeposit.save();

        if (cuentaExistente.usuario) {
            try {
                await asignarPuntosPorTransferencias(cuentaExistente.usuario);
        console.log("BP")            } catch (pointsError) {
                console.error('Error al asignar puntos:', pointsError.message);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Depósito con conversión realizado exitosamente',
            data: {
                deposito: savedDeposit,
                conversion: {
                    montoOriginal: monto,
                    monedaOrigen,
                    montoConvertido: parseFloat(montoConvertido.toFixed(2)),
                    monedaDestino,
                    tipoCambio
                }
            }
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error al crear el depósito con conversión', 
            error: error.message 
        });
    }
}

export const getDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.find({ status: true })
            .populate('cuenta')
            .sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: deposits.length,
            data: deposits
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener los depósitos', 
            error: error.message 
        });
    }
}

export const getDepositsByAccount = async (req, res) => {
    try {
        const { cuentaId } = req.params;
        
        const deposits = await Deposit.find({ 
            cuenta: cuentaId, 
            status: true 
        })
        .populate('cuenta')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: deposits.length,
            data: deposits
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener los depósitos de la cuenta', 
            error: error.message 
        });
    }
}

export const getDepositById = async (req, res) => {
    try {
        const { id } = req.params;
        const deposit = await Deposit.findById(id).populate('cuenta');

        if (!deposit || !deposit.status) {
            return res.status(404).json({ 
                success: false,
                message: 'Depósito no encontrado' 
            });
        }

        res.json({
            success: true,
            data: deposit
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al buscar el depósito', 
            error: error.message 
        });
    }
}

export const putDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { monto, descripcion, moneda } = req.body;

        const depositoActual = await Deposit.findById(id).populate('cuenta');
        if (!depositoActual) {
            return res.status(404).json({
                success: false,
                message: 'Depósito no encontrado'
            });
        }

        if (monto && isNaN(monto)) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser un número válido'
            });
        }

        let montoConvertido = monto;
        let tipoCambio = 1;

        if (moneda && depositoActual.moneda !== moneda) {
            try {
                tipoCambio = await obtenerTipoCambio(moneda, 'GTQ');  
                montoConvertido = monto * tipoCambio;  
            } catch (exchangeError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error al obtener el tipo de cambio',
                    error: exchangeError.message
                });
            }
        }


        if (monto && monto !== depositoActual.monto) {
            const cuentaExistente = depositoActual.cuenta;
            if (!cuentaExistente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cuenta asociada al depósito no encontrada'
                });
            }

            const diferencia = montoConvertido - depositoActual.monto;
            cuentaExistente.saldo += diferencia;  // Ajustar el saldo de la cuenta con la diferencia del monto

            await cuentaExistente.save();
        }

        const updatedDeposit = await Deposit.findByIdAndUpdate(
            id,
            { 
                monto: montoConvertido,  // Monto actualizado en GTQ
                descripcion,
                moneda: 'GTQ'  // Aseguramos que la moneda sea GTQ
            },
            { new: true, runValidators: true }
        ).populate('cuenta');  // Asegúrate de que el populate se hace correctamente

        res.json({
            success: true,
            message: 'Depósito actualizado correctamente',
            data: updatedDeposit
        });
    } catch (error) {
        console.error('Error al actualizar depósito:', error);  // Para depuración
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el depósito',
            error: error.message
        });
    }
};

export const deleteDeposit = async (req, res) => {
    try {
        const { id } = req.params;

        const deposito = await Deposit.findById(id).populate('cuenta');
        if (!deposito) {
            return res.status(404).json({ 
                success: false,
                message: 'Depósito no encontrado' 
            });
        }

        if (deposito.status === false) {
            return res.status(400).json({
                success: false,
                message: 'El depósito ya ha sido desactivado previamente'
            });
        }

        const cuenta = deposito.cuenta;
        cuenta.saldo -= deposito.monto;
        await cuenta.save();

        const deletedDeposit = await Deposit.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        );

        res.json({ 
            success: true,
            message: 'Depósito eliminado correctamente y saldo revertido',
            data: deletedDeposit
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al eliminar el depósito', 
            error: error.message 
        });
    }
}

export const getDepositStats = async (req, res) => {
    try {
        const { cuentaId } = req.params;
        
        let matchFilter = { status: true };
        if (cuentaId) {
            matchFilter.cuenta = cuentaId;
        }

        const stats = await Deposit.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: '$moneda',
                    totalDepositos: { $sum: 1 },
                    montoTotal: { $sum: '$monto' },
                    montoPromedio: { $avg: '$monto' },
                    montoMaximo: { $max: '$monto' },
                    montoMinimo: { $min: '$monto' }
                }
            },
            { $sort: { totalDepositos: -1 } }
        ]);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error al obtener estadísticas de depósitos', 
            error: error.message 
        });
    }
}   