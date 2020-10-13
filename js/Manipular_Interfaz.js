function traducir() {
  var texto = Codigo.getValue();
  var tr = Traduccion.parse(texto);
  TraduccionTP.setValue(tr);
  alert("Traduccion Completa");
}
