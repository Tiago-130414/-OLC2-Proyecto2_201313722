//VARIABLES UTILIZADAS PARA LA GENERACION DE CODIGO INTERMEDIO
let ambitos = [];
let nombAmbitos = [];
let logAmbitos = [];
let erroresCI = [];
let temporal = 0;
let etiqueta = 0;
var posAmb = 0;
//////////////////////////////////////////////////////////////

//FUNCION PRINCIPAL LLAMADA DESDE PAGINA (AYUDA A GENERAR CODIGO INTERMEDIO Y LOS ERRORES EN DICHO CODIGO)
function generarIntermedio(traduccion) {
  TraduccionTP.setValue("");
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
  limpiar();
  //console.log(ambitos);
  console.log(logAmbitos);
  //console.log(generarCodigo3DCadena("prueba"));
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCION SEPARADORA DE INSTRUCCIONES /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ESTE METODO ES PARA RECORRER EL JSON GENERADO DESDE TRADUCCION.JISON
function generate(json) {
  for (var element of json) {
    if (element.tipo == "DECLARACION") {
      //ESTA ES LA VARIABLE
      declaracion(element.contenido, element.modificador);
    } else if (element.tipo == "LISTA_ASIGNACION") {
      asignacion(element.contenido);
    } else if (element.tipo == "IMPRIMIR") {
      //ESTE ES EL CONSOLE
      generarImprimir(element.contenido);
    }
  }
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCION PARA IMPRIMIR ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarImprimir(element) {
  var cod3 = [];
  var print = [];
  var exp;
  var band = false;
  //console.log(element);
  for (var ele of element) {
    //OBTENIENDO VALOR DE LA EXPRESION
    exp = leerExpresion(ele);
    if (exp.tipo != "Error Semantico") {
      if (exp.codigo3d != undefined) {
        if (exp.tipoDato == "BOOLEAN") {
          //QUEMANDO VALORES VERDADEROS O FALSOS DEPENDIENDO DE CONDICION
          cod3 = cod3.concat(exp.codigo3d);
          var rBoo = generarBooleano(exp);
          cod3 = cod3.concat(rBoo.codigo3d);
          cod3.push(gLL("impCad", rBoo.etiqueta));
        } else {
          var cod = realizarPrint(exp);
          cod3 = cod3.concat(cod.cod3);
          print = print.concat(cod.pr);
        }
      } else {
        //SI EL VALOR OBTENIDO DE LA EXPRESION ES PRIMITIVO
        var vrT = verificarExpVU(exp); //VERIFICA LOS TIPOS SI ES PRIMITIVO Y SI SI RETORNA CODIGO DE 3 DIRECCIONES
        //SI ES CODIGO DE 3 DIRECCIONES
        if (vrT.tipo == "C3D") {
          var cod = realizarPrint(vrT);
          cod3 = cod3.concat(cod.cod3);
          print = print.concat(cod.pr);
          console.log(print);
        } else if (
          (vrT.tipo == "PRIMITIVO" && vrT.tipoDato == "ENTERO") ||
          (vrT.tipo == "PRIMITIVO" && vrT.tipoDato == "DECIMAL")
        ) {
          print.push({ tipo: "PRINT", tipoDato: vrT.tipoDato, val: ele.valor });
        } else if (vrT.tipo == "C3DR") {
        } else if (vrT.tipo == "Error Semantico") {
          //SI LA VERIFICACION DE TIPOS RETORNA UN ERROR
          band = true;
          erroresCI.push(vrT);
        }
      }
    } else {
      //SI LA EXPRESION LEIDA ES UN ERROR
      erroresCI.push(exp);
    }
  }

  if (band == false) {
    //SI LA VERIFICACION DE TIPOS NO RETORNO NINGUN ERROR
    cod3 = cod3.concat(print);
    imprimirC3(cod3);
  }
}

function realizarPrint(ele) {
  //console.log(ele);
  var cod = [];
  var print = [];
  cod = cod.concat(ele.codigo3d);
  if (ele.tipoDato == "CADENA" || ele.tipoDato == "BOOLEAN") {
    print.push(gLL("impCad", ele.etiqueta));
  } else if (ele.tipoDato == "NUMERO") {
    print.push({ tipo: "PRINT", tipoDato: "NUMERO", val: ele.etiqueta });
  } else if (ele.tipoDato == "ENTERO" || ele.tipoDato == "DECIMAL") {
    print.push({
      tipo: "PRINT",
      tipoDato: ele.tipoDato,
      val: ele.etiqueta,
    });
  }
  return { cod3: cod, pr: print };
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCION PARA C3D DE IDS /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generarC3DIdentificadores(exp, id) {
  var c3d = [];
  var variable = buscarVModificar(exp, id);
  if (variable.tipo != "Error Semantico") {
    var t1 = rTemporal();
    var t2 = rTemporal();
    c3d.push(generoC3(t1, "s", variable.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
    c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
    //console.log(c3d);
    return {
      tipo: "C3D",
      tipoDato: variable.tipoDato,
      etiqueta: t2,
      codigo3d: c3d,
    };
  } else {
    return variable;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////FUNCION PARA C3D DE BOOLEANOS /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//TOMA EL VALOR DEL BOOLEANO RETORNADO Y LO CONVIERTE EN UN JSON VALIDO PARA LAS DEMAS EXPRESIONES
function generarBooleano(exp) {
  var cod3 = [];
  var t = rTemporal();
  var iniC = rTemporal();
  var etiqS = rLabel();
  cod3.push(generarEtiquetaJSON(exp.etiqueta[0].lbV));
  cod3.push(generoC3(t, "", 1, ""));
  cod3.push(generarGoto(etiqS));
  cod3.push(generarEtiquetaJSON(exp.etiqueta[0].lbF));
  cod3.push(generoC3(t, "", 0, ""));
  cod3.push(generarEtiquetaJSON(etiqS));
  cod3.push(generoC3(iniC, "h", "", ""));
  cod3.push(generoC3("h", "h", 1, "+"));
  cod3.push(gLL("cBool", t));
  cod3.push(generoC3("heap[(int)" + iniC + "]", "h", iniC, "-"));
  return {
    tipo: "C3D",
    tipoDato: exp.tipoDato,
    etiqueta: iniC,
    codigo3d: cod3,
  };
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////// FUNCIONES QUE GENERAN CODIGO DE 3 DIRECCIONES DE EXPRESIONES /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
  } else if (expresion.tipo == "++" || expresion.tipo == "--") {
    return operacionesIncremento(expresion);
  } else if (expresion.tipo == "PRIMITIVO") {
    //SI ES BOOLEANO PASAR A MINUSCULA TODAS SUS LETRAS
    if (expresion.tipoDato == "BOOLEAN") {
      expresion.valor = expresion.valor.toLowerCase();
      return generarCCBoo(expresion);
    }
    return expresion;
  } else if (expresion.tipo == "VALOR") {
    if (expresion.tipoDato == "IDENTIFICADOR") {
      var valId = buscarVModificar(expresion, expresion.identificador);
      return validarIdentificador(valId);
    } else if (expresion.tipoDato == "CADENA") {
      var etiq1 = rTemporal();
      var codC = c3dCadena(expresion, etiq1);
      return {
        tipo: "C3D",
        tipoDato: expresion.tipoDato,
        etiqueta: etiq1,
        fila: expresion.fila,
        columna: expresion.columna,
        codigo3d: codC,
      };
    }
    return expresion;
  } else if (Array.isArray(expresion)) {
    //VERIFICANDO TAMAñO PARA SABER SI ES ID
    if (expresion.length == 1) {
      //CUNDO ES UN UNICO ID
      if (expresion[0].tipoDato == "IDENTIFICADOR") {
        //console.log(expresion[0]);
        return leerExpresion(expresion[0]);
      }
    }
  }
}

function validarIdentificador(valId) {
  if (valId.tipo == "VARIABLE") {
    return {
      tipo: "VARIABLE",
      tipoDato: valId.tipoDato,
      etiqueta: undefined,
      identificador: valId.identificador,
      pos: valId.pos,
      fila: valId.fila,
      columna: valId.columna,
    };
  } else {
    return valId;
  }
}

//GENERAR CORTO CIRCUITO PARA VALORES PRIMITIVOS BOOLEANOS
function generarCCBoo(exp) {
  var cod = [];
  var val = castearBoo(exp.valor);
  var etV = rLabel();
  var etF = rLabel();
  var etiq = [];
  cod.push(generarIfB(val, etV));
  cod.push(generarGoto(etF));
  etiq.push({ lbV: etV, lbF: etF });
  return {
    tipo: "C3D",
    tipoDato: exp.tipoDato,
    etiqueta: etiq,
    codigo3d: cod,
  };
  //generarEtiquetaJSON
}
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

  if (opI != undefined && opI.tipo == "C3D" && opI.tipoDato != "BOOLEAN") {
    cIz = opI.codigo3d;
  }
  if (opD != undefined && opD.tipo == "C3D" && opD.tipoDato != "BOOLEAN") {
    cDer = opD.codigo3d;
  }

  cod3d = cod3d.concat(cIz, cDer);
  tpD = inferirTipo(opI.tipoDato, opD.tipoDato, op);
  //SE VERIFICAN LAS OPERACIONES PARA GENERAR SU CODIGO DE 3 DIRECCIONES
  if (op == "+") {
    if (tpD == "CADENA") {
      if (opI.tipo == "PRIMITIVO") {
        etiqI = rTemporal();
        codI.push(generoC3(etiqI, "h", "", ""));
        codI.push(generoC3("h", "h", 1, "+"));
        codI = codI.concat(generarCodigo3Direcciones(opI));
        codI.push(generoC3("heap[(int)" + etiqI + "]", "h", etiqI, "-"));
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        opI.etiqueta = t2;
        etiqI = t2;
      } else {
        etiqI = opI.etiqueta;
      }

      if (opD.tipo == "PRIMITIVO") {
        etiqD = rTemporal();
        codD.push(generoC3(etiqD, "h", "", ""));
        codD.push(generoC3("h", "h", 1, "+"));
        var pr = generarCodigo3Direcciones(opD);
        codD = codD.concat(pr);
        codD.push(generoC3("heap[(int)" + etiqD + "]", "h", etiqD, "-"));
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        opD.etiqueta = t2;
        etiqD = t2;
      } else {
        etiqD = opD.etiqueta;
      }

      cod3d = cod3d.concat(codI, codD);
      etiq = rTemporal();
      cod3d.push(generoC3(etiq, "h", "", ""));
      cod3d.push(generoC3("h", "h", 1, "+"));
      cod3d = cod3d.concat(generarCodigo3Direcciones(opI));
      cod3d = cod3d.concat(generarCodigo3Direcciones(opD));
      cod3d.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
    } else if (tpD == "DECIMAL" || tpD == "ENTERO") {
      var etiqI, etiqD;
      if (opI.tipo == "PRIMITIVO") {
        etiqI = opI.valor;
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiqI = t2;
      } else {
        etiqI = opI.etiqueta;
      }

      if (opD.tipo == "PRIMITIVO") {
        etiqD = opD.valor;
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiqD = t2;
      } else {
        etiqD = opD.etiqueta;
      }
      //JUNTANDO CODIGO DE LADO IZQ Y DER
      cod3d = cod3d.concat(codI, codD);
      etiq = rTemporal();

      cod3d.push({
        tipo: "C3D",
        etiqueta: etiq,
        opIzq: castearBoo(etiqI),
        opDer: castearBoo(etiqD),
        operacion: op,
      });
    }
  } else if (op == "-" || op == "*" || op == "/" || op == "%") {
    var etiqI, etiqD;
    if (opI.tipo == "PRIMITIVO") {
      etiqI = opI.valor;
    } else if (opI.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqI = t2;
    } else {
      etiqI = opI.etiqueta;
    }

    if (opD.tipo == "PRIMITIVO") {
      etiqD = opD.valor;
    } else if (opD.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqD = t2;
    } else {
      etiqD = opD.etiqueta;
    }
    //JUNTANDO CODIGO DE LADO IZQ Y DER
    cod3d = cod3d.concat(codI, codD);

    etiq = rTemporal();
    cod3d.push({
      tipo: "C3D",
      etiqueta: etiq,
      opIzq: etiqI,
      opDer: etiqD,
      operacion: op,
    });
  } else if (op == "**") {
    var etiqI, etiqD;
    if (opI.tipo == "PRIMITIVO") {
      etiqI = opI.valor;
    } else if (opI.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqI = t2;
    } else {
      etiqI = opI.etiqueta;
    }

    if (opD.tipo == "PRIMITIVO") {
      etiqD = opD.valor;
    } else if (opD.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqD = t2;
    } else {
      etiqD = opD.etiqueta;
    }
    //JUNTANDO CODIGO DE LADO IZQ Y DER
    cod3d = cod3d.concat(codI, codD);

    etiq = rTemporal();
    cod3d.push(gLLP(etiq, etiqI, etiqD));
  } else if (op == ">" || op == ">=" || op == "<" || op == "<=") {
    var etiqI, etiqD;

    /////VERIFICANDO VALORES DL LADO IZQUIERDO DE LA OPERACION
    if (opI.tipo == "PRIMITIVO") {
      etiqI = opI.valor;
    } else if (opI.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqI = t2;
    } else {
      etiqI = opI.etiqueta;
    }
    /////VERIFICANDO VALORES DL LADO DERECHO DE LA OPERACION
    if (opD.tipo == "PRIMITIVO") {
      etiqD = opD.valor;
    } else if (opD.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqD = t2;
    } else {
      etiqD = opD.etiqueta;
    }
    //JUNTANDO CODIGO DE LADO IZQ Y DER
    cod3d = cod3d.concat(codI, codD);

    //GENERANDO CODIGO DE CORTO CIRCUITO
    var lblV = rLabel();
    var vV = [];
    vV.push(lblV);
    var lblF = rLabel();
    var vF = [];
    vF.push(lblF);
    cod3d.push(generarIf(etiqI, op, etiqD, lblV));
    cod3d.push(generarGoto(lblF));
    etiq = [{ lbV: vV, lbF: vF }];
  } else if (op == "==" || op == "!=") {
    if (opI.tipoDato == "CADENA" && opD.tipoDato == "CADENA") {
      var etiq1 = ""; //izquierdo
      var etiq2 = ""; //derecho
      //LADO IZQUIERDO

      if (opI.tipo == "VALOR") {
        etiq1 = rTemporal();
        codI = c3dCadena(opI, etiq1);
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq1 = t2;
      } else {
        etiq1 = opI.etiqueta;
      }
      //LADO DERECHO
      console.log(opD);
      if (opD.tipo == "VALOR") {
        etiq2 = rTemporal();
        codD = c3dCadena(opD, etiq2);
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq2 = t2;
      } else {
        etiq2 = opD.etiqueta;
      }
      //JUNTANDO CODIGO DE LADO IZQ Y DER
      cod3d = cod3d.concat(codI, codD);
      //GENERANDO CODIGO DE CORTO CIRCUITO
      var lblV = rLabel();
      var vV = [];
      vV.push(lblV);
      var lblF = rLabel();
      var vF = [];
      vF.push(lblF);
      cod3d.push(generarIf(etiq1, op, etiq2, lblV));
      cod3d.push(generarGoto(lblF));
      etiq = [{ lbV: vV, lbF: vF }];
    } else if (
      (opI.tipoDato == "ENTERO" && opD.tipoDato == "ENTERO") ||
      (opI.tipoDato == "DECIMAL" && opD.tipoDato == "DECIMAL") ||
      (opI.tipoDato == "BOOLEAN" && opD.tipoDato == "BOOLEAN")
    ) {
      /*
      etiq = rTemporal();
      cod3d.push(gC3Doperacion(opI, opD, op));*/

      var etiq1 = ""; //izquierdo
      var etiq2 = ""; //derecho
      //LADO IZQUIERDO
      if (opI.tipo == "PRIMITIVO") {
        etiq1 = opI.valor;
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq1 = t2;
      } else {
        codI = codI.concat(opI.codigo3d);
        etiq1 = opI.etiqueta;
      }
      //LADO DERECHO
      if (opD.tipo == "PRIMITIVO") {
        etiq2 = opD.valor;
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq2 = t2;
      } else {
        codD = codD.concat(opD.codigo3d);
        etiq2 = opD.etiqueta;
      }
      //JUNTANDO CODIGO DE LADO IZQ Y DER
      cod3d = cod3d.concat(codI, codD);
      //GENERANDO CODIGO DE CORTO CIRCUITO
      var lblV = rLabel();
      var vV = [];
      vV.push(lblV);
      var lblF = rLabel();
      var vF = [];
      vF.push(lblF);
      cod3d.push(generarIf(etiq1, op, etiq2, lblV));
      cod3d.push(generarGoto(lblF));
      etiq = [{ lbV: vV, lbF: vF }];
    }
  } else if (op == "&&" || op == "||") {
    var etiqI, etiqD;
    var etiqVI = [];
    var etiqFI = [];
    var etiqVD = [];
    var etiqFD = [];
    var vTF = [];

    ////////////////////////////////////////////////////  CORTO CIRCUITO
    if (op == "&&") {
      //CONCATENANDO EL CODIGO DE 3 DIRECCIONES QUE VIENE
      //cod3d = cod3d.concat(opI.codigo3d);
      if (opI.tipo == "VARIABLE") {
        ////////LADO IZQUIERDO
        ///////TEMPORALES PARA OBTENER VALOR DE LA VARIABLE
        var t1 = rTemporal();
        var t2 = rTemporal();
        ////////LABELS PARA GENERAR COMPROBACION DE LA VARIABLE
        var etiV = rLabel();
        var etiF = rLabel();
        cod3d.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        cod3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor

        cod3d.push(generarIfB(t2, etiV));
        cod3d.push(generarGoto(etiF));
        vTF.push(etiF);
        cod3d.push(generarEtiquetaJSON(etiV));
      } else {
        cod3d = cod3d.concat(opI.codigo3d);

        //SI LA ETIQUETA ES UN ARREGLO SIGNIFICA QUE VINO UNA OPERACION RELACIONAL
        //LADO IZQUIERDO
        if (Array.isArray(opI.etiqueta)) {
          //SI VIENE UN RELACIONAL
          etiqVI = opI.etiqueta[0].lbV;
          vTF = opI.etiqueta[0].lbF;
          cod3d.push(generarEtiquetaJSON(etiqVI));
        }
      }

      //LADO DERECHO
      if (opD.tipo == "VARIABLE") {
        ////////LADO IZQUIERDO
        ///////TEMPORALES PARA OBTENER VALOR DE LA VARIABLE
        var t1 = rTemporal();
        var t2 = rTemporal();
        ////////LABELS PARA GENERAR COMPROBACION DE LA VARIABLE
        var etiV = rLabel();
        var etiF = rLabel();
        cod3d.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        cod3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor

        cod3d.push(generarIfB(t2, etiV));
        cod3d.push(generarGoto(etiF));

        //cod3d.push(generarEtiquetaJSON(etiV));
        etiqVD = etiV;
        vTF.push(etiF);
      } else {
        cod3d = cod3d.concat(opD.codigo3d);
        if (Array.isArray(opD.etiqueta)) {
          //SI VIENE UN RELACIONAL
          etiqVD = opD.etiqueta[0].lbV;
          vTF = vTF.concat(opD.etiqueta[0].lbF);
        }
      }

      etiq = [{ lbV: etiqVD, lbF: vTF }];
    } else {
      /////////////////////////////////////////////////////////////////////OR
      //GENERANDO ETIQUETA DE SALIDA
      //JUNTANDO CODIGO DE 3 DIRECCIONES QUE VIENE DE LADO IZQUIERDO
      cod3d = cod3d.concat(opI.codigo3d);

      //GENERANDO ETIQUETAS DE LADO DERECHO
      if (Array.isArray(opI.etiqueta)) {
        //SI VIENE UN RELACIONAL
        etiqFI = opI.etiqueta[0].lbF;
        vTF = opI.etiqueta[0].lbV;
        cod3d.push(generarEtiquetaJSON(etiqFI));
      }

      //LADO DERECHO
      cod3d = cod3d.concat(opD.codigo3d);
      if (Array.isArray(opD.etiqueta)) {
        //SI VIENE UN RELACIONAL
        etiqFD = opD.etiqueta[0].lbF;
        vTF = vTF.concat(opD.etiqueta[0].lbV);
      }
      etiq = [{ lbV: vTF, lbF: etiqFD }];
      console.log(etiq);
    }
  } else if (op == "!") {
    //FIXME: FALTA LAS VARIBLES
    //CONCATENANDO EL CODIGO DE 3 DIRECCIONES QUE TRAE EL LADO DERECHO
    cod3d = cod3d.concat(opD.codigo3d);
    etiqVD = opD.etiqueta[0].lbF;
    etiqFD = opD.etiqueta[0].lbV;
    etiq = [{ lbV: etiqVD, lbF: etiqFD }];
  }
  return gC3D(tpD, etiq, cod3d);
}
//FUNCION QUE DEVUELVE CODIGO DE 3 DIRECCIONES SOLO PARA CADENA
function generarCodigo3Direcciones(op) {
  if (op.tipoDato == "CADENA" && op.tipo == "VALOR") {
    return generarCodigo3DCadena(op.valor);
  } else if (op.tipoDato == "CADENA" && op.tipo == "C3D") {
    return [gLL("cC", op.etiqueta)];
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
    var c = castearBoo("CADENA", op.valor);
    return [gLL("cBool", c)];
  } else if (op.tipoDato == "BOOLEAN" && op.tipo == "C3D") {
    return [gLL("cBool", op.etiqueta)];
  } else if (op.tipo == "VARIABLE") {
    if (op.tipoDato == "ENTERO" || op.tipoDato == "DECIMAL") {
      return [gLL("cNum", op.etiqueta)];
    } else if (op.tipoDato == "CADENA") {
      return [gLL("cC", op.etiqueta)];
    } else if (op.tipoDato == "BOOLEAN") {
      return [gLL("cBool", op.etiqueta)];
    }
  }
}
//FUNCION QUE GENERA EL CODIGO DE 3 DIRECCIONES PARA UNA CADENA
function generarCodigo3DCadena(cad) {
  var codCad = [];
  var ascii = "";
  for (var i = 0; i < cad.length; i++) {
    ascii = cad.charCodeAt(i);
    //SI ES DIAGONAL PARA VERIFICAR EL CARACTER ESPECIAL
    if (ascii == "92") {
      //SE OBTIENE EL ASCII SIGUENTE PARA SABER SI ES UN CARACTER ESPECIAL Y PODER UTILIZARLO
      var asciiS = cad.charCodeAt(i + 1);
      if (asciiS == 110) {
        //SALTO DE LINEA
        codCad.push(generoC3("heap[h]", 10, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
        i++;
      } else if (asciiS == 116) {
        //TABULACION
        codCad.push(generoC3("heap[h]", 9, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
        i++;
      } else if (asciiS == 114) {
        //RETORNO DE CARRO
        codCad.push(generoC3("heap[h]", 13, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
        i++;
      } else if (asciiS == 34) {
        //COMILLA DOBLE
        codCad.push(generoC3("heap[h]", 34, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
        i++;
      } else if (asciiS == 39) {
        //COMILLA SIMPLE
        codCad.push(generoC3("heap[h]", 39, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
        i++;
      } else if (asciiS == 92) {
        //COMILLA SIMPLE
        codCad.push(generoC3("heap[h]", 92, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
        i++;
      } else {
        codCad.push(generoC3("heap[h]", ascii, "", ""));
        codCad.push(generoC3("h", "h", 1, "+"));
      }
    } else {
      codCad.push(generoC3("heap[h]", ascii, "", ""));
      codCad.push(generoC3("h", "h", 1, "+"));
    }
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
function castearBoo(val) {
  if (val == "true") {
    return 1;
  } else if (val == "false") {
    return 0;
  } else {
    return val;
  }
}
//TODO: ponerle atencion para generar cadena
//FUNCION QUE RETORNA CODIGO DE 3 DIRECCIONES DE CADENA
function c3dCadena(op, etiq) {
  var cod = [];
  cod.push(generoC3(etiq, "h", "", ""));
  cod.push(generoC3("h", "h", 1, "+"));
  cod = cod.concat(generarCodigo3Direcciones(op));
  cod.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
  return cod;
}
//FUNCION QUE GENERA LOS INCREMENTOS
function operacionesIncremento(exp) {
  console.log(exp);
  var c3d = [];
  var id;
  var variable;
  var etiq;
  var tpD;
  if (exp.tipo == "++") {
    if (exp.OpIzq != undefined) {
      //SUMA DESPUES A++
      if (Array.isArray(exp.OpIzq)) {
        //BUSCANDO EL ID
        id = leerExpresion(exp.OpIzq[0]);
        //SI EL ID ENCONTRADO ES VALIDO
        if (id.tipo != "Error Semantico") {
          variable = buscarVModificar(exp, id.identificador);
          //SE VERIFICA QUE EL INCREMENTO SEA REALIZADO SOBRE UNA VARIABLE
          if (variable.modificador == "let") {
            if (
              variable.tipoDato == "ENTERO" ||
              variable.tipoDato == "DECIMAL"
            ) {
              var temp = rTemporal();
              var t1 = rTemporal();
              var t2 = rTemporal();
              //MOVIMIENTO DE AMBITOS PARA OBTENER VARIABLE
              c3d.push(generoC3("s", "", variable.inicioAmb, ""));
              c3d.push(generoC3(temp, "s", variable.pos, "+"));
              c3d.push(generoC3("s", "", rInicioAmb(), ""));
              //OBTENER EL VALOR DEL STACK
              c3d.push(generoC3(t1, "", "stack[(int)" + temp + "]", "")); // se obtiene el valor
              //GENERAR EL INCREMENTO DE VALOR
              c3d.push(generoC3(t2, t1, 1, "+")); // se obtiene el valor
              //INSERCION EN EL STACK DEL NUEVO VALOR
              c3d.push(generoC3("stack[(int)" + temp + "]", "", t2, ""));
              etiq = t1;
              tpD = variable.tipoDato;
            } else {
              return gError(
                "El tipo de dato -> " +
                  variable.tipoDato +
                  ", no aplica a una operacion de tipo NUMBER",
                exp.fila,
                exp.columna
              );
            }
          } else {
            //SI LA VARIABLE BUSCADA ES UNA CONSTANTE
            return gError(
              "No es posible reasignar valor a una constante",
              exp.fila,
              exp.columna
            );
          }
        } else {
          //SI NO ERA UN ID VALIDO
          return id;
        }
      } else {
        //SI EL OPERADOR NO ES
        return gError(
          "El incremento unicamente se puede realizar sobre una variable",
          exp.fila,
          exp.columna
        );
      }
    } else {
      //SUMA ANTES ++A
      if (exp.OpDer != undefined) {
        //SUMA DESPUES A++
        if (Array.isArray(exp.OpDer)) {
          //BUSCANDO EL ID
          id = leerExpresion(exp.OpDer[0]);
          //SI EL ID ENCONTRADO ES VALIDO
          if (id.tipo != "Error Semantico") {
            variable = buscarVModificar(exp, id.identificador);
            //SE VERIFICA QUE EL INCREMENTO SEA REALIZADO SOBRE UNA VARIABLE
            if (variable.modificador == "let") {
              if (
                variable.tipoDato == "ENTERO" ||
                variable.tipoDato == "DECIMAL"
              ) {
                var temp = rTemporal();
                var t1 = rTemporal();
                var t2 = rTemporal();
                //MOVIMIENTO DE AMBITOS PARA OBTENER VARIABLE
                c3d.push(generoC3("s", "", variable.inicioAmb, ""));
                c3d.push(generoC3(temp, "s", variable.pos, "+"));
                c3d.push(generoC3("s", "", rInicioAmb(), ""));
                //OBTENER EL VALOR DEL STACK
                c3d.push(generoC3(t1, "", "stack[(int)" + temp + "]", "")); // se obtiene el valor
                //GENERAR EL INCREMENTO DE VALOR
                c3d.push(generoC3(t2, t1, 1, "+")); // se obtiene el valor
                //INSERCION EN EL STACK DEL NUEVO VALOR
                c3d.push(generoC3("stack[(int)" + temp + "]", "", t2, ""));
                etiq = t2;
                tpD = variable.tipoDato;
              } else {
                return gError(
                  "El tipo de dato -> " +
                    variable.tipoDato +
                    ", no aplica a una operacion de tipo NUMBER",
                  exp.fila,
                  exp.columna
                );
              }
            } else {
              //SI LA VARIABLE BUSCADA ES UNA CONSTANTE
              return gError(
                "No es posible reasignar valor a una constante",
                exp.fila,
                exp.columna
              );
            }
          } else {
            //SI NO ERA UN ID VALIDO
            return id;
          }
        } else {
          //SI EL OPERADOR NO ES
          return gError(
            "El incremento unicamente se puede realizar sobre una variable",
            exp.fila,
            exp.columna
          );
        }
      }
    }
  } else if (exp.tipo == "--") {
    if (exp.OpIzq != undefined) {
      //RESTA DESPUES A++
      if (Array.isArray(exp.OpIzq)) {
        //BUSCANDO EL ID
        id = leerExpresion(exp.OpIzq[0]);
        //SI EL ID ENCONTRADO ES VALIDO
        if (id.tipo != "Error Semantico") {
          variable = buscarVModificar(exp, id.identificador);
          //SE VERIFICA QUE EL INCREMENTO SEA REALIZADO SOBRE UNA VARIABLE
          if (variable.modificador == "let") {
            if (
              variable.tipoDato == "ENTERO" ||
              variable.tipoDato == "DECIMAL"
            ) {
              var temp = rTemporal();
              var t1 = rTemporal();
              var t2 = rTemporal();
              //MOVIMIENTO DE AMBITOS PARA OBTENER VARIABLE
              c3d.push(generoC3("s", "", variable.inicioAmb, ""));
              c3d.push(generoC3(temp, "s", variable.pos, "+"));
              c3d.push(generoC3("s", "", rInicioAmb(), ""));
              //OBTENER EL VALOR DEL STACK
              c3d.push(generoC3(t1, "", "stack[(int)" + temp + "]", "")); // se obtiene el valor
              //GENERAR EL INCREMENTO DE VALOR
              c3d.push(generoC3(t2, t1, 1, "-")); // se obtiene el valor
              //INSERCION EN EL STACK DEL NUEVO VALOR
              c3d.push(generoC3("stack[(int)" + temp + "]", "", t2, ""));
              etiq = t1;
              tpD = variable.tipoDato;
            } else {
              return gError(
                "El tipo de dato -> " +
                  variable.tipoDato +
                  ", no aplica a una operacion de tipo NUMBER",
                exp.fila,
                exp.columna
              );
            }
          } else {
            //SI LA VARIABLE BUSCADA ES UNA CONSTANTE
            return gError(
              "No es posible reasignar valor a una constante",
              exp.fila,
              exp.columna
            );
          }
        } else {
          //SI NO ERA UN ID VALIDO
          return id;
        }
      } else {
        //SI EL OPERADOR NO ES
        return gError(
          "El incremento unicamente se puede realizar sobre una variable",
          exp.fila,
          exp.columna
        );
      }
    } else {
      //RESTA ANTES ++A
      if (exp.OpDer != undefined) {
        //SUMA DESPUES A++
        if (Array.isArray(exp.OpDer)) {
          //BUSCANDO EL ID
          id = leerExpresion(exp.OpDer[0]);
          //SI EL ID ENCONTRADO ES VALIDO
          if (id.tipo != "Error Semantico") {
            variable = buscarVModificar(exp, id.identificador);
            //SE VERIFICA QUE EL INCREMENTO SEA REALIZADO SOBRE UNA VARIABLE
            if (variable.modificador == "let") {
              if (
                variable.tipoDato == "ENTERO" ||
                variable.tipoDato == "DECIMAL"
              ) {
                var temp = rTemporal();
                var t1 = rTemporal();
                var t2 = rTemporal();
                //MOVIMIENTO DE AMBITOS PARA OBTENER VARIABLE
                c3d.push(generoC3("s", "", variable.inicioAmb, ""));
                c3d.push(generoC3(temp, "s", variable.pos, "+"));
                c3d.push(generoC3("s", "", rInicioAmb(), ""));
                //OBTENER EL VALOR DEL STACK
                c3d.push(generoC3(t1, "", "stack[(int)" + temp + "]", "")); // se obtiene el valor
                //GENERAR EL INCREMENTO DE VALOR
                c3d.push(generoC3(t2, t1, 1, "-")); // se obtiene el valor
                //INSERCION EN EL STACK DEL NUEVO VALOR
                c3d.push(generoC3("stack[(int)" + temp + "]", "", t2, ""));
                etiq = t2;
                tpD = variable.tipoDato;
              } else {
                return gError(
                  "El tipo de dato -> " +
                    variable.tipoDato +
                    ", no aplica a una operacion de tipo NUMBER",
                  exp.fila,
                  exp.columna
                );
              }
            } else {
              //SI LA VARIABLE BUSCADA ES UNA CONSTANTE
              return gError(
                "No es posible reasignar valor a una constante",
                exp.fila,
                exp.columna
              );
            }
          } else {
            //SI NO ERA UN ID VALIDO
            return id;
          }
        } else {
          //SI EL OPERADOR NO ES
          return gError(
            "El incremento unicamente se puede realizar sobre una variable",
            exp.fila,
            exp.columna
          );
        }
      }
    }
  }
  return gC3D(tpD, etiq, c3d);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////FUNCIONES PARA DECLARACION DE VARIABLES ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//VERIFICAR DECLARACION TYPES, VARIABLES, VECTORES
function declaracion(elemento, mod) {
  for (var ele of elemento) {
    if (ele.tipo == "VARIABLE") {
      declaracionVariables(ele, mod);
    }
  }
}
//METODO QUE DECLARA LAS VARIABLES
function declaracionVariables(elemento, mod) {
  var cod3 = [];
  if (!buscarVariable(elemento.identificador)) {
    //CUANDO ES UNA CONSTANTE
    if (mod.toLowerCase() == "const") {
      if (elemento.valor != undefined) {
        var exp = leerExpresion(elemento.valor[0]);
        if (exp.tipo != "Error Semantico") {
          //SI ES UNA EXPRESION VALIDA SE VERIFICAN LOS TIPOS
          if (
            elemento.tipoDDV.toLowerCase() ==
            cambiarTNumber(exp.tipoDato).toLowerCase()
          ) {
            //tipoDDV = NUMBER STRING BOOLEAN
            insertarAmbito({
              tipo: "VARIABLE",
              inicioAmb: rInicioAmb(),
              modificador: mod,
              identificador: elemento.identificador,
              tipoDato: exp.tipoDato,
              tipoDDV: elemento.tipoDDV,
              pos: posAmb++,
              fila: elemento.fila,
              columna: elemento.columna,
            });
            var a = rCantidad();
            a.CantidadE = a.DatosAmbito.length;

            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////// CODIGO QUE VERIFICA SI ES PRIMITIVO O C3D Y ASIGNA VALOR CORRECTO /////////////////////////////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //SE VERIFICA EL TIPO DE LA EXPRESION RETORNADA ANTES DE ASIGNARSE AL STACK YA QUE PUEDE SER UN VALOR PRIMITIVO O CADENA
            var asigT; // guarda etiqueta o valor
            if (exp.codigo3d != undefined) {
              if (exp.tipoDato == "BOOLEAN") {
                var t = rTemporal();
                var etiqS = rLabel();
                cod3 = cod3.concat(exp.codigo3d);
                cod3.push(generarEtiquetaJSON(exp.etiqueta[0].lbV));
                cod3.push(generoC3(t, "", 1, ""));
                cod3.push(generarGoto(etiqS));
                cod3.push(generarEtiquetaJSON(exp.etiqueta[0].lbF));
                cod3.push(generoC3(t, "", 0, ""));
                cod3.push(generarEtiquetaJSON(etiqS));
                asigT = t;
              } else {
                cod3 = cod3.concat(exp.codigo3d);
                asigT = exp.etiqueta;
              }
            } else {
              var vrT = verificarExpVU(exp); //VERIFICA LOS TIPOS SI ES PRIMITIVO O CODIGO DE 3 DIRECCIONES
              //Y RETORNA UN JSON PERSONALIZADO UNICAMENTE CON LOS VALORES NECESARIOS PARA ASIGNACION
              if (vrT.tipo == "C3D") {
                cod3 = cod3.concat(vrT.codigo3d);
                asigT = vrT.etiqueta;
              } else if (vrT.tipo == "PRIMITIVO") {
                asigT = castearBoo(vrT.valor);
              }
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var tmp1 = rTemporal();
            var t = rTActual();
            cod3.push(generoC3(tmp1, "s", posAmb - 1, "+"));
            cod3.push(generoC3("stack[(int)" + t + "]", "", asigT, ""));
            imprimirC3(cod3);
          } else {
            //CUANDO LOS TIPOS NO COINCIDEN
            erroresCI.push({
              tipo: "Error Semantico",
              Error:
                "El tipo de dato del valor asignado a la constante no coincide con el tipo de constante -> " +
                elemento.identificador,
              Fila: elemento.fila,
              Columna: elemento.columna,
            });
          }
        } else {
          //SI LA EXPRESION ES INVALIDA
          erroresCI.push(exp);
        }
      } else {
        //SI LA CONSTANTE NO ESTA INICIALIZADA
        erroresCI.push({
          tipo: "Error Semantico",
          Error:
            "Es necesario inicializar una constante -> " +
            elemento.identificador,
          Fila: elemento.fila,
          Columna: elemento.columna,
        });
      }
    } else {
      //CUANDO ES UNA VARIABLE
      //SI TIENE VALOR SE EVALUA EXPRESION
      if (elemento.valor != undefined) {
        var exp = leerExpresion(elemento.valor[0]);
        //console.log(exp);
        if (exp.tipo != "Error Semantico") {
          if (
            elemento.tipoDDV.toLowerCase() ==
            cambiarTNumber(exp.tipoDato).toLowerCase()
          ) {
            //SE GUARDA LA VARIABLE
            insertarAmbito({
              tipo: "VARIABLE",
              inicioAmb: rInicioAmb(),
              modificador: mod,
              identificador: elemento.identificador,
              tipoDato: exp.tipoDato,
              tipoDDV: elemento.tipoDDV,
              pos: posAmb++,
              fila: elemento.fila,
              columna: elemento.columna,
            });
            //SE ACTUALIZA LA CANTIDAD DE ELEMENTOS EN EL AMBITO
            var a = rCantidad();
            a.CantidadE = a.DatosAmbito.length;
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////// CODIGO QUE VERIFICA SI ES PRIMITIVO O C3D Y ASIGNA VALOR CORRECTO /////////////////////////////
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            //SE VERIFICA EL TIPO DE LA EXPRESION RETORNADA ANTES DE ASIGNARSE AL STACK YA QUE PUEDE SER UN VALOR PRIMITIVO O CADENA
            var asigT; // guarda etiqueta o valor

            if (exp.codigo3d != undefined) {
              if (exp.tipoDato == "BOOLEAN") {
                var t = rTemporal();
                var etiqS = rLabel();
                cod3 = cod3.concat(exp.codigo3d);
                cod3.push(generarEtiquetaJSON(exp.etiqueta[0].lbV));
                cod3.push(generoC3(t, "", 1, ""));
                cod3.push(generarGoto(etiqS));
                cod3.push(generarEtiquetaJSON(exp.etiqueta[0].lbF));
                cod3.push(generoC3(t, "", 0, ""));
                cod3.push(generarEtiquetaJSON(etiqS));
                asigT = t;
              } else {
                cod3 = cod3.concat(exp.codigo3d);
                asigT = exp.etiqueta;
              }
            } else {
              var vrT = verificarExpVU(exp); //VERIFICA LOS TIPOS SI ES PRIMITIVO O CODIGO DE 3 DIRECCIONES
              //Y RETORNA UN JSON PERSONALIZADO UNICAMENTE CON LOS VALORES NECESARIOS PARA ASIGNACION
              if (vrT.tipo == "C3D") {
                cod3 = cod3.concat(vrT.codigo3d);
                asigT = vrT.etiqueta;
              } else if (vrT.tipo == "PRIMITIVO") {
                asigT = castearBoo(vrT.valor);
              }
            }
            //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var tmp1 = rTemporal();
            var t = rTActual();
            cod3.push(generoC3(tmp1, "s", posAmbito(), "+"));
            cod3.push(generoC3("stack[(int)" + t + "]", "", asigT, ""));
            imprimirC3(cod3);
          } else {
            //SI LOS TIPOS NO COINCIDEN
            erroresCI.push({
              tipo: "Error Semantico",
              Error:
                "El tipo de dato del valor asignado a la variable no coincide con el tipo de variable -> " +
                elemento.identificador,
              Fila: elemento.fila,
              Columna: elemento.columna,
            });
          }
        } else {
          erroresCI.push(exp);
        }
      } else {
        //SI NO TIENE VALOR SE TIENE QUE INICIALIZAR LA VARIABLE
        //SE GUARDA LA VARIABLE
        insertarAmbito({
          tipo: "VARIABLE",
          inicioAmb: rInicioAmb(),
          modificador: mod,
          identificador: elemento.identificador,
          tipoDato: undefined, //esta undefined por que en la asignacion se asignara el tipo de la expresion
          tipoDDV: elemento.tipoDDV,
          pos: posAmb++,
          fila: elemento.fila,
          columna: elemento.columna,
        });
        //SE ACTUALIZA LA CANTIDAD DE ELEMENTOS EN EL AMBITO
        var a = rCantidad();
        a.CantidadE = a.DatosAmbito.length;
        var tmp1 = rTemporal();
        var t = rTActual();
        var val = inicializarVariable(elemento.tipoDDV);
        cod3.push(generoC3(tmp1, "s", posAmbito(), "+")); //posicion en el stack que se tiene que asignar
        cod3.push(generoC3("stack[(int)" + t + "]", "", val, "")); //insercion en el stack
        imprimirC3(cod3); //se imprime el codigo de 3 direcciones
      }
    }
  } else {
    //ERROR SI EXISTE UNA VARIABLE CON EL MISMO ID EN EL AMBITO ACTUAL
    var cad = "";
    if (mod.toLowerCase() == "const") {
      cad = "constante ya declarada -> ";
    } else {
      cad = "variable ya declarada -> ";
    }
    erroresCI.push({
      tipo: "Error Semantico",
      Error: cad + elemento.identificador,
      Fila: elemento.fila,
      Columna: elemento.columna,
    });
  }
}
//BUSCAR VARIABLE PARA DECLARACION
function buscarVariable(idV) {
  var i = ambitos.length - 1;
  for (var element of ambitos[i].DatosAmbito) {
    if (element.identificador.toLowerCase() == idV.toLowerCase()) {
      return true;
    }
  }
  return false;
}
//FUNCION QUE INICIALIZA VARIABLE
function inicializarVariable(tipo) {
  if (tipo == "NUMERO" || tipo == "ENTERO" || tipo == "DECIMAL") {
    return 0;
  } else if (tipo == "BOOLEAN") {
    return 0;
  } else if (tipo == "CADENA") {
    return -1;
  }
}
//FUNCION QUE RETORNA TIPO NUMBER EN DADO CASO SEA TIPO DECIMAL O ENTERO LA EXPRESION
function cambiarTNumber(tp) {
  if (tp == "ENTERO" || tp == "DECIMAL") {
    return "NUMERO";
  }
  return tp;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////FUNCIONES PARA ASIGNACION DE VARIABLES ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//FIXME: ARREGLANDO ASIGNACIONES
function asignacion(exp) {
  for (var element of exp) {
    if (element.tipo == "ASIGNACION") {
      asignacionVariables(element);
    }
  }
}

function asignacionVariables(ele) {
  console.log(ele);
  var c3d = [];
  if (ele.ope == "=") {
    //SOY UNA ASGINACION DE VARIABLE
    //PRIMERO SE OBTIENE EL ID YA QUE VIENE EN UN VECTOR
    var id = leerExpresion(ele.identificador);
    //SI EL ID ES VALIDO Y LO ENCONTRO EN LA TABLA DE SIMBOLOS
    if (id.tipo != "Error Semantico") {
      //SE BUSCA LA VARIABLE POR ID YA QUE SE NECESITAN TODOS LOS DATOS DE LA TABLA
      var variable = buscarVModificar(id, id.identificador);
      //SI LA VARIABLE ESTA DECLARADA CON LET
      if (variable.modificador == "let") {
        //SE VERIFICA SI LA EXPRESION ES VALIDA
        var exp = leerExpresion(ele.valor[0]);
        //SI LA EXPRESION ES UNA EXPRESION VALIDA
        if (exp.tipo != "Error Semantico") {
          if (variable.tipoDato == exp.tipoDato) {
            var temp = rTemporal();
            var val;
            c3d.push(generoC3("s", "", variable.inicioAmb, ""));
            c3d.push(generoC3(temp, "s", variable.pos, "+"));
            c3d.push(generoC3("s", "", rInicioAmb(), ""));
            if (exp.tipo == "C3D") {
              val = exp.etiqueta;
            } else {
              val = exp.valor;
            }
            c3d.push(generoC3("stack[(int)" + temp + "]", "", val, ""));
            imprimirC3(c3d);
          } else {
            erroresCI.push(
              gError(
                "El tipo de dato del valor a asignar no corresponde con el declarado de la variable",
                ele.fila,
                ele.columna
              )
            );
          }
        } else {
          //SI LA EXPRESION NO ES VALIDA
          erroresCI.push(exp);
        }
      } else {
        //SI LA VARIABLE ES UNA CONSTANTE
        erroresCI.push(
          gError(
            "No es posible reasignar valor a una constante -> " +
              id.identificador,
            ele.fila,
            ele.columna
          )
        );
      }
    } else {
      //SI HAY PROBLEMA CON EL ID REGRESADO
      erroresCI.push(id);
    }
  } else if (ele.ope == "++D") {
    var exp = {
      OpIzq: ele.identificador,
      tipo: "++",
      OpDer: undefined,
      fila: ele.fila,
      columna: ele.columna,
    };
    console.log(ele.identificador);
    var ejec = operacionesIncremento(exp);
    if (ejec != "Error Semantico") {
      imprimirC3(ejec.codigo3d);
    } else {
      erroresCI.push(ejec);
    }
  } else if (ele.ope == "A++") {
    var exp = {
      OpIzq: undefined,
      tipo: "++",
      OpDer: ele.identificador,
      fila: ele.fila,
      columna: ele.columna,
    };
    console.log(ele.identificador);
    var ejec = operacionesIncremento(exp);
    if (ejec != "Error Semantico") {
      imprimirC3(ejec.codigo3d);
    } else {
      erroresCI.push(ejec);
    }
  } else if (ele.ope == "--D") {
    var exp = {
      OpIzq: ele.identificador,
      tipo: "--",
      OpDer: undefined,
      fila: ele.fila,
      columna: ele.columna,
    };
    console.log(ele.identificador);
    var ejec = operacionesIncremento(exp);
    if (ejec != "Error Semantico") {
      imprimirC3(ejec.codigo3d);
    } else {
      erroresCI.push(ejec);
    }
  } else if (ele.ope == "A--") {
    var exp = {
      OpIzq: undefined,
      tipo: "--",
      OpDer: ele.identificador,
      fila: ele.fila,
      columna: ele.columna,
    };
    console.log(ele.identificador);
    var ejec = operacionesIncremento(exp);
    if (ejec != "Error Semantico") {
      imprimirC3(ejec.codigo3d);
    } else {
      erroresCI.push(ejec);
    }
  }
  //TODO: AQUI SE AGREGAN LOS INCREMENTOS
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////FUNCION QUE IMPRIME CODIGO DE 3 DIRECCIONES EN TEXTAREA /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function imprimirC3(v) {
  var cad = TraduccionTP.getValue();
  console.log(v);
  for (var element of v) {
    if (element.tipo == "C3D") {
      cad += element.etiqueta + " = ";
      if (element.opIzq != undefined) {
        cad += element.opIzq + " ";
      }
      cad += element.operacion + " ";
      if (element.opDer != undefined) {
        cad += element.opDer;
      }
      cad += ";\n";
    } else if (element.tipo == "LLC3D") {
      cad += element.id + "( " + element.etiqueta + " );\n";
    } else if (element.tipo == "LLC3DPOT") {
      cad +=
        element.etiqueta +
        " = " +
        element.id +
        "(" +
        element.base +
        "," +
        element.expo +
        ");\n";
    } else if (element.tipo == "PRINT") {
      if (element.tipoDato == "DECIMAL") {
        cad += 'printf("%f", ';
        cad += element.val;
        cad += ");\n";
      } else {
        cad += 'printf("%i", (int)';
        cad += element.val;
        cad += ");\n";
      }
    } else if (element.tipo == "IF") {
      cad +=
        "if(" +
        element.opIz +
        element.operacion +
        element.opDer +
        ") goto " +
        element.label +
        ";\n";
    } else if (element.tipo == "GOTO") {
      cad += "goto " + element.label + ";\n";
    } else if (element.tipo == "IFB") {
      cad += "if(" + element.val + ") goto " + element.label + ";\n";
    } else if (element.tipo == "ETIQUETA") {
      if (Array.isArray(element.etiqueta)) {
        for (var e of element.etiqueta) {
          cad += e + ": ";
        }
        cad += "\n";
      } else {
        cad += element.etiqueta + ": \n";
      }
    }
  }
  TraduccionTP.setValue(cad);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCIONES PARA FUNCIONAMIENTO BASICO/////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generarIf(opI, op, opD, lbl) {
  return { tipo: "IF", opIz: opI, operacion: op, opDer: opD, label: lbl };
}

function generarIfB(valBoo, lbl) {
  return { tipo: "IFB", val: valBoo, label: lbl };
}

function generarGoto(lbl) {
  return { tipo: "GOTO", label: lbl };
}

function generarEtiquetaJSON(lbl) {
  return { tipo: "ETIQUETA", etiqueta: lbl };
}
///////////////////////////////////////////////FUNCION QUE VERIFICA VALORES UNICOS Y GENERA SU CODIGO DE 3 DIRECCIONES
function verificarExpVU(exp) {
  //console.log(exp);
  if (exp.tipo == "PRIMITIVO" || exp.tipo == "VALOR") {
    if (exp.tipoDato == "CADENA" || exp.tipoDato == "BOOLEAN") {
      var et = rTemporal();
      var cod = c3dCadena(exp, et);
      return {
        tipo: "C3D",
        tipoDato: exp.tipoDato,
        etiqueta: et,
        codigo3d: cod,
      };
    } else if (cambiarTNumber(exp.tipoDato) == "NUMERO") {
      return {
        tipo: "PRIMITIVO",
        tipoDato: exp.tipoDato,
        valor: exp.valor,
      };
    } else if (exp.tipoDato == "IDENTIFICADOR") {
      return generarC3DIdentificadores(exp, exp.identificador);
    }
  } else if (exp.tipo == "VARIABLE") {
    var c3d = [];
    var t1 = rTemporal();
    var t2 = rTemporal();
    c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
    c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
    return {
      tipo: "C3D",
      tipoDato: exp.tipoDato,
      etiqueta: t2,
      codigo3d: c3d,
    };
  } else {
    return {
      tipo: "C3D",
      tipoDato: exp.tipoDato,
      etiqueta: exp.etiqueta,
      codigo3d: exp.codigo3d,
    };
  }
}
///////////////////////////////////////////////AGREGAR AMBITO
function agregarAmbito(nombre) {
  posAmb = 0;
  var ini = 0;
  if (ambitos.length > 0) {
    ini = ambitos[ambitos.length - 1].CantidadE + ini;
  }
  ambitos.push({ Nombre: nombre, Inicio: ini, CantidadE: 0, DatosAmbito: [] });
  return generoC3("s", "", ini, "");
}
///////////////////////////////////////////////INSERTAR VALOR EN EL AMBITO ACTUAL
function insertarAmbito(nValor) {
  var json = ambitos[ambitos.length - 1].DatosAmbito;
  json.push(nValor);
}

function rInicioAmb() {
  if (ambitos.length > 0) {
    return ambitos[ambitos.length - 1].Inicio;
  } else {
    return 0;
  }
}
///////////////////////////////////////////////
///////////////////////////////////////////////FUNCION QUE RETORNA LA CANTIDAD DE ELEMENTOS DEL ULTIMO VECTOR
function rCantidad() {
  var b = ambitos[ambitos.length - 1];
  return b;
}
//////////////////////////////////////////////ELMINAR AMBITO
function eliminarA() {
  //agregando ambito elminado al log de cambios
  var ultimo;
  logAmbitos.push(ambitos.pop());
  if (ambitos.length > 0) {
    ultimo = ambitos[ambitos.length - 1].Inicio;
    return generoC3("s", "", ultimo, "");
  }
  //eliminando nombre de vector de nombres
}
//////////////////////////////////////////////RETORNAR NOMBRE DEL AMBITO
function rNomAmbito() {
  return nombAmbitos[nombAmbitos.length - 1];
}
//////////////////////////////////////////////RETORNAR TEMPORAL
function rTemporal() {
  return "T" + temporal++;
}
function rTActual() {
  var t = temporal - 1;
  return "T" + t;
}
//////////////////////////////////////////////RETORNAR LABEL
function rLabel() {
  return "L" + etiqueta++;
}
///////////////////////////////////////////////FUNCION QUE LIMPIA LOS TEMPORALES PARA LA EJECUCION
function limpiar() {
  //codigo3D = [];
  temporal = 0;
  etiqueta = 0;
}
//////////////////////////////////////////////INDICE QUE SE MANEJA ENTRE AMBITOS INDICA POSICION DEL STACK
function posAmbito() {
  if (posAmb == 0) {
    return 0;
  } else {
    return posAmb - 1;
  }
}
///////////////////////////////////////////////
//////////////////////////////////////////////FUNCION QUE BUSCA UN ID Y RETORNA ESE ELEMENTO PARA SER MODIFICADO
function buscarVModificar(ele, idV) {
  for (var i = ambitos.length - 1; i >= 0; i--) {
    for (var element of ambitos[i].DatosAmbito) {
      if (element.identificador.toLowerCase() == idV.toLowerCase()) {
        return element;
      }
    }
  }
  return {
    tipo: "Error Semantico",
    Error: "Necesita declarar variable para asignar valor " + ele.identificador,
    Fila: ele.fila,
    Columna: 0,
  };
}
