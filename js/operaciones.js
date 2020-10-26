/*ESTE ARCHIVO SERVIRA PARA GENERAR LAS OPERACIONES ARITMETICAS, LOGICAS Y RELACIONALES*/
/* Se realizara la debida comprobacion de tipos y se generaran el codigo de 3 direcciones */

//OPERACIONES ARITMETICAS
function operacionesAritmeticas(element) {
  var opI = leerExpresion(element.OpIzq);
  var opD = leerExpresion(element.OpDer);
  var c3 = [];
  if (opI.tipo == "C3D") {
    if (opI.codigo3d != undefined) {
      c3 = opI.codigo3d;
    } else {
      c3.push(opI);
    }
  }
  if (opD.tipo == "C3D") {
    if (opD.codigo3d != undefined) {
      c3 = c3.concat(opD.codigo3d);
    } else {
      c3.push(opD);
    }
  }

  if (element.tipo == "+") {
    var p = evaluarSuma(opI, opD);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return {
        tipo: p.tipo,
        tipoDato: p.tipoDato,
        etiqueta: p.etiqueta,
        opIzq: p.opIzq,
        opDer: p.opDer,
        operacion: p.operacion,
        codigo3d: c3,
      };
    } else {
      return p;
    }
  } else if (
    element.tipo == "-" ||
    element.tipo == "*" ||
    element.tipo == "/" ||
    element.tipo == "%"
  ) {
    var p = evaluarAritmetica(opI, opD, element.tipo);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return {
        tipo: p.tipo,
        tipoDato: p.tipoDato,
        etiqueta: p.etiqueta,
        opIzq: p.opIzq,
        opDer: p.opDer,
        operacion: p.operacion,
        codigo3d: c3,
      };
    } else {
      return p;
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
        tipo: "C3D",
        tipoDato: inferirTipo(opI.tipoDato, opD.tipoDato),
        etiqueta: rTemporal(),
        opIzq: vT(opI),
        opDer: vT(opD),
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
        tipo: "C3D",
        tipoDato: inferirTipo(opI.tipoDato, opD.tipoDato),
        etiqueta: rTemporal(),
        opIzq: vT(opI),
        opDer: vT(opD),
        operacion: "+",
      };
    }
  } else if (opI.tipoDato == "BOOLEAN") {
    if (opD.tipoDato == "NUMERO" || opD.tipoDato == "CADENA") {
      return {
        tipo: "C3D",
        tipoDato: inferirTipo(opI.tipoDato, opD.tipoDato),
        etiqueta: rTemporal(),
        opIzq: vT(opI),
        opDer: vT(opD),
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
//TODAS LAS OPEERACIONES MENOS POTENCIA
function evaluarAritmetica(opI, opD, op) {
  if (opI.tipoDato == "NUMERO" && opD.tipoDato == "NUMERO") {
    return {
      tipo: "C3D",
      tipoDato: "NUMERO",
      etiqueta: rTemporal(),
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    };
  } else {
    if (opI.tipoDato != "NUMERO") {
      return {
        tipo: "Error Semantico",
        Error: "valor incompatible con operacion " + op,
        Fila: opI.fila,
        Columna: opI.columna,
      };
    } else {
      return {
        tipo: "Error Semantico",
        Error: "valor incompatible con operacion " + op,
        Fila: opD.fila,
        Columna: opD.columna,
      };
    }
  }
}
//EVALUA OPERACIONES RELACIONALES
function operacionesRelacionales(element) {
  var opI = leerExpresion(element.OpIzq);
  var opD = leerExpresion(element.OpDer);
  var c3 = [];
  if (opI.tipo == "C3D") {
    if (opI.codigo3d != undefined) {
      c3 = opI.codigo3d;
    } else {
      c3.push(opI);
    }
  }
  if (opD.tipo == "C3D") {
    if (opD.codigo3d != undefined) {
      c3 = c3.concat(opD.codigo3d);
    } else {
      c3.push(opD);
    }
  }

  if (
    element.tipo == ">=" ||
    element.tipo == ">" ||
    element.tipo == "<=" ||
    element.tipo == "<"
  ) {
    var p = evaluarSuma(opI, opD);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return {
        tipo: p.tipo,
        tipoDato: p.tipoDato,
        etiqueta: p.etiqueta,
        opIzq: p.opIzq,
        opDer: p.opDer,
        operacion: p.operacion,
        codigo3d: c3,
      };
    } else {
      return p;
    }
  } else if (element.tipo == "==" || element.tipo == "!=") {
    var p = evaluarID(opI, opD);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return {
        tipo: p.tipo,
        tipoDato: p.tipoDato,
        etiqueta: p.etiqueta,
        opIzq: p.opIzq,
        opDer: p.opDer,
        operacion: p.operacion,
        codigo3d: c3,
      };
    } else {
      return p;
    }
  } else {
    if (opI.tipo == "Error Semantico") {
      return opI;
    } else {
      return opD;
    }
  }
}
//TODAS LAS OPERACIONES MAYOR QUE , MAYOR O IGUAL QUE , MENOR QUE, MENOR O IGUAL QUE
function evaluarRelacionales(opI, opD, op) {
  if (opI.tipoDato == "NUMERO" && opD.tipoDato == "NUMERO") {
    return {
      tipo: "C3D",
      tipoDato: "NUMERO",
      etiqueta: rTemporal(),
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    };
  } else {
    if (opI.tipoDato != "NUMERO") {
      return {
        tipo: "Error Semantico",
        Error: "valor incompatible con operacion " + op,
        Fila: opI.fila,
        Columna: opI.columna,
      };
    } else {
      return {
        tipo: "Error Semantico",
        Error: "valor incompatible con operacion " + op,
        Fila: opD.fila,
        Columna: opD.columna,
      };
    }
  }
}
//EVALUA IGUALDAD O DIFERENCIACION
function evaluarID(opI, opD, op) {
  if (opI.tipoDato == opD.tipoDato) {
    return {
      tipo: "C3D",
      tipoDato: "BOOLEAN",
      etiqueta: rTemporal(),
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    };
  } else if (
    (opI.tipoDato == "CADENA" && opD.tipoDato == "NULL") ||
    (opI.tipoDato == "NULL" && opD.tipoDato == "CADENA")
  ) {
    return {
      tipo: "C3D",
      tipoDato: "BOOLEAN",
      etiqueta: rTemporal(),
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    };
  } else {
    return {
      tipo: "Error Semantico",
      Error: "valor incompatible con operacion " + op,
      Fila: opD.fila,
      Columna: opD.columna,
    };
  }
}
//EVALUA OPERACIONES LOGICAS
function operacionesLogicas(element) {
  //BUSCANDO TIPO DE OPERACION PARA PODER EVALUARLA
  if (element.tipo == "!") {
    //OBTENIENDO OPERADOR
    var opD = leerExpresion(element.OpDer);
    var c3 = [];
    //CONCATENANDO CODIGO DE 3 DIRECCIONES
    if (opD.tipo == "C3D") {
      if (opD.codigo3d != undefined) {
        c3 = c3.concat(opD.codigo3d);
      } else {
        c3.push(opD);
      }
    }

    if (opD.tipo != "Error Semantico") {
      var p = evaluarLogica(opI, opD, element.tipo);
      c3.push(p);
      if (p.tipo != "Error Semantico") {
        return {
          tipo: p.tipo,
          tipoDato: p.tipoDato,
          etiqueta: p.etiqueta,
          opIzq: undefined,
          opDer: p.opDer,
          operacion: p.operacion,
          codigo3d: c3,
        };
      } else {
        return p;
      }
    } else {
      return opD;
    }
  } else {
    var opI = leerExpresion(element.OpIzq);
    var opD = leerExpresion(element.OpDer);
    var c3 = [];
    if (opI.tipo == "C3D") {
      if (opI.codigo3d != undefined) {
        c3 = opI.codigo3d;
      } else {
        c3.push(opI);
      }
    }
    if (opD.tipo == "C3D") {
      if (opD.codigo3d != undefined) {
        c3 = c3.concat(opD.codigo3d);
      } else {
        c3.push(opD);
      }
    }

    if (opI.tipo != "Error Semantico" && opD.tipo != "Error Semantico") {
      var p = evaluarLogica(opI, opD, element.tipo);
      c3.push(p);
      if (p.tipo != "Error Semantico") {
        return {
          tipo: p.tipo,
          tipoDato: p.tipoDato,
          etiqueta: p.etiqueta,
          opIzq: p.opIzq,
          opDer: p.opDer,
          operacion: p.operacion,
          codigo3d: c3,
        };
      } else {
        return p;
      }
    } else {
      if (opI.tipo == "Error Semantico") {
        return opI;
      } else {
        return opD;
      }
    }
  }
}

function evaluarLogica(opI, opD, op) {
  console.log("********* OPI *********");
  console.log(opI);
  console.log("********* OPD *********");
  console.log(opD);
  console.log("***********************");
  if (op == "!") {
    if (opD.tipoDato == "BOOLEAN") {
      return {
        tipo: "C3D",
        tipoDato: "BOOLEAN",
        etiqueta: rTemporal(),
        opIzq: undefined,
        opDer: vT(opD),
        operacion: op,
      };
    } else {
      return {
        tipo: "Error Semantico",
        Error: "valor incompatible con operacion " + op,
        Fila: opD.fila,
        Columna: opD.columna,
      };
    }
  } else {
    if (opI.tipoDato == "BOOLEAN" && opD.tipoDato == "BOOLEAN") {
      return {
        tipo: "C3D",
        tipoDato: "BOOLEAN",
        etiqueta: rTemporal(),
        opIzq: vT(opI),
        opDer: vT(opD),
        operacion: op,
      };
    } else {
      if (opI.tipoDato != "BOOLEAN") {
        return {
          tipo: "Error Semantico",
          Error: "valor incompatible con operacion " + op,
          Fila: opI.fila,
          Columna: opI.columna,
        };
      } else {
        return {
          tipo: "Error Semantico",
          Error: "valor incompatible con operacion " + op,
          Fila: opD.fila,
          Columna: opD.columna,
        };
      }
    }
  }
}

function inferirTipo(tpI, tpD) {
  if (tpI == "CADENA" || tpD == "CADENA") {
    return "CADENA";
  } else {
    return "NUMERO";
  }
}

function vT(ele) {
  if (ele.tipo == "C3D") {
    return ele.etiqueta;
  } else {
    return ele.valor;
  }
}
