import Credito from "../credito/credito.model.js";

export const existeCreditoById = async (id = '') => {
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        throw new Error(`El ID ${id} no existe en la base de datos`);
    }

    const existeCredito = await Credito.findById(id);

    if (!existeCredito) {
        throw new Error(`El ID ${id} no existe en la base de datos`);
    }
}

export const soloClient = async (req) => {
    if (req.user.role !== "CLIENTE") {
        throw new Error("Solo los clientes pueden solicitar creditos");
    }
}

export const soloAdmin = async (req) => {
    if (req.user.role !== "ADMIN") {
        throw new Error("Solo los administradores pueden realizar esta acción");
    }
}

export const montoSolicitud = async (montoSolicitado = '') => {
    if (montoSolicitado <= 0) {
        throw new Error("El monto solicitado debe ser mayor a 0");
    }
}

export const plazoSolicitud = async (plazo = '') => {
    if (plazo <= 0) {
        throw new Error("El plazo debe ser mayor a 0");
    }
}

export const tipoMonedaPermitida = async (moneda = '') => {
    const monedasPermitidas = ['GTQ', 'USD', 'EUR'];
    if (moneda && !monedasPermitidas.includes(moneda)) {
        throw new Error("Moneda no permitida. Las monedas válidas son: GTQ, USD, EUR");
    }
}

export const verificarAprovacion = async (credito) => {
    if (credito.yaAprobado) {
        throw new Error("Este crédito ya ha sido aprobado");
    }
}

export const montoAprovacion = async (montoAprobado, credito) => {
    if (montoAprobado > credito.montoSolicitado) {
        throw new Error("El monto aprobado no puede ser mayor que el monto solicitado");
    }

    if (montoAprobado <= 0) {
        throw new Error("El monto aprobado debe ser mayor a 0");
    }
}

export const cuentaActiva = async (cuenta) => {
    if (!cuenta) {
        throw new Error("El usuario no tiene una cuenta activa para recibir el crédito");
    }
}

export const verificarAprovacionDelete = async (credito) => {
    if (credito.yaAprobado) {
        throw new Error("No puedes eliminar un crédito que ya ha sido aprobado");
    }
}