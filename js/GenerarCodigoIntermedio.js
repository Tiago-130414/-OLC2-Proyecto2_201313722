//FUNCION PRINCIPAL LLAMADA DESDE PAGINA (AYUDA A GENERAR CODIGO INTERMEDIO Y LOS ERRORES EN DICHO CODIGO)
function generarIntermedio(traduccion) {
  //var cod = Codigo.getValue();
  var json = Traduccion.parse(traduccion);
  if (json.err.length > 0) {
    //adjuntando errores lexicos y sintacticos antes de encontrar los semanticos
    erroresCI = erroresCI.concat(json.err);
  }
  //generara el codigo intermedio
  agregarAmbito("GLOBAL");
  generate(json.jsonInt);
  eliminarA();
  //console.log(generarCodigo3DCadena("prueba"));
}

//ESTE METODO ES PARA RECORRER EL JSON GENERADO DESDE TRADUCCION.JISON
function generate(json) {
  for (var element of json) {
    if (element.tipo == "DECLARACION") {
      //ESTA ES LA VARIABLE
      declaracion(element.contenido, element.modificador);
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

  var result = leerExpresion(exp);
  if (result.tipo != "Error Semantico") {
    if (result.tipo == "C3D") {
      console.log(result);
      imprimirC3(result.codigo3d);
      limpiar();
    }
  } else {
    erroresCI.push(result);
  }
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
  } else if (
    expresion.tipo == ">=" ||
    expresion.tipo == ">" ||
    expresion.tipo == "<=" ||
    expresion.tipo == "<" ||
    expresion.tipo == "==" ||
    expresion.tipo == "!="
  ) {
    return operacionesRelacionales(expresion);
  } else if (
    expresion.tipo == "&&" ||
    expresion.tipo == "||" ||
    expresion.tipo == "!"
  ) {
    return operacionesLogicas(expresion);
  } else if (expresion.tipo == "PRIMITIVO") {
    return expresion;
  } else if (expresion.tipo == "VALOR") {
    return expresion;
  }
}

function imprimirC3(v) {
  var cad = "";
  console.log(v);
  for (var element of v) {
    if (element.tipo == "C3D") {
      cad +=
        element.etiqueta +
        " = " +
        element.opIzq +
        " " +
        element.operacion +
        " " +
        element.opDer +
        ";\n";
    } else if (element.tipo == "LLC3D") {
      cad += element.id + "( " + element.etiqueta + " );\n";
    }
  }
  TraduccionTP.setValue(cad);
}
