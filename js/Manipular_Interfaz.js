function traducir() {
  var texto = Codigo.getValue();
  var tr = DesanidarFuncion.parse(texto);
  //TraduccionTP.setValue(tr.traduccion);
  //console.log(tr.errores);
  if (tr.errores.length > 0) {
    erroresCI = erroresCI.concat(tr.errores);
  }
  generarIntermedio(tr.traduccion);
  //luego de generar el codigo valido se reportan los errores
  if (erroresCI.length > 0) {
    generarTablasErrores(erroresCI, "Codigo Intermedio");
    erroresCI = [];
  }
  alert("Traduccion Completa");
}
