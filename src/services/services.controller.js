import Servicio from './services.model.js';

export const servicioAgua = async () => {
  try {
    const existe = await Servicio.findOne({ nombre: 'agua' });
    if (!existe) {
      await Servicio.create({
        nombre: 'agua',
        descripcion: 'Servicio básico de agua potable para el hogar.',
        precio: 75,
        puntos: 1500,
        moneda: 'GTQ'
      });
      console.log('Servicio de agua creado');
    } else {
      console.log('Servicio de agua ya existe, no se volvió a crear');
    }
  } catch (error) {
    console.error('Error al crear servicio de agua', error.message);
  }
};

export const servicioLuz = async () => {
  try {
    const existe = await Servicio.findOne({ nombre: 'luz' });
    if (!existe) {
      await Servicio.create({
        nombre: 'luz',
        descripcion: 'Servicio de energía eléctrica para el hogar.',
        precio: 120,
        puntos: 2000,
        moneda: 'GTQ'
      });
      console.log('Servicio de luz creado');
    } else {
      console.log('Servicio de luz ya existe, no se volvió a crear');
    }
  } catch (error) {
    console.error('Error al crear servicio de luz', error.message);
  }
};

export const servicioInternet = async () => {
  try {
    const existe = await Servicio.findOne({ nombre: 'internet' });
    if (!existe) {
      await Servicio.create({
        nombre: 'internet',
        descripcion: 'Servicio de internet residencial de 30 Mbps.',
        precio: 150,
        puntos: 3000,
        moneda: 'GTQ'
      });
      console.log('Servicio de internet creado');
    } else {
      console.log('Servicio de internet ya existe, no se volvió a crear');
    }
  } catch (error) {
    console.error('Error al crear servicio de internet', error.message);
  }
};

export const servicioTelefono = async () => {
  try {
    const existe = await Servicio.findOne({ nombre: 'teléfono' });
    if (!existe) {
      await Servicio.create({
        nombre: 'teléfono',
        descripcion: 'Servicio de telefonía fija con llamadas ilimitadas.',
        precio: 60,
        puntos: 1200,
        moneda: 'GTQ'
      });
      console.log('Servicio de teléfono creado');
    } else {
      console.log('Servicio de teléfono ya existe, no se volvió a crear');
    }
  } catch (error) {
    console.error('Error al crear servicio de teléfono', error.message);
  }
};

export const servicioCable = async () => {
  try {
    const existe = await Servicio.findOne({ nombre: 'cable' });
    if (!existe) {
      await Servicio.create({
        nombre: 'cable',
        descripcion: 'Servicio de televisión por cable con más de 100 canales.',
        precio: 100,
        puntos: 1800,
        moneda: 'GTQ'
      });
      console.log('Servicio de cable creado');
    } else {
      console.log('Servicio de cable ya existe, no se volvió a crear');
    }
  } catch (error) {
    console.error('Error al crear servicio de cable', error.message);
  }
};

export const servicioSeguridad = async () => {
  try {
    const existe = await Servicio.findOne({ nombre: 'seguridad residencial' });
    if (!existe) {
      await Servicio.create({
        nombre: 'seguridad residencial',
        descripcion: 'Servicio de vigilancia privada y monitoreo de cámaras.',
        precio: 200,
        puntos: 3500,
        moneda: 'GTQ'
      });
      console.log('Servicio de seguridad residencial creado');
    } else {
      console.log('Servicio de seguridad residencial ya existe, no se volvió a crear');
    }
  } catch (error) {
    console.error('Error al crear servicio de seguridad residencial', error.message);
  }
};

export const getServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.status(200).json(servicios);
  } catch (error) {
    console.error('Error al obtener servicios', error.message);
    res.status(500).json({
      msg: 'Error al obtener los servicios',
      error: error.message
    });
  }
};
