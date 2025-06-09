import Producto from '../productos/producto.model.js';

export const idProductoValida = async (id = ' ') => {
    const productoExistente = await Producto.findById(id);

    if (!productoExistente) {
        throw new Error(`Producto con el id: ${id}, no existe en la base de datos!`);
    }
}

export const nombreProductoValido = async (nombre = ' ') => {
    const productoExistente = await Producto.findOne({ nombre });

    if (!productoExistente) {
        throw new Error(`Producto con el ${nombre} no existe en la base de datos!`);
    }
}

export const tipoMonedaPermitida = async (moneda = '') => {
    const monedasPermitidas = ['GTQ', 'USD', 'EUR'];
    if (moneda && !monedasPermitidas.includes(moneda)) {
        throw new Error("Moneda no permitida! Las monedas válidas son: GTQ, USD, EUR");
    }
}