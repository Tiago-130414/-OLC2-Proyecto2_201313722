/*ESTE ARCHIVO SERVIRA PARA GENERAR LAS OPERACIONES ARITMETICAS, LOGICAS Y RELACIONALES*/
/* Se realizara la debida comprobacion de tipos y se generaran el codigo de 3 direcciones */
//OPERACIONES ARITMETICAS
function operacionesAritmeticas(element) {
  var opI = leerExpresion(element.OpIzq);
  var opD = leerExpresion(element.OpDer);
  //AQUI SE COMIENZAN A EVALUAR CADA OPERACION SEGUN SU SIMBOLO
  if (element.tipo == "+") {
    var p = evaluarSuma(opI, opD);
    return p;
  } else if (
    element.tipo == "-" ||
    element.tipo == "*" ||
    element.tipo == "/" ||
    element.tipo == "%"
  ) {
    var p = evaluarAritmetica(opI, opD, element.tipo);
    return p;
  } else if (element.tipo == "**") {
    var p = evaluarPotencia(opI, opD);
    return p;
  } else if (element.tipo == "-#") {
    console.log(element);
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
    (opI.tipoDato == "ENTERO" || opI.tipoDato == "DECIMAL") &&
    (opD.tipoDato == "ENTERO" || opD.tipoDato == "DECIMAL")
  ) {
    return generarCodigo(opI, opD, op);
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
    return generarCodigo(opI, opD, "**");
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

  if (
    element.tipo == ">=" ||
    element.tipo == ">" ||
    element.tipo == "<=" ||
    element.tipo == "<"
  ) {
    var p = evaluarRelacionales(opI, opD, element.tipo);
    return p;
  } else if (element.tipo == "==" || element.tipo == "!=") {
    var p = evaluarID(opI, opD, element.tipo);
    return p;
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
    return generarCodigo(opI, opD, op);
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
    return generarCodigo(opI, opD, op);
  } else if (
    (opI.tipoDato == "CADENA" && opD.tipoDato == "NULL") ||
    (opI.tipoDato == "NULL" && opD.tipoDato == "CADENA")
  ) {
    return generarCodigo(opI, opD, op);
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
  //OBTENIENDO OPERADORES
  var opI = leerExpresion(element.OpIzq);
  var opD = leerExpresion(element.OpDer);
  //SI NO HAY ERRORES SE EVALUA LA OPERACION LOGICA
  if (opI.tipo != "Error Semantico" && opD.tipo != "Error Semantico") {
    var p = evaluarLogica(opI, opD, element.tipo);
    return p;
  } else {
    if (opI.tipo == "Error Semantico") {
      return opI;
    } else {
      return opD;
    }
  }
}
//FUNCION QUE GENERA CODIGO DE 3 DIRECCIONES DE LAS OPERACIONES LOGICAS
function evaluarLogica(opI, opD, op) {
  if (op == "!") {
    if (opD.tipoDato == "BOOLEAN") {
      return generarCodigo(opI, opD, op);
    } else {
      return gError(
        "valor incompatible con operacion " + op,
        opD.fila,
        opD.columna
      );
    }
  } else {
    if (opI.tipoDato == "BOOLEAN" && opD.tipoDato == "BOOLEAN") {
      return generarCodigo(opI, opD, op);
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
  if (ope == "!") {
    var tpD = inferirTipo("", opD.tipoDato, ope);
    return {
      tipo: "C3D",
      tipoDato: tpD,
      etiqueta: rTemporal(),
      opIzq: undefined,
      opDer: castearBoo(tpD, vT(opD)),
      operacion: ope,
    };
  }
  var tpD = inferirTipo(opI.tipoDato, opD.tipoDato, ope);
  return {
    tipo: "C3D",
    tipoDato: tpD,
    etiqueta: rTemporal(),
    opIzq: castearBoo(tpD, vT(opI)),
    opDer: castearBoo(tpD, vT(opD)),
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
//FUNCION QUE GENERA EL CODIGO DE 3 DIRECCIONES PARA TODAS LAS OPERACIONES ARITMETICAS, LOGICAS, RELACIONALES Y UNARIAS
function generarCodigo(opI, opD, op) {
  var etiq;
  var codI = [];
  var codD = [];
  var cod3d = [];
  var cIz = [];
  var cDer = [];
  var tpD;
  if (opI != undefined && opI.tipo == "C3D") {
    if (opI.tipoDato == "CADENA" && op == "+") {
      opI.codigo3d.pop();
    }
    cIz = opI.codigo3d;
  }

  if (opD != undefined && opD.tipo == "C3D") {
    cDer = opD.codigo3d;
  }

  if (op == "+" && opD.tipo == "C3D" && opD.tipoDato == "CADENA") {
    cod3d = cod3d.concat(cDer, cIz);
  } else {
    cod3d = cod3d.concat(cIz, cDer);
  }

  tpD = inferirTipo(opI.tipoDato, opD.tipoDato, op);
  //SE VERIFICAN LAS OPERACIONES PARA GENERAR SU CODIGO DE 3 DIRECCIONES
  if (op == "+") {
    if (tpD == "CADENA") {
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
        opIzq: castearBoo(tpD, vT(opI)),
        opDer: castearBoo(tpD, vT(opD)),
        operacion: op,
      });
    }
  } else if (op == "-" || op == "*" || op == "/" || op == "%") {
    etiq = rTemporal();
    cod3d.push({
      tipo: "C3D",
      etiqueta: etiq,
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    });
  } else if (op == "**") {
    etiq = rTemporal();
    cod3d.push(gLLP(etiq, vT(opI), vT(opD)));
  } else if (op == ">" || op == ">=" || op == "<" || op == "<=") {
    etiq = rTemporal();
    cod3d.push({
      tipo: "C3D",
      etiqueta: etiq,
      opIzq: vT(opI),
      opDer: vT(opD),
      operacion: op,
    });
  } else if (op == "==" || op == "!=") {
    if (opI.tipoDato == "CADENA" && opD.tipoDato == "CADENA") {
      var etiq1 = ""; //izquierdo
      var etiq2 = ""; //derecho
      //LADO IZQUIERDO
      if (opI.tipo == "VALOR") {
        etiq1 = rTemporal();
        codI = c3dCadena(opI, etiq1);
      } else {
        etiq1 = opI.etiqueta;
      }
      //LADO DERECHO
      if (opD.tipo == "VALOR") {
        etiq2 = rTemporal();
        codD = c3dCadena(opD, etiq2);
      } else {
        etiq2 = opD.etiqueta;
      }
      cod3d = cod3d.concat(codI, codD);
      etiq = rTemporal();
      cod3d.push(generoC3(etiq, etiq1, etiq2, op));
    } else if (
      (opI.tipoDato == "ENTERO" && opD.tipoDato == "ENTERO") ||
      (opI.tipoDato == "DECIMAL" && opD.tipoDato == "DECIMAL") ||
      (opI.tipoDato == "BOOLEAN" && opD.tipoDato == "BOOLEAN")
    ) {
      etiq = rTemporal();
      cod3d.push(gC3Doperacion(opI, opD, op));
    }
  } else if (op == "&&" || op == "||") {
    etiq = rTemporal();
    cod3d.push(gC3Doperacion(opI, opD, op));
  } else if (op == "!") {
    var c = gC3Doperacion("", opD, op);
    etiq = c.etiqueta;
    cod3d.push(c);
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
//FUNCION QUE GENERA JSON PARA FUNCION DE POTENCIA
function gLLP(etiq, par1, par2) {
  return {
    tipo: "LLC3DPOT",
    etiqueta: etiq,
    id: "pow",
    base: par1,
    expo: par2,
  };
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
//FUNCION QUE RETORNA EL
function castearBoo(tD, val) {
  if (tD == "CADENA") {
    if (val == "true") {
      return "true";
    } else if (val == "false") {
      return "false";
    } else {
      return val;
    }
  } else if (tD == "ENTERO" || tD == "DECIMAL") {
    if (val == "true") {
      return 1;
    } else if (val == "false") {
      return 0;
    } else {
      return val;
    }
  } else if (tD == "BOOLEAN") {
    if (val == "true") {
      return 1;
    } else if (val == "false") {
      return 0;
    } else {
      return val;
    }
  }
}
//FUNCION QUE RETORNA CODIGO DE 3 DIRECCIONES DE CADENA
function c3dCadena(op, etiq) {
  var cod = [];
  cod.push(generoC3(etiq, "h", "", ""));
  cod.push(generoC3("h", "h", 1, "+"));
  cod = cod.concat(generarCodigo3Direcciones(op));
  cod.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
  return cod;
}
