//VARIABLES UTILIZADAS PARA LA GENERACION DE CODIGO INTERMEDIO
let ambitos = [];
let nombAmbitos = [];
let logAmbitos = [];
//let codigo3D = [];
let erroresCI = [];
let temporal = 0;
let etiqueta = 0;

///////////////////////////////////////////////AGREGAR AMBITO
function agregarAmbito(nombre) {
  ambitos.push({ Nombre: nombre, Inicio: 0, CantidadE: 0, DatosAmbito: [] });
}
///////////////////////////////////////////////INSERTAR VALOR EN EL AMBITO ACTUAL
function insertarAmbito(nValor) {
  var json = ambitos[ambitos.length - 1].DatosAmbito;
  console.log(json);
  json.push(nValor);
  console.log(json);
  console.log(ambitos);
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

function rTActual() {
  var t = temporal - 1;
  console.log(temporal);
  return "T" + t;
}
//////////////////////////////////////////////RETORNAR LABEL
function rLabel() {
  return "L" + etiqueta++;
}

function limpiar() {
  //codigo3D = [];
  temporal = 0;
  etiqueta = 0;
}
