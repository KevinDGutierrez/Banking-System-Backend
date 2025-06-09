import { encontrarCuenta } from '../helpers/db-validator-deposit.js'
import Deposit from '../deposit/deposit.model.js'
import cuentaModel from '../account/account.model.js'

export const postDeposit = async (req, res) => {
    try {
        const { cuenta, monto, descripcion } = req.body;

        // Validar si el ID de cuenta existe
        const cuentaExistente = await encontrarCuenta(cuenta);

        // Aumentar el saldo de la cuenta
        cuentaExistente.saldo += monto;
        await cuentaExistente.save();

        // Crear y guardar el depósito
        const newDeposit = new Deposit({
            cuenta: cuentaExistente._id,
            monto,
            descripcion
        });

        const savedDeposit = await newDeposit.save();
        res.status(201).json(savedDeposit);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el depósito', error: error.message });
    }
}

// Obtener todos los depósitos activos
export const getDeposits = async (req, res) => {
    try {
        const deposits = await Deposit.find({ status: true }).populate('cuenta')
        res.json(deposits)
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los depósitos', error })
    }
}

// Obtener un depósito por ID
export const getDepositById = async (req, res) => {
    try {
        const { id } = req.params
        const deposit = await Deposit.findById(id).populate('cuenta')

        if (!deposit || !deposit.status) {
            return res.status(404).json({ message: 'Depósito no encontrado' })
        }

        res.json(deposit)
    } catch (error) {
        res.status(500).json({ message: 'Error al buscar el depósito', error })
    }
}

// Actualizar un depósito
export const putDeposit = async (req, res) => {
    try {
        const { id } = req.params
        const { cuenta, monto, descripcion } = req.body

        const updatedDeposit = await Deposit.findByIdAndUpdate(
            id,
            { cuenta, monto, descripcion },
            { new: true }
        )

        if (!updatedDeposit) {
            return res.status(404).json({ message: 'Depósito no encontrado' })
        }

        res.json(updatedDeposit)
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el depósito', error })
    }
}

// Eliminar (desactivar) un depósito
export const deleteDeposit = async (req, res) => {
    try {
        const { id } = req.params

        const deletedDeposit = await Deposit.findByIdAndUpdate(
            id,
            { status: false },
            { new: true }
        )

        if (!deletedDeposit) {
            return res.status(404).json({ message: 'Depósito no encontrado' })
        }

        res.json({ message: 'Depósito eliminado correctamente' })
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el depósito', error })
    }
}
