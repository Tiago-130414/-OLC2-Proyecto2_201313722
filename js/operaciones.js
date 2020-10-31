/*ESTE ARCHIVO SERVIRA PARA GENERAR LAS OPERACIONES ARITMETICAS, LOGICAS Y RELACIONALES*/
/* Se realizara la debida comprobacion de tipos y se generaran el codigo de 3 direcciones */

//OPERACIONES ARITMETICAS
function operacionesAritmeticas(element) {
  var opI = leerExpresion(element.OpIzq);
  var opD = leerExpresion(element.OpDer);
  var c3 = [];

  //AQUI SE CONCATENA EL CODIGO DE 3 DIRECCIONES DE LADO IZQUIERDO
  if (opI.tipo == "C3D") {
    if (opI.codigo3d != undefined) {
      c3 = opI.codigo3d;
    } else {
      c3.push(opI);
    }
  }

  //AQUI SE CONCATENA EL CODIGO DE 3 DIRECCIONES DE LADO DERECHO
  if (opD.tipo == "C3D") {
    if (opD.codigo3d != undefined) {
      c3 = c3.concat(opD.codigo3d);
    } else {
      c3.push(opD);
    }
  }
  //AQUI SE COMIENZAN A EVALUAR CADA OPERACION SEGUN SU SIMBOLO
  if (element.tipo == "+") {
    var p = evaluarSuma(opI, opD);
    if (p.tipo != "Error Semantico") {
      c3 = c3.concat(p.codigo3d);
      return p;
      //gC3D(p.tipoDato, p.etiqueta, c3)
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
      return gC3D(p.tipoDato, p.etiqueta, c3);
    } else {
      return p;
    }
  } else if (element.tipo == "**") {
    var p = evaluarPotencia(opI, opD);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return gC3D(p.tipoDato, p.etiqueta, c3);
    } else {
      return p;
    }
  }
}
//VERIFICACION DE TIPOS SUMA
function evaluarSuma(opI, opD) {
  if (opI.tipoDato == "ENTERO" || opI.tipoDato == "DECIMAL") {
    if (
      opD.tipoDato == "ENTERO" ||
      opD.tipoDato == "DECIMAL" ||
      opD.tipoDato == "BOOLEAN" ||
      opD.tipoDato == "CADENA"
    ) {
      return generarCodigo(opI, opD, "+");
    }
  } else if (opI.tipoDato == "CADENA") {
    if (
      opD.tipoDato == "ENTERO" ||
      opD.tipoDato == "DECIMAL" ||
      opD.tipoDato == "BOOLEAN" ||
      opD.tipoDato == "CADENA"
    ) {
      return generarCodigo(opI, opD, "+");
    }
  } else if (opI.tipoDato == "BOOLEAN") {
    if (
      opD.tipoDato == "ENTERO" ||
      opD.tipoDato == "DECIMAL" ||
      opD.tipoDato == "CADENA"
    ) {
      return generarCodigo(opI, opD, "+");
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
  if (
    (opI.tipoDato == "ENTERO" && opD.tipoDato == "ENTERO") ||
    (opI.tipoDato == "DECIMAL" && opD.tipoDato == "DECIMAL")
  ) {
    return gC3Doperacion(opI, opD, op);
  } else {
    if (opI.tipoDato != "ENTERO" || opI.tipoDato != "DECIMAL") {
      return gError(
        "valor incompatible con operacion " + op,
        opI.fila,
        opI.columna
      );
    } else {
      return gError(
        "valor incompatible con operacion " + op,
        opD.fila,
        opD.columna
      );
    }
  }
}
//POTENCIA
function evaluarPotencia(opI, opD) {
  if (opI.tipoDato == "ENTERO" && opD.tipoDato == "ENTERO") {
    return gC3Doperacion(opI, opD, "**");
  } else {
    if (opI.tipoDato != "ENTERO") {
      return gError(
        "valor incompatible con operacion **",
        opI.fila,
        opI.columna
      );
    } else {
      return gError(
        "valor incompatible con operacion **",
        opD.fila,
        opD.columna
      );
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
    var p = evaluarRelacionales(opI, opD, element.tipo);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return gC3D(p.tipoDato, p.etiqueta, c3);
    } else {
      return p;
    }
  } else if (element.tipo == "==" || element.tipo == "!=") {
    var p = evaluarID(opI, opD, element.tipo);
    c3.push(p);
    if (p.tipo != "Error Semantico") {
      return gC3D(p.tipoDato, p.etiqueta, c3);
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
  if (
    (opI.tipoDato == "ENTERO" || opI.tipoDato == "DECIMAL") &&
    (opD.tipoDato == "ENTERO" || opD.tipoDato == "DECIMAL")
  ) {
    return gC3Doperacion(opI, opD, op);
  } else {
    if (opI.tipoDato != "ENTERO" || opI.tipoDato != "DECIMAL") {
      return gError(
        "valor incompatible con operacion " + op,
        opI.fila,
        opI.columna
      );
    } else {
      return gError(
        "valor incompatible con operacion " + op,
        opD.fila,
        opD.columna
      );
    }
  }
}
//EVALUA IGUALDAD O DIFERENCIACION
function evaluarID(opI, opD, op) {
  if (opI.tipoDato == opD.tipoDato) {
    return gC3Doperacion(opI, opD, op);
  } else if (
    (opI.tipoDato == "CADENA" && opD.tipoDato == "NULL") ||
    (opI.tipoDato == "NULL" && opD.tipoDato == "CADENA")
  ) {
    return gC3Doperacion(opI, opD, op);
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
        return gC3D(p.tipoDato, p.etiqueta, c3);
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
        return gC3D(p.tipoDato, p.etiqueta, c3);
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
//FUNCION QUE GENERA CODIGO DE 3 DIRECCIONES DE LAS OPERACIONES LOGICAS
function evaluarLogica(opI, opD, op) {
  if (op == "!") {
    if (opD.tipoDato == "BOOLEAN") {
      return gC3Doperacion(undefined, opD, op);
    } else {
      return gError(
        "valor incompatible con operacion " + op,
        opD.fila,
        opD.columna
      );
    }
  } else {
    if (opI.tipoDato == "BOOLEAN" && opD.tipoDato == "BOOLEAN") {
      return gC3Doperacion(opI, opD, op);
    } else {
      if (opI.tipoDato != "BOOLEAN") {
        return gError(
          "valor incompatible con operacion " + op,
          opI.fila,
          opI.columna
        );
      } else {
        return gError(
          "valor incompatible con operacion " + op,
          opD.fila,
          opD.columna
        );
      }
    }
  }
}
//INFIERE LOS TIPOS DE RESULTADO SEGUN EL TIPO DE OPERACION Y EL TIPO DE DATO DE CADA OPERADOR
function inferirTipo(tpI, tpD, op) {
  if (op == "+") {
    if (tpI == "CADENA" || tpD == "CADENA") {
      return "CADENA";
    } else if (tpI == "DECIMAL" || tpD == "DECIMAL") {
      return "DECIMAL";
    } else {
      return "ENTERO";
    }
  } else if (op == "-" || op == "/" || op == "*" || op == "%") {
    if (tpI == "DECIMAL" || tpD == "DECIMAL") {
      return "DECIMAL";
    } else {
      return "ENTERO";
    }
  } else if (op == "**") {
    return "ENTERO";
  } else if (
    op == ">" ||
    op == ">=" ||
    op == "<" ||
    op == "<=" ||
    op == "==" ||
    op == "!=" ||
    op == "&&" ||
    op == "||" ||
    op == "!"
  ) {
    return "BOOLEAN";
  }
}
//VERIFICA SI ES TIPO C3D SI SI RETORNA LA ETIQUETA DE LO CONTRARIO RETORNA EL VALOR
function vT(ele) {
  if (ele.tipo == "C3D") {
    return ele.etiqueta;
  } else {
    return ele.valor;
  }
}

//GENERA EL CODIGO DE 3 DIRECCIONES PARA UNA OPERACION BINARIA
function gC3Doperacion(opI, opD, ope) {
  return {
    tipo: "C3D",
    tipoDato: inferirTipo(opI.tipoDato, opD.tipoDato, ope),
    etiqueta: rTemporal(),
    opIzq: vT(opI),
    opDer: vT(opD),
    operacion: ope,
  };
}

//ERRORES SEMANTICOS
function gError(desc, fil, col) {
  return {
    tipo: "Error Semantico",
    Error: desc,
    Fila: fil,
    Columna: col,
  };
}
//GENERA JSON DE RETORNO CON EL CODIGO DE 3 DIRECCIONES PARA RESULTADOS
function gC3D(td, et, vec) {
  return { tipo: "C3D", tipoDato: td, etiqueta: et, codigo3d: vec };
}

function generarCodigo(opI, opD, op) {
  var etiq;
  var codI = [];
  var codD = [];
  var cod3d = [];
  var cIz = [];
  var cDer = [];
  if (opI.tipo == "C3D" && opI != undefined) {
    if (opI.tipoDato == "CADENA") {
      opI.codigo3d.pop();
    }
    cIz = opI.codigo3d;
  }

  if (opD.tipo == "C3D" && opD != undefined) {
    cDer = opD.codigo3d;
  }

  if (op == "+" && opD.tipo == "C3D" && opD.tipoDato == "CADENA") {
    cod3d = cod3d.concat(cDer, cIz);
  } else {
    cod3d = cod3d.concat(cIz, cDer);
  }

  var tpD = inferirTipo(opI.tipoDato, opD.tipoDato, op);

  if (op == "+" && tpD == "CADENA") {
    if (opI.tipo == "PRIMITIVO" || opI.tipo == "VALOR") {
      etiq = rTemporal();
      codI.push(generoC3(etiq, "h", "", ""));
      codI.push(generoC3("h", "h", 1, "+"));
      codI = codI.concat(generarCodigo3Direcciones(opI));
    } else {
      etiq = opI.etiqueta;
    }

    if (opD.tipo == "PRIMITIVO" || opD.tipo == "VALOR") {
      codD = codD.concat(generarCodigo3Direcciones(opD));
    } else {
      codD.push(gLL("cc", opD.etiqueta));
    }
    cod3d = cod3d.concat(codI, codD);
    cod3d.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
  } else if (tpD == "DECIMAL" || tpD == "ENTERO") {
    etiq = rTemporal();
    cod3d.push({
      tipo: "C3D",
      etiqueta: etiq,
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    });
  }
  return gC3D(tpD, etiq, cod3d);
}
//FUNCION QUE DEVUELVE CODIGO DE 3 DIRECCIONES SOLO PARA CADENA
function generarCodigo3Direcciones(op) {
  if (op.tipoDato == "CADENA") {
    return generarCodigo3DCadena(op.valor);
  } else if (
    (op.tipoDato == "ENTERO" && op.tipo == "PRIMITIVO") ||
    (op.tipoDato == "DECIMAL" && op.tipo == "PRIMITIVO")
  ) {
    return [gLL("cNum", op.valor)];
  } else if (
    (op.tipoDato == "ENTERO" && op.tipo == "C3D") ||
    (op.tipoDato == "DECIMAL" && op.tipo == "C3D")
  ) {
    return [gLL("cNum", op.etiqueta)];
  } else if (op.tipoDato == "BOOLEAN" && op.tipo == "PRIMITIVO") {
    return [gLL("cBool", op.valor)];
  } else if (op.tipoDato == "BOOLEAN" && op.tipo == "C3D") {
    return [gLL("cBool", op.etiqueta)];
  }
}
//FUNCION QUE GENERA EL CODIGO DE 3 DIRECCIONES PARA UNA CADENA
function generarCodigo3DCadena(cad) {
  var codCad = [];
  for (var i = 0; i < cad.length; i++) {
    codCad.push(generoC3("heap[h]", cad.charCodeAt(i), "", ""));
    codCad.push(generoC3("h", "h", 1, "+"));
  }
  return codCad;
}
//FUNCION QUE GENERA JSON PARA CODIGO DE 3 DIRECCIONES DE LLAMADA PARA CADENAS
function gLL(ll, etiq) {
  return { tipo: "LLC3D", id: ll, etiqueta: etiq };
}
//FUNCION QUE GENERA JSON CON PLANTILLA PARA RETORNAR CODIGO DE 3 DIRECCIONES
function generoC3(et, opI, opD, op) {
  return {
    tipo: "C3D",
    etiqueta: et,
    opIzq: opI,
    opDer: opD,
    operacion: op,
  };
}
