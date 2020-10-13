function errores() {
  var texto = Codigo.getValue();
  var vector = Reporte_Errores.parse(texto);
  console.log(vector);
  var texto = Consola.getValue();
  if (vector.Errores.length > 0) {
    removeTableBody();
    LlenarVariables(vector.Errores);
    Consola.setValue(
      texto +
        "Reporte De Errores :Errores Encontrados Verificar Pestaña de Errores \n"
    );
  } else {
    Consola.setValue(
      texto + "Reporte De Errores : No se encontraron errores \n"
    );
  }
}

function removeTableBody() {
  $("#Tabla_Errores tbody").empty();
}

function LlenarVariables(vector) {
  var contarVar = 0;
  var tError = "";
  var error = "";
  var fila = 0;
  var columna = 0;

  removeTableBody();

  vector.forEach(function (elemento) {
    tError = elemento.tipo;
    error = elemento.Error;
    fila = elemento.Fila;
    columna = elemento.Columna;
    var htmlTags =
      "<tr>" +
      "<td>" +
      (contarVar + 1) +
      "</td>" +
      "<td>" +
      tError +
      "</td>" +
      "<td>" +
      error +
      "</td>" +
      "<td>" +
      fila +
      "</td>" +
      "<td>" +
      columna +
      "</td>" +
      "</tr>";
    //console.log(htmlTags);
    $("#Tabla_Errores tbody").append(htmlTags);
    contarVar++;
  });
}
