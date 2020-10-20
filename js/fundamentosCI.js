//VARIABLES UTILIZADAS PARA LA GENERACION DE CODIGO INTERMEDIO
let ambitos = [];
let nombAmbitos = [];
let logAmbitos = [];
let erroresCI = [];
let temporal = 0;
let etiqueta = 0;

///////////////////////////////////////////////AGREGAR AMBITO
function agregarAmbito(nombre) {
  ambitos.push([]);
  nombAmbitos.push(nombre);
}
//////////////////////////////////////////////ELMINAR AMBITO
function eliminarA() {
  //agregando ambito elminado al log de cambios
  logAmbitos.push({
    NombreAmbito: nombAmbitos.pop(),
    contenido: ambitos.pop(),
  });
  //eliminando nombre de vector de nombres
}
//////////////////////////////////////////////RETORNAR NOMBRE DEL AMBITO
function rNomAmbito() {
  return nombAmbitos[nombAmbitos.length - 1];
}
//////////////////////////////////////////////RETORNAR TEMPORAL
function rTemporal() {
  return "T" + temporal++;
}
//////////////////////////////////////////////RETORNAR LABEL
function rLabel() {
  return "L" + etiqueta++;
}
