function generarTablas(ambitos, nom) {
  var div = document.getElementById("htmlTxt");
  var cad = " ";
  cad = recorrerAmbitos(ambitos, nom);
  div.innerHTML = cad;
}

function recorrerAmbitos(ambitos, nom) {
  var cad = "";
  for (var elementos in ambitos) {
    if (ambitos[elementos].length > 0) {
      cad += "<H2><u>" + nom[elementos] + "</u></H2>";
      cad += ' <div class="table-wrapper-scroll-y my-custom-scrollbar">\n';
      cad += '<table class="table table-bordered table-striped mb-0">\n';
      cad += "<thead>\n<tr>\n";
      cad +=
        '<th scope="col">#</th>\n<th scope="col">Nombre</th>\n<th scope="col">Tipo</th>\n<th scope="col">Ambito</th>\n<th scope="col">Linea</th>\n';
      cad += "</tr>\n";
      cad += '<tbody id="tablaS">';
      cad += LlenarVariablesTS(ambitos[elementos]);
      cad += "</tbody>";
      cad += "</table>";
      cad += "</div>";
    } else {
      continue;
    }
  }
  return cad;
}

function LlenarVariablesTS(vector) {
  var contarVar = 0;
  var nombre = "";
  var tipo = "";
  var ambito = "";
  var fila = 0;
  var htmlTags = "";

  vector.forEach(function (elemento) {
    nombre = elemento.identificador;
    tipo = elemento.tipo;
    ambito = elemento.ambito;
    fila = elemento.fila;
    htmlTags +=
      "<tr>" +
      "<td>" +
      (contarVar + 1) +
      "</td>" +
      "<td>" +
      nombre +
      "</td>" +
      "<td>" +
      tipo +
      "</td>" +
      "<td>" +
      ambito +
      "</td>" +
      "<td>" +
      fila +
      "</td>" +
      "</tr>\n";
    contarVar++;
  });
  return htmlTags;
}

function generarLog(log) {
  var div = document.getElementById("TablaLog");
  var cad = " ";

  for (var element of log) {
    //console.log(element);
    cad += "<H2><u>" + element.NombreAmbito + "</u></H2>";
    cad += ' <div class="table-wrapper-scroll-y my-custom-scrollbar">\n';
    cad += '<table class="table table-bordered table-striped mb-0">\n';
    cad += "<thead>\n<tr>\n";
    cad +=
      '<th scope="col">#</th>\n<th scope="col">Nombre</th>\n<th scope="col">Tipo</th>\n<th scope="col">Ambito</th>\n<th scope="col">Linea</th>\n';
    cad += "</tr>\n";
    cad += '<tbody id="tablaS">';
    cad += LlenarVariablesTS(element.contenido);
    cad += "</tbody>";
    cad += "</table>";
    cad += "</div>";
  }
  div.innerHTML = cad;
}

/*
 log.forEach(function (elemento) {
    nombre = elemento.identificador;
    tipo = elemento.tipo;
    ambito = elemento.ambito;
    fila = elemento.fila;
    htmlTags =
      "<tr>" +
      "<td>" +
      (contarVar + 1) +
      "</td>" +
      "<td>" +
      nombre +
      "</td>" +
      "<td>" +
      tipo +
      "</td>" +
      "<td>" +
      ambito +
      "</td>" +
      "<td>" +
      fila +
      "</td>" +
      "</tr>\n";
    $("#Tabla_Registro tbody").append(htmlTags);
    contarVar++;
  });
*/
