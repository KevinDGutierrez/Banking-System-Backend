import axios from 'axios';

export const obtenerTipoCambio = async (monedaCredito, monedaCuenta) => {
    const apiKey = '81063e12c703b2a094938616';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${monedaCredito}`;

    try {
        const response = await axios.get(url);

        const tipoCambio = response.data.conversion_rates[monedaCuenta];

        if (!tipoCambio) {
            throw new Error('Tipo de cambio no disponible para estas monedas');
        }

        return tipoCambio;
    } catch (error) {
        throw new Error(`Error al obtener el tipo de cambio: ${error.message}`);
    }
}