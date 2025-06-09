import { response, request } from "express";
import Producto from "./producto.model.js";
import { tipoMonedaPermitida } from "../helpers/db-validator-productos.js";
import { obtenerTipoCambio } from '../utils/apiDivisa.js';

export const postProducto = async (req, res) => {
    try {
        const { nombre, descripcion, existencias, precio, puntos, moneda = 'GTQ' } = req.body;

        await tipoMonedaPermitida(moneda);

        const producto = await Producto.create({
            nombre,
            descripcion,
            existencias,
            precio,
            puntos,
            moneda
        })

        await producto.save();

        const monedasPermitidas = ['GTQ', 'USD', 'EUR'];
        const preciosConvertidos = {};

        for (const monedaDestino of monedasPermitidas) {
            if (monedaDestino === moneda) {
                preciosConvertidos[monedaDestino] = +precio.toFixed(2);
            } else {
                const tipoCambio = await obtenerTipoCambio(moneda, monedaDestino);
                preciosConvertidos[monedaDestino] = +(precio * tipoCambio).toFixed(2);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Producto agregado satisfactoriamente!',
            producto: {
                ...producto.toObject(),
                precioOriginal: {
                    valor: precio,
                    moneda
                },
                preciosConvertidos
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error agregando el producto!',
            error: error.message || error
        })
    }
}

export const getProductos = async (req = request, res = response) => {
    try {
        const { limite = 10, desde = 0, moneda = 'GTQ' } = req.query;

        const monedasPermitidas = ['GTQ', 'USD', 'EUR'];

        const query = { status: true };

        const [total, productosRaw] = await Promise.all([
            Producto.countDocuments(query),
            Producto.find(query)
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        const productos = await Promise.all(productosRaw.map(async (prod) => {
            const monedaOrigen = prod.moneda;
            const precioOriginal = prod.precio;
            const preciosConvertidos = {};

            for (const monedaDestino of monedasPermitidas) {
                if (monedaDestino === monedaOrigen) {
                    preciosConvertidos[monedaDestino] = +precioOriginal.toFixed(2);
                } else {
                    try {
                        const tipoCambio = await obtenerTipoCambio(monedaOrigen, monedaDestino);
                        preciosConvertidos[monedaDestino] = +(precioOriginal * tipoCambio).toFixed(2);
                    } catch {
                        preciosConvertidos[monedaDestino] = null;
                    }
                }
            }

            return {
                ...prod.toObject(),
                precioOriginal: {
                    valor: precioOriginal,
                    moneda: monedaOrigen
                },
                preciosConvertidos
            }
        }))

        res.status(200).json({
            success: true,
            total,
            productos
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error encontrando los productos!',
            error: error.message || error
        })
    }
}

export const getProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findById(id);

        res.status(200).json({
            success: true,
            producto
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error encontrando el producto!',
            error
        })
    }
}

export const getProductoPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const producto = await Producto.findOne({ nombre });

        const monedasPermitidas = ['GTQ', 'USD', 'EUR'];
        const monedaOrigen = producto.moneda;
        const precioOriginal = producto.precio;
        const preciosConvertidos = {};

        for (const monedaDestino of monedasPermitidas) {
            if (monedaDestino === monedaOrigen) {
                preciosConvertidos[monedaDestino] = +precioOriginal.toFixed(2);
            } else {
                try {
                    const tipoCambio = await obtenerTipoCambio(monedaOrigen, monedaDestino);
                    preciosConvertidos[monedaDestino] = +(precioOriginal * tipoCambio).toFixed(2);
                } catch {
                    preciosConvertidos[monedaDestino] = null;
                }
            }
        }

        res.status(200).json({
            success: true,
            producto: {
                ...producto.toObject(),
                precioOriginal: {
                    valor: precioOriginal,
                    moneda: monedaOrigen
                },
                preciosConvertidos
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error encontrando el producto!',
            error: error.message || error
        })
    }
}

export const putProducto = async (req, res = response) => {
    try {
        const { id } = req.params;
        const data = req.body;

        if (data.moneda) {
            await tipoMonedaPermitida(data.moneda);
        }

        const producto = await Producto.findByIdAndUpdate(id, data, { new: true });

        if (!producto) {
            return res.status(404).json({
                success: false,
                msg: 'Producto no encontrado para actualizar'
            });
        }

        const monedasPermitidas = ['GTQ', 'USD', 'EUR'];
        const monedaOrigen = producto.moneda;
        const precioOriginal = producto.precio;
        const preciosConvertidos = {};

        for (const monedaDestino of monedasPermitidas) {
            if (monedaDestino === monedaOrigen) {
                preciosConvertidos[monedaDestino] = +precioOriginal.toFixed(2);
            } else {
                try {
                    const tipoCambio = await obtenerTipoCambio(monedaOrigen, monedaDestino);
                    preciosConvertidos[monedaDestino] = +(precioOriginal * tipoCambio).toFixed(2);
                } catch {
                    preciosConvertidos[monedaDestino] = null;
                }
            }
        }

        res.status(200).json({
            success: true,
            msg: 'Producto actualizado satisfactoriamente!',
            producto: {
                ...producto.toObject(),
                precioOriginal: {
                    valor: precioOriginal,
                    moneda: monedaOrigen
                },
                preciosConvertidos
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error actualizando el producto!',
            error: error.message || error
        })
    }
}

export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findByIdAndUpdate(id, { status: false }, { new: true });

        const monedasPermitidas = ['GTQ', 'USD', 'EUR'];
        const monedaOrigen = producto.moneda;
        const precioOriginal = producto.precio;
        const preciosConvertidos = {};

        for (const monedaDestino of monedasPermitidas) {
            if (monedaDestino === monedaOrigen) {
                preciosConvertidos[monedaDestino] = +precioOriginal.toFixed(2);
            } else {
                try {
                    const tipoCambio = await obtenerTipoCambio(monedaOrigen, monedaDestino);
                    preciosConvertidos[monedaDestino] = +(precioOriginal * tipoCambio).toFixed(2);
                } catch {
                    preciosConvertidos[monedaDestino] = null;
                }
            }
        }

        res.status(200).json({
            success: true,
            msg: 'Producto desactivado satisfactoriamente!',
            producto: {
                ...producto.toObject(),
                precioOriginal: {
                    valor: precioOriginal,
                    moneda: monedaOrigen
                },
                preciosConvertidos
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: 'Error desactivando el producto!',
            error: error.message || error
        })
    }
}