function errores() {
  var texto = Codigo.getValue();
  var vector = Reporte_Errores.parse(texto);
  console.log(vector);
  var texto = Consola.getValue();
  if (vector.Errores.length > 0) {
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

function generarTablasErrores(vector, titulo) {
  var div = document.getElementById("erroresT");
  var cad2 = " ";
  cad2 = GenerarTErrores(vector, titulo);
  div.innerHTML = cad2;
}

function GenerarTErrores(v, titulo) {
  var cad = "";
  cad += "<H2><u>" + titulo + "</u></H2>";
  cad += ' <div class="table-wrapper-scroll-y my-custom-scrollbar">\n';
  cad += '<table class="table table-bordered table-striped mb-0">\n';
  cad += "<thead>\n<tr>\n";
  cad +=
    '<th scope="col">#</th>\n<th scope="col">Tipo Error</th>\n<th scope="col">Error</th>\n<th scope="col">Fila</th>\n<th scope="col">Columna</th>\n';
  cad += "</tr>\n";
  cad += '<tbody id="tablaS">';
  cad += LlenarVariablesE(v);
  cad += "</tbody>";
  cad += "</table>";
  cad += "</div>";
  return cad;
}

function LlenarVariablesE(vector) {
  var contarVar = 0;
  var tError = "";
  var error = "";
  var fila = 0;
  var columna = 0;
  var htmlTags = "";
  vector.forEach(function (elemento) {
    tError = elemento.tipo;
    error = elemento.Error;
    fila = elemento.Fila;
    columna = elemento.Columna;
    htmlTags +=
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
    contarVar++;
  });
  return htmlTags;
}
