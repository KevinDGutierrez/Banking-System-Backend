import Producto from '../productos/producto.model.js';
import Orden from '../ordenes/orden.model.js';
import Cuenta from '../account/account.model.js';
import { obtenerTipoCambio } from "../utils/apiDivisa.js";
import { validarDatosBasicosOrden, validarItem } from '../helpers/db-validator-ordenes.js';

export const crearOrden = async (req, res) => {
    try {
        const { items, moneda, metodoPago } = req.body;
        const cliente = req.user;

        const validacionBasica = validarDatosBasicosOrden(req.body);
        if (!validacionBasica.valido) {
            return res.status(400).json({ msg: validacionBasica.msg });
        }

        const ordenItems = [];
        let total = 0;
        let puntosTotales = 0;

        for (const item of items) {
            const resultado = await validarItem(item, moneda);
            if (!resultado.valido) {
                return res.status(400).json({ msg: resultado.msg });
            }
            const detalle = resultado.detalle;
            ordenItems.push(detalle);
            total += detalle.subtotal;
            puntosTotales += detalle.puntos;
        }

        if (metodoPago === 'puntos') {
            if (cliente.puntos < puntosTotales) {
                return res.status(400).json({
                    msg: `No tienes suficientes puntos para canjear esta orden! Necesitas ${puntosTotales}, tienes ${cliente.puntos}`
                })
            }
            cliente.puntos -= puntosTotales;
            await cliente.save();
        }

        if (metodoPago === 'dinero') {
            const cuentasActivas = await Cuenta.find({ propietario: cliente._id, estado: 'activa' });
            if (!cuentasActivas.length) {
                return res.status(400).json({ msg: "No se encontró ninguna cuenta activa para el cliente!" });
            }

            let cuenta = cuentasActivas.find(c => c.moneda === moneda) || cuentasActivas[0];
            let totalEnMonedaCuenta = cuenta.moneda === moneda
                ? total
                : +(total * await obtenerTipoCambio(moneda, cuenta.moneda)).toFixed(2);

            if (cuenta.saldo < totalEnMonedaCuenta) {
                return res.status(400).json({
                    msg: `Saldo insuficiente. Necesitas ${totalEnMonedaCuenta} ${cuenta.moneda}, tienes ${cuenta.saldo}`
                })
            }

            cuenta.saldo -= totalEnMonedaCuenta;
            await cuenta.save();

            cliente.puntos += puntosTotales;
            await cliente.save();
        }

        const nuevaOrden = new Orden({
            cliente: cliente._id,
            moneda,
            metodoPago,
            items: ordenItems,
            total: metodoPago === 'dinero' ? total : 0,
            puntosUsados: metodoPago === 'puntos' ? puntosTotales : 0,
            puntosGanados: metodoPago === 'dinero' ? puntosTotales : 0
        })

        await nuevaOrden.save();

        for (const item of ordenItems) {
            if (item.tipo === 'producto') {
                const prod = await Producto.findOne({ nombre: item.nombre });
                prod.existencias -= item.cantidad;
                await prod.save();
            }
        }

        return res.status(201).json({
            success: true,
            msg: metodoPago === 'dinero' ? "Orden pagada exitosamente!" : "Orden canjeada exitosamente con puntos!",
            orden: {
                cliente: cliente.username,
                moneda,
                metodoPago,
                items: ordenItems,
                totalAPagar: metodoPago === 'dinero' ? total : 0,
                puntosGastados: metodoPago === 'puntos' ? puntosTotales : 0,
                puntosGanados: metodoPago === 'dinero' ? puntosTotales : 0
            }
        })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Error al procesar la orden!" });
    }
}

const monedasPermitidas = ['GTQ', 'USD', 'EUR'];

async function convertirPrecios(items, monedaOriginal) {
    return Promise.all(items.map(async (item) => {
        const preciosConvertidos = {};
        for (const monedaDestino of monedasPermitidas) {
            if (monedaDestino === monedaOriginal) {
                preciosConvertidos[monedaDestino] = +item.precioUnitario.toFixed(2);
            } else {
                try {
                    const tipoCambio = await obtenerTipoCambio(monedaOriginal, monedaDestino);
                    preciosConvertidos[monedaDestino] = +(item.precioUnitario * tipoCambio).toFixed(2);
                } catch {
                    preciosConvertidos[monedaDestino] = null;
                }
            }
        }
        return {
            tipo: item.tipo,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
            puntos: item.puntos,
            precioOriginal: {
                valor: item.precioUnitario,
                moneda: monedaOriginal
            },
            preciosConvertidos
        }
    }))
}

export const getOrdenesConProductos = async (req, res) => {
    try {
        const { limite = 10, desde = 0, moneda = 'GTQ' } = req.query;

        const clienteId = req.user._id; // Usuario autenticado
        const query = { "items.tipo": "producto", cliente: clienteId };

        const [total, ordenesRaw] = await Promise.all([
            Orden.countDocuments(query),
            Orden.find(query)
                .populate("cliente", "username correo")
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        const ordenes = await Promise.all(ordenesRaw.map(async (ordenDoc) => {
            const orden = ordenDoc.toObject();
            orden.items = await convertirPrecios(orden.items, orden.moneda);
            return orden;
        }));

        res.status(200).json({
            success: true,
            total,
            ordenes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener órdenes de productos!",
            error: error.message
        });
    }
}

export const getOrdenesConServicios = async (req, res) => {
    try {
        const { limite = 10, desde = 0, moneda = 'GTQ' } = req.query;

        const clienteId = req.user._id; // Usuario autenticado
        const query = { "items.tipo": "servicio", cliente: clienteId };

        const [total, ordenesRaw] = await Promise.all([
            Orden.countDocuments(query),
            Orden.find(query)
                .populate("cliente", "username correo")
                .skip(Number(desde))
                .limit(Number(limite))
        ]);

        const ordenes = await Promise.all(ordenesRaw.map(async (ordenDoc) => {
            const orden = ordenDoc.toObject();
            orden.items = await convertirPrecios(orden.items, orden.moneda);
            return orden;
        }));

        res.status(200).json({
            success: true,
            total,
            ordenes
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            msg: "Error al obtener órdenes de servicios!",
            error: error.message
        });
    }
}

export const getVerMisOrdenes = async (req, res) => {
    try {
        const usuario = req.user;
        const ordenes = await Orden.find({ cliente: usuario._id }).populate("cliente", "username correo");
        res.status(200).json({
            usuario: usuario.username,
            totalOrdenes: ordenes.length,
            ordenes
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            msg: "Error al obtener las órdenes",
            error: error.message
        })
    }
}