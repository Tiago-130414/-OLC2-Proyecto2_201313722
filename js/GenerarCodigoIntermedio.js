//FUNCION PRINCIPAL LLAMADA DESDE PAGINA (AYUDA A GENERAR CODIGO INTERMEDIO Y LOS ERRORES EN DICHO CODIGO)
function generarIntermedio() {
  var cod = Codigo.getValue();
  var json = Traduccion.parse(cod);
  if (json.err.length > 0) {
    //adjuntando errores lexicos y sintacticos antes de encontrar los semanticos
    erroresCI = erroresCI.concat(json.err);
  }
  //generara el codigo intermedio
  agregarAmbito("GLOBAL");
  generate(json.jsonInt);
  eliminarA();
  //luego de generar el codigo valido se reportan los errores
  if (erroresCI.length > 0) {
    generarTablasErrores(json.err, "Codigo Intermedio");
  }
}

//ESTE METODO ES PARA RECORRER EL JSON GENERADO DESDE TRADUCCION.JISON
function generate(json) {
  for (var element of json) {
    if (element.tipo == "DECLARACION") {
      //ESTA ES LA VARIABLE
      console.log(element.contenido);
    } else if (element.tipo == "IMPRIMIR") {
      //ESTE ES EL CONSOLE
      generarImprimir(element.contenido);
    }
  }
}
///////////////////////////////////////////////// CONSOLE
function generarImprimir(element) {
  var exp;
  if (Array.isArray(element)) {
    exp = element[0];
  } else {
    exp = element;
  }
  console.log(exp);
  var result = leerExpresion(exp);
  console.log(result);
}

function leerExpresion(expresion) {
  if (
    expresion.tipo == "+" ||
    expresion.tipo == "-" ||
    expresion.tipo == "*" ||
    expresion.tipo == "/" ||
    expresion.tipo == "**" ||
    expresion.tipo == "%"
  ) {
    return operacionesAritmeticas(expresion);
  } else if (expresion.tipo == "PRIMITIVO") {
    return expresion;
  } else if (expresion.tipo == "VALOR") {
    return expresion;
  }
}
