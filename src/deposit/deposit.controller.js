import { encontrarCuenta , validarCuentaUsuario, asignarPuntosPorDepositos} from '../helpers/db-validator-deposit.js'
import { asignarPuntosPorTransferencias } from '../helpers/db-validator-tranfers.js' // Asumiendo que el helper está en este archivo
import { obtenerTipoCambio } from '../utils/apiDivisa.js' // Asumiendo que la función está en este archivo
import Deposit from '../deposit/deposit.model.js'
import cuentaModel from '../account/account.model.js'

// Depósito básico (sin tipo de cambio)
export const postDeposit = async (req, res) => {
    try {
        const { cuenta, monto, descripcion, moneda = 'GTQ' } = req.body;

        // Validar si el ID de cuenta existe
        const cuentaExistente = await encontrarCuenta(cuenta);

        const user = validarCuentaUsuario(cuentaExistente)

        // Verificar que la moneda del depósito coincida con la moneda de la cuenta
        if (moneda !== cuentaExistente.moneda) {
            return res.status(400).json({ 
                message: 'La moneda del depósito debe coincidir con la moneda de la cuenta' 
            });
        }

        // Aumentar el saldo de la cuenta
        cuentaExistente.saldo += monto;
        await cuentaExistente.save();

        // Crear y guardar el depósito
        const newDeposit = new Deposit({
            cuenta: cuentaExistente._id,
            monto,
            moneda,
            descripcion
        });

        const savedDeposit = await newDeposit.save();

        // Asignar puntos por transacciones (si aplica)
        if (user) {
            try {
                await asignarPuntosPorDepositos(user._id);
            } catch (pointsError) {
                console.error('Error al asignar puntos:', pointsError.message);
                // No detener la operación por error en puntos
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

// Depósito con conversión de moneda
export const postDepositWithExchange = async (req, res) => {
    try {
        const { cuenta, monto, monedaOrigen, descripcion } = req.body;

        // Validaciones básicas
        if (!cuenta || !monto || !monedaOrigen) {
            return res.status(400).json({
                success: false,
                message: 'Cuenta, monto y moneda de origen son requeridos'
            });
        }

        // Validar si el ID de cuenta existe
        const cuentaExistente = await encontrarCuenta(cuenta);
        const monedaDestino = cuentaExistente.moneda;

        let montoConvertido = monto;
        let tipoCambio = 1;

        // Si las monedas son diferentes, obtener tipo de cambio
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

        // Aumentar el saldo de la cuenta con el monto convertido
        cuentaExistente.saldo += montoConvertido;
        await cuentaExistente.save();

        // Crear y guardar el depósito con información de conversión
        const newDeposit = new Deposit({
            cuenta: cuentaExistente._id,
            monto: montoConvertido, // Monto ya convertido
            moneda: monedaDestino, // Moneda de la cuenta
            descripcion: descripcion ? 
                `${descripcion} | Conversión: ${monto} ${monedaOrigen} → ${montoConvertido.toFixed(2)} ${monedaDestino} (TC: ${tipoCambio})` :
                `Depósito con conversión: ${monto} ${monedaOrigen} → ${montoConvertido.toFixed(2)} ${monedaDestino} (TC: ${tipoCambio})`
        });

        const savedDeposit = await newDeposit.save();

        // Asignar puntos por transacciones (si aplica)
        if (cuentaExistente.usuario) {
            try {
                await asignarPuntosPorTransferencias(cuentaExistente.usuario);
            } catch (pointsError) {
                console.error('Error al asignar puntos:', pointsError.message);
                // No detener la operación por error en puntos
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

// Obtener todos los depósitos activos
export const getDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.find({ status: true })
            .populate('cuenta')
            .sort({ createdAt: -1 }); // Ordenar por más recientes primero
        
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

// Obtener depósitos por cuenta
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

// Obtener un depósito por ID
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

// Actualizar un depósito
export const putDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const { cuenta, monto, descripcion, moneda } = req.body;

        // Buscar el depósito actual para obtener el monto anterior
        const depositoActual = await Deposit.findById(id);
        if (!depositoActual) {
            return res.status(404).json({ 
                success: false,
                message: 'Depósito no encontrado' 
            });
        }

        // Si se está cambiando el monto, actualizar el saldo de la cuenta
        if (monto && monto !== depositoActual.monto) {
            const cuentaExistente = await encontrarCuenta(cuenta || depositoActual.cuenta);
            
            // Revertir el monto anterior y aplicar el nuevo
            const diferencia = monto - depositoActual.monto;
            cuentaExistente.saldo += diferencia;
            await cuentaExistente.save();
        }

        const updatedDeposit = await Deposit.findByIdAndUpdate(
            id,
            { cuenta, monto, descripcion, moneda },
            { new: true, runValidators: true }
        ).populate('cuenta');

        res.json({
            success: true,
            message: 'Depósito actualizado correctamente',
            data: updatedDeposit
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error al actualizar el depósito', 
            error: error.message 
        });
    }
}

// Eliminar (desactivar) un depósito
export const deleteDeposit = async (req, res) => {
    try {
        const { id } = req.params;

        // Buscar el depósito antes de eliminarlo
        const deposito = await Deposit.findById(id).populate('cuenta');
        if (!deposito) {
            return res.status(404).json({ 
                success: false,
                message: 'Depósito no encontrado' 
            });
        }

        // Revertir el saldo de la cuenta
        const cuenta = deposito.cuenta;
        cuenta.saldo -= deposito.monto;
        await cuenta.save();

        // Desactivar el depósito
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

// Obtener estadísticas de depósitos
export const getDepositStats = async (req, res) => {
    try {
        const { cuentaId } = req.query;
        
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