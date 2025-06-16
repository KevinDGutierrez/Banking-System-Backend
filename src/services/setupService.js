import {
  servicioAgua,
  servicioLuz,
  servicioInternet,
  servicioTelefono,
  servicioCable,
  servicioSeguridad
} from './services.controller.js';

export const crearServiciosPorDefecto = async () => {
  await servicioAgua();
  await servicioLuz();
  await servicioInternet();
  await servicioTelefono();
  await servicioCable();
  await servicioSeguridad();
};
