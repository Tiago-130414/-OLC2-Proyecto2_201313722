var tablaSimbolos = [];
function generarTablas() {
  var div = document.getElementById("htmlTxt");
  //tablaSimbolos = logAmbitos;
  var cad = generarTablaSimbolos();
  if (cad != false) {
    div.innerHTML = cad;
    alert("Tabla de Simbolos generada");
  } else {
    alert("Tabla de Simbolos vacia");
  }
  tablaSimbolos = [];
}

function generarTablaSimbolos() {
  var cad = "";
  //for (var elementos in ambitos) {
  var tabla = formarTabla();

  if (tabla != false) {
    cad += ' <div class="table-wrapper-scroll-y my-custom-scrollbar">\n';
    cad += '<table class="table table-bordered table-striped mb-0">\n';
    cad += "<thead>\n<tr>\n";
    cad +=
      '<th scope="col">#</th>\n<th scope="col">Nombre</th>\n<th scope="col">Tipo</th>\n<th scope="col">Ambito</th>\n<th scope="col">Fila</th>\n<th scope="col">Columna</th>\n';
    cad += "</tr>\n";
    cad += '<tbody id="tablaS">';
    cad += formarTabla();
    cad += "</tbody>";
    cad += "</table>";
    cad += "</div>";
    return cad;
  } else {
    return false;
  }
}

function formarTabla() {
  var tabla = unirVectores();
  if (tabla != false) {
    return LlenarVariablesTS(tabla);
  } else {
    return false;
  }
}

function LlenarVariablesTS(vector) {
  var contarVar = 0;
  var nombre = "";
  var tipo = "";
  var ambito = "";
  var fila = 0;
  var htmlTags = "";

  for (var element = vector.length - 1; element >= 0; element--) {
    nombre = vector[element].Nombre;
    tipo = vector[element].Tipo;
    ambito = vector[element].Ambito;
    fila = vector[element].Fila;
    columna = vector[element].Columna;
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
      "<td>" +
      columna +
      "</td>" +
      "</tr>\n";
    contarVar++;
  }
  return htmlTags;
}

function unirVectores() {
  var aux = [];
  var nombAmb = "";
  if (tablaSimbolos.length > 0) {
    for (var element of tablaSimbolos) {
      nombAmb = element.Nombre;
      if (element.DatosAmbito.length > 0) {
        for (var ele of element.DatosAmbito) {
          aux.push(eTabla(ele, nombAmb));
        }
      } else {
        continue;
      }
    }
    return aux;
  } else {
    return false;
  }
}

function eTabla(element, nAmb) {
  return {
    Nombre: element.identificador,
    Tipo: element.tipoDato,
    Ambito: nAmb,
    Fila: element.fila,
    Columna: element.columna,
  };
}
