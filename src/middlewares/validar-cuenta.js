import Cuenta from "../account/account.model.js";

export const verificarSiCuentaEsDePromerica = (Cuenta) => {
  // Puedes ajustar esta expresión regular según el patrón real
  const patronPromerica = /^922\d{6}$/;

  return patronPromerica.test(Cuenta);
};
