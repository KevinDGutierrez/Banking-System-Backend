import Producto from '../productos/producto.model.js';
import Servicio from '../services/services.model.js';
import { obtenerTipoCambio } from "../utils/apiDivisa.js";

export const validarDatosBasicosOrden = (body) => {
    const { items, moneda, metodoPago } = body;
    if (!items || !Array.isArray(items) || items.length === 0 || !moneda || !metodoPago)
        return { valido: false, msg: "Faltan datos para crear la orden!" };

    if (!['dinero', 'puntos'].includes(metodoPago))
        return { valido: false, msg: "Método de pago inválido!" };

    return { valido: true };
}

export const validarItem = async (item, moneda) => {
    const { nombre, tipo, cantidad = 1 } = item;

    if (!nombre || !tipo)
        return { valido: false, msg: "Falta nombre o tipo en un ítem!" };

    if (!['producto', 'servicio'].includes(tipo))
        return { valido: false, msg: `Tipo inválido: ${tipo}` };

    if (tipo === 'producto') {
        const prod = await Producto.findOne({ nombre: nombre.toLowerCase() });
        if (!prod || !prod.status)
            return { valido: false, msg: `Producto no disponible: ${nombre}` };
        if (prod.existencias < cantidad)
            return { valido: false, msg: `No hay suficientes existencias del producto "${prod.nombre}"` };

        const tipoCambio = prod.moneda === moneda ? 1 : await obtenerTipoCambio(prod.moneda, moneda);
        const precioUnitario = +(prod.precio * tipoCambio).toFixed(2);
        const subtotal = +(precioUnitario * cantidad).toFixed(2);
        const puntos = prod.puntos * cantidad;

        return {
            valido: true,
            detalle: {
                tipo,
                nombre: prod.nombre,
                cantidad,
                precioUnitario,
                subtotal,
                puntos
            }
        }
    }

    if (tipo === 'servicio') {
        const serv = await Servicio.findOne({ nombre: nombre.toLowerCase() });
        if (!serv || !serv.status)
            return { valido: false, msg: `Servicio no disponible: ${nombre}` };

        const tipoCambio = serv.moneda === moneda ? 1 : await obtenerTipoCambio(serv.moneda, moneda);
        const precioUnitario = +(serv.precio * tipoCambio).toFixed(2);
        const subtotal = precioUnitario;
        const puntos = serv.puntos;

        return {
            valido: true,
            detalle: {
                tipo,
                nombre: serv.nombre,
                cantidad: 1,
                precioUnitario,
                subtotal,
                puntos
            }
        }
    }
}