import { encontrarCuenta , validarCuentaUsuario, asignarPuntosPorDepositos} from '../helpers/db-validator-deposit.js'
import { asignarPuntosPorTransferencias } from '../helpers/db-validator-tranfers.js' // Asumiendo que el helper está en este archivo
import { obtenerTipoCambio } from '../utils/apiDivisa.js' // Asumiendo que la función está en este archivo
import Deposit from '../deposit/deposit.model.js'
import cuentaModel from '../account/account.model.js'

export const postDeposit = async (req, res) => {
    try {
        const { cuenta, monto, moneda = 'GTQ', descripcion } = req.body;

        // Validaciones básicas
        if (!cuenta || !monto) {
            return res.status(400).json({
                success: false,
                message: 'Cuenta y monto son requeridos'
            });
        }

        // Buscar la cuenta existente
        const cuentaExistente = await encontrarCuenta(cuenta);
        const user = await validarCuentaUsuario(cuentaExistente.numeroCuenta);

        // Variables para el depósito
        let montoFinal = monto;
        let monedaFinal = cuentaExistente.moneda;
        let descripcionFinal = descripcion || '';
        let tipoCambio = 1;
        let conversionInfo = null;

        // Solo realizar conversión si las monedas son diferentes
        if (moneda !== cuentaExistente.moneda) {
            try {
                tipoCambio = await obtenerTipoCambio(moneda, cuentaExistente.moneda);
                montoFinal = monto * tipoCambio;
                
                // Actualizar descripción con información de conversión
                const conversionText = `Conversión: ${monto} ${moneda} → ${montoFinal.toFixed(2)} ${cuentaExistente.moneda} (TC: ${tipoCambio})`;
                descripcionFinal = descripcion ? 
                    `${descripcion} | ${conversionText}` : 
                    `Depósito con ${conversionText}`;

                // Información de conversión para la respuesta
                conversionInfo = {
                    montoOriginal: monto,
                    monedaOrigen: moneda,
                    montoConvertido: parseFloat(montoFinal.toFixed(2)),
                    monedaDestino: cuentaExistente.moneda,
                    tipoCambio
                };
            } catch (exchangeError) {
                return res.status(400).json({
                    success: false,
                    message: 'Error al obtener el tipo de cambio',
                    error: exchangeError.message
                });
            }
        }

        // Actualizar saldo de la cuenta
        cuentaExistente.saldo += montoFinal;
        await cuentaExistente.save();

        // Crear el registro del depósito
        const newDeposit = new Deposit({
            cuenta: cuentaExistente._id,
            monto: montoFinal,
            moneda: monedaFinal,
            descripcion: descripcionFinal
        });

        const savedDeposit = await newDeposit.save();

        // Asignar puntos si existe usuario
        if (user) {
            try {
                await asignarPuntosPorDepositos(user._id);
            } catch (pointsError) {
                console.error('Error al asignar puntos:', pointsError.message);
            }
        }

        // Preparar respuesta
        const responseData = {
            success: true,
            message: conversionInfo ? 
                'Depósito con conversión realizado exitosamente' : 
                'Depósito realizado exitosamente',
            data: {
                deposito: savedDeposit,
                ...(conversionInfo && { conversion: conversionInfo })
            }
        };

        res.status(201).json(responseData);

    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error al crear el depósito', 
            error: error.message 
        });
    }
};

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