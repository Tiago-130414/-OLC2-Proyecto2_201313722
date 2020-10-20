/*ESTE ARCHIVO SERVIRA PARA GENERAR LAS OPERACIONES ARITMETICAS, LOGICAS Y RELACIONALES*/
/* Se realizara la debida comprobacion de tipos y se generaran el codigo de 3 direcciones */

//OPERACIONES ARITMETICAS
function operacionesAritmeticas(element) {
  var opI = leerExpresion(element.OpIzq);
  var opD = leerExpresion(element.OpDer);
  if (opI.tipo != "Error Semantico" && opD.tipo != "Error Semantico") {
    if (element.tipo == "+") {
      return evaluarSuma(opI, opD);
    } else if (
      element.tipo == "-" ||
      element.tipo == "*" ||
      element.tipo == "/" ||
      element.tipo == "%"
    ) {
    } else if (element.tipo == "**") {
    }
  } else {
    if (opI.tipo == "Error Semantico") {
      return opI;
    } else {
      return opD;
    }
  }
}

//VERIFICACION DE TIPOS SUMA

function evaluarSuma(opI, opD) {
  if (opI.tipoDato == "NUMERO") {
    if (
      opD.tipoDato == "NUMERO" ||
      opD.tipoDato == "BOOLEAN" ||
      opD.tipoDato == "CADENA"
    ) {
      return {
        tipo: "VALOR",
        etiqueta: rTemporal(),
        opIzq: opI,
        opDer: opD,
        operacion: "+",
      };
    }
  } else if (opI.tipoDato == "CADENA") {
    if (
      opD.tipoDato == "NUMERO" ||
      opD.tipoDato == "BOOLEAN" ||
      opD.tipoDato == "CADENA"
    ) {
      return {
        tipo: "VALOR",
        etiqueta: rTemporal(),
        opIzq: opI,
        opDer: opD,
        operacion: "+",
      };
    }
  } else if (opI.tipoDato == "BOOLEAN") {
    if (opD.tipoDato == "NUMERO" || opD.tipoDato == "CADENA") {
      return {
        tipo: "VALOR",
        etiqueta: rTemporal(),
        opIzq: opI,
        opDer: opD,
        operacion: "+",
      };
    }
  } else {
    return {
      tipo: "Error Semantico",
      Error: "valor incompatible con operacion aritmetica",
      Fila: opD.fila,
      Columna: opD.columna,
    };
  }
}
