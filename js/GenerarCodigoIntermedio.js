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
  console.log(json);
  if (json.err.length > 0) {
    //adjuntando errores lexicos y sintacticos antes de encontrar los semanticos
    erroresCI = erroresCI.concat(json.err);
  }
  //generara el codigo intermedio
  agregarAmbito("GLOBAL");
  generate(json.jsonInt, []);
  eliminarA();
  insertarEncabezado();
  limpiar();
  //console.log(ambitos);
  console.log(logAmbitos);
  tablaSimbolos = logAmbitos;
  logAmbitos = [];
  //console.log(generarCodigo3DCadena("prueba"));
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCION SEPARADORA DE INSTRUCCIONES /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ESTE METODO ES PARA RECORRER EL JSON GENERADO DESDE TRADUCCION.JISON
function generate(json, vec) {
  for (var element of json) {
    if (element.tipo == "DECLARACION") {
      declaracion(element.contenido, element.modificador);
    } else if (element.tipo == "LISTA_ASIGNACION") {
      asignacion(element.contenido);
    } else if (element.tipo == "IMPRIMIR") {
      generarImprimir(element.contenido);
    } else if (element.tipo == "LISTADO_IF") {
      generarCodigoIF(element.contenido, vec);
    } else if (element.tipo == "SWITCH") {
      generarCodigoSwitch(element, vec);
    } else if (element.tipo == "WHILE") {
      generarCodigoWhile(element, vec);
    } else if (element.tipo == "DOWHILE") {
      generarCodigoDoWhile(element, vec);
    } else if (element.tipo == "FOR") {
      generarCodigoFor(element, vec);
    } else if (element.tipo == "FORIN") {
      generarCodigoForIn(element, vec);
    } else if (element.tipo == "FOROF") {
      generarCodigoForOf(element, vec);
    } else if (element.tipo == "BREAK") {
      var cod = generarCodigoST(
        vec,
        element.tipo,
        element.fila,
        element.columna
      );
      if (cod.tipo != "Error Semantico") {
        imprimirC3(cod);
      } else {
        erroresCI.push(cod);
      }
      return;
    } else if (element.tipo == "CONTINUE") {
      var cod = generarCodigoST(
        vec,
        element.tipo,
        element.fila,
        element.columna
      );
      if (cod.tipo != "Error Semantico") {
        imprimirC3(cod);
      } else {
        erroresCI.push(cod);
      }
      return;
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCION PARA IMPRIMIR ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarImprimir(element) {
  var cod3 = [];
  var print = [];
  var exp;
  var band = false;
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
          cod3.push(generoC3("m6", "", rBoo.etiqueta, ""));
          cod3.push(gLL("impCad", ""));
        } else {
          var cod = realizarPrint(exp);
          cod3 = cod3.concat(cod.cod3);
          print = print.concat(cod.pr);
        }
      } else if (exp.tipo == "VARIABLE") {
        var temp = rTemporal();
        var val = rTemporal();
        cod3.push(generoC3("s", "", exp.inicioAmb, ""));
        cod3.push(generoC3(temp, "s", exp.pos, "+"));
        cod3.push(generoC3("s", "", rInicioAmb(), ""));
        cod3.push(generoC3(val, "stack[(int)" + temp + "]", "", ""));
        if (exp.tipoDato == "BOOLEAN") {
          var iniC = rTemporal();
          cod3.push(generoC3(iniC, "h", "", ""));
          cod3.push(generoC3("h", "h", 1, "+"));
          cod3.push(generoC3("m23", "", val, ""));
          cod3.push(gLL("cBool", ""));
          cod3.push(generoC3("heap[(int)" + iniC + "]", "h", iniC, "-"));
          cod3.push(generoC3("m6", "", iniC, ""));
          cod3.push(gLL("impCad", ""));
        } else if (exp.tipoDato == "CADENA") {
          cod3.push(generoC3("m6", "", val, ""));
          cod3.push(gLL("impCad", ""));
        } else if (exp.tipoDato == "ENTERO") {
          cod3.push({ tipo: "PRINT", tipoDato: exp.tipoDato, val: val });
        } else if (exp.tipoDato == "DECIMAL") {
          cod3.push({ tipo: "PRINT", tipoDato: exp.tipoDato, val: val });
        } else if (exp.tipoDato == "NUMERO") {
          cod3.push({ tipo: "PRINT", tipoDato: "DECIMAL", val: val });
        }
      } else {
        //SI EL VALOR OBTENIDO DE LA EXPRESION ES PRIMITIVO
        var vrT = verificarExpVU(exp); //VERIFICA LOS TIPOS SI ES PRIMITIVO Y SI SI RETORNA CODIGO DE 3 DIRECCIONES
        //SI ES CODIGO DE 3 DIRECCIONES
        if (vrT.tipo == "C3D") {
          var cod = realizarPrint(vrT);
          cod3 = cod3.concat(cod.cod3);
          print = print.concat(cod.pr);
        } else if (
          (vrT.tipo == "PRIMITIVO" && vrT.tipoDato == "ENTERO") ||
          (vrT.tipo == "PRIMITIVO" && vrT.tipoDato == "DECIMAL")
        ) {
          print.push({ tipo: "PRINT", tipoDato: vrT.tipoDato, val: ele.valor });
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
    print.push(generoC3("m6", "", ele.etiqueta, ""));
    print.push(gLL("impCad", ""));
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
  cod3.push(generoC3("m23", "", t, ""));
  cod3.push(gLL("cBool", ""));
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
  } else if (expresion.tipo == "METSTRINGC") {
    return metodoStringC(expresion);
  } else if (expresion.tipo == "METSTRINGI") {
    return metodoStringI(expresion);
  } else if (expresion.tipo == "METSTRINGP") {
    return metodoStringE(expresion);
  } else if (expresion.tipo == "LENGTHC" || expresion.tipo == "LENGTHI") {
    return generarLength(expresion);
  } else if (expresion.tipo == "OBJ") {
    return generarObtenerObjeto(expresion);
  } else if (expresion.tipo == "C3D") {
    return expresion;
  }
}

function validarIdentificador(valId) {
  if (valId.tipo == "VARIABLE") {
    return {
      tipo: "VARIABLE",
      modificador: valId.modificador,
      inicioAmb: valId.inicioAmb,
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
    console.log(opD);
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
        codI.push(generoC3("s", "", opI.inicioAmb, ""));
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3("s", "", rInicioAmb(), ""));
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        opI.etiqueta = t2;
        etiqI = t2;
      } else {
        if (opI.tipoDato == "BOOLEAN") {
          var t = rTemporal();
          var etiqS = rLabel();
          codI = codI.concat(opI.codigo3d);
          codI.push(generarEtiquetaJSON(opI.etiqueta[0].lbV));
          codI.push(generoC3(t, "", 1, ""));
          codI.push(generarGoto(etiqS));
          codI.push(generarEtiquetaJSON(opI.etiqueta[0].lbF));
          codI.push(generoC3(t, "", 0, ""));
          codI.push(generarEtiquetaJSON(etiqS));
          etiqI = t;
        } else {
          etiqI = opI.etiqueta;
        }
      }

      if (opD.tipo == "PRIMITIVO") {
        etiqD = rTemporal();
        console.log("paso aca");
        codD.push(generoC3(etiqD, "h", "", ""));
        codD.push(generoC3("h", "h", 1, "+"));
        var pr = generarCodigo3Direcciones(opD);
        codD = codD.concat(pr);
        codD.push(generoC3("heap[(int)" + etiqD + "]", "h", etiqD, "-"));
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3("s", "", opD.inicioAmb, ""));
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3("s", "", rInicioAmb(), ""));
        codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        opD.etiqueta = t2;
        etiqD = t2;
      } else {
        if (opD.tipoDato == "BOOLEAN") {
          var t = rTemporal();
          var etiqS = rLabel();
          codD = codD.concat(opD.codigo3d);
          codD.push(generarEtiquetaJSON(opD.etiqueta[0].lbV));
          codD.push(generoC3(t, "", 1, ""));
          codD.push(generarGoto(etiqS));
          codD.push(generarEtiquetaJSON(opD.etiqueta[0].lbF));
          codD.push(generoC3(t, "", 0, ""));
          codD.push(generarEtiquetaJSON(etiqS));
          etiqD = t;
        } else {
          etiqD = opD.etiqueta;
        }
      }

      cod3d = cod3d.concat(codI, codD);
      etiq = rTemporal();
      cod3d.push(generoC3(etiq, "h", "", ""));
      cod3d.push(generoC3("h", "h", 1, "+"));
      cod3d = cod3d.concat(generarCodigo3Direcciones(opI, etiqI));
      cod3d = cod3d.concat(generarCodigo3Direcciones(opD, etiqD));
      cod3d.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
    } else if (tpD == "DECIMAL" || tpD == "ENTERO") {
      var etiqI, etiqD;
      if (opI.tipo == "PRIMITIVO") {
        etiqI = opI.valor;
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3("s", "", opI.inicioAmb, ""));
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3("s", "", rInicioAmb(), ""));
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiqI = t2;
      } else {
        if (opI.tipoDato == "BOOLEAN") {
          var t = rTemporal();
          var etiqS = rLabel();
          cod3d = cod3d.concat(opI.codigo3d);
          codI.push(generarEtiquetaJSON(opI.etiqueta[0].lbV));
          codI.push(generoC3(t, "", 1, ""));
          codI.push(generarGoto(etiqS));
          codI.push(generarEtiquetaJSON(opI.etiqueta[0].lbF));
          codI.push(generoC3(t, "", 0, ""));
          codI.push(generarEtiquetaJSON(etiqS));
          etiqI = t;
        } else {
          etiqI = opI.etiqueta;
        }
      }

      if (opD.tipo == "PRIMITIVO") {
        etiqD = opD.valor;
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3("s", "", opD.inicioAmb, ""));
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3("s", "", rInicioAmb(), ""));
        codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiqD = t2;
      } else {
        if (opD.tipoDato == "BOOLEAN") {
          var t = rTemporal();
          var etiqS = rLabel();
          cod3d = cod3d.concat(opD.codigo3d);
          codD.push(generarEtiquetaJSON(opD.etiqueta[0].lbV));
          codD.push(generoC3(t, "", 1, ""));
          codD.push(generarGoto(etiqS));
          codD.push(generarEtiquetaJSON(opD.etiqueta[0].lbF));
          codD.push(generoC3(t, "", 0, ""));
          codD.push(generarEtiquetaJSON(etiqS));
          etiqD = t;
        } else {
          etiqD = opD.etiqueta;
        }
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
      codI.push(generoC3("s", "", opI.inicioAmb, ""));
      codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codI.push(generoC3("s", "", rInicioAmb(), ""));
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
      codD.push(generoC3("s", "", opD.inicioAmb, ""));
      codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codD.push(generoC3("s", "", rInicioAmb(), ""));
      codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqD = t2;
    } else {
      etiqD = opD.etiqueta;
    }
    //JUNTANDO CODIGO DE LADO IZQ Y DER
    cod3d = cod3d.concat(codI, codD);

    if (op == "%") {
      etiq = rTemporal();
      cod3d.push(gLLM(etiq, etiqI, etiqD));
    } else {
      etiq = rTemporal();
      cod3d.push({
        tipo: "C3D",
        etiqueta: etiq,
        opIzq: etiqI,
        opDer: etiqD,
        operacion: op,
      });
    }
  } else if (op == "**") {
    var etiqI, etiqD;
    if (opI.tipo == "PRIMITIVO") {
      etiqI = opI.valor;
    } else if (opI.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codI.push(generoC3("s", "", opI.inicioAmb, ""));
      codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codI.push(generoC3("s", "", rInicioAmb(), ""));
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
      codD.push(generoC3("s", "", opD.inicioAmb, ""));
      codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codD.push(generoC3("s", "", rInicioAmb(), ""));
      codD.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      etiqD = t2;
    } else {
      etiqD = opD.etiqueta;
    }
    //JUNTANDO CODIGO DE LADO IZQ Y DER
    cod3d = cod3d.concat(codI, codD);

    //etiq = rTemporal();

    cod3d.push(generoC3("m1", "", etiqD, ""));
    cod3d.push(generoC3("m0", "", etiqI, ""));
    cod3d.push(gLLP("", "", "")); //
    etiq = "m22";
  } else if (op == ">" || op == ">=" || op == "<" || op == "<=") {
    var etiqI, etiqD;

    /////VERIFICANDO VALORES DL LADO IZQUIERDO DE LA OPERACION
    if (opI.tipo == "PRIMITIVO") {
      etiqI = opI.valor;
    } else if (opI.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      codI.push(generoC3("s", "", opI.inicioAmb, ""));
      codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codI.push(generoC3("s", "", rInicioAmb(), ""));
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
      codD.push(generoC3("s", "", opD.inicioAmb, ""));
      codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      codD.push(generoC3("s", "", rInicioAmb(), ""));
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
        codI.push(generoC3("s", "", opI.inicioAmb, ""));
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3("s", "", rInicioAmb(), ""));
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq1 = t2;
      } else {
        etiq1 = opI.etiqueta;
      }
      //LADO DERECHO
      if (opD.tipo == "VALOR") {
        etiq2 = rTemporal();
        codD = c3dCadena(opD, etiq2);
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3("s", "", opD.inicioAmb, ""));
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3("s", "", rInicioAmb(), ""));
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
      (opI.tipoDato == "BOOLEAN" && opD.tipoDato == "BOOLEAN") ||
      (opI.tipoDato == "NULL" && opD.tipoDato == "NULL")
    ) {
      var etiq1 = ""; //izquierdo
      var etiq2 = ""; //derecho
      //LADO IZQUIERDO
      if (opI.tipo == "PRIMITIVO" || opI.tipoDato == "NULL") {
        etiq1 = opI.valor;
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3("s", "", opI.inicioAmb, ""));
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3("s", "", rInicioAmb(), ""));
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq1 = t2;
      } else {
        codI = codI.concat(opI.codigo3d);
        etiq1 = opI.etiqueta;
      }
      //LADO DERECHO
      if (opD.tipo == "PRIMITIVO" || opD.tipoDato == "NULL") {
        etiq2 = opD.valor;
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3("s", "", opD.inicioAmb, ""));
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3("s", "", rInicioAmb(), ""));
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
    } else if (
      (opI.tipoDato == "NULL" && opD.tipoDato == "CADENA") ||
      (opI.tipoDato == "CADENA" && opD.tipoDato == "NULL")
    ) {
      var etiq1 = ""; //izquierdo
      var etiq2 = ""; //derecho
      if (opI.tipoDato == "NULL") {
        etiq1 = opI.valor;
      } else if (opI.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codI.push(generoC3("s", "", opI.inicioAmb, ""));
        codI.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codI.push(generoC3("s", "", rInicioAmb(), ""));
        codI.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiq1 = t2;
      } else {
        codI = codI.concat(opI.codigo3d);
        etiq1 = opI.etiqueta;
      }

      if (opD.tipoDato == "NULL") {
        etiq2 = opD.valor;
      } else if (opD.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        codD.push(generoC3("s", "", opD.inicioAmb, ""));
        codD.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        codD.push(generoC3("s", "", rInicioAmb(), ""));
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
        cod3d.push(generoC3("s", "", opI.inicioAmb, ""));
        cod3d.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        cod3d.push(generoC3("s", "", rInicioAmb(), ""));
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
        cod3d.push(generoC3("s", "", opD.inicioAmb, ""));
        cod3d.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        cod3d.push(generoC3("s", "", rInicioAmb(), ""));
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
          if (Array.isArray(opD.etiqueta[0].lbF)) {
            vTF = vTF.concat(opD.etiqueta[0].lbF);
          } else {
            if (Array.isArray(vTF)) {
              vTF.push(opD.etiqueta[0].lbF);
            } else {
              var aux = [];
              aux.push(vTF);
              aux.push(opD.etiqueta[0].lbF);
              vTF = aux;
            }
          }
        }
      }

      etiq = [{ lbV: etiqVD, lbF: vTF }];
    } else {
      /////////////////////////////////////////////////////////////////////OR
      //GENERANDO ETIQUETA DE SALIDA
      //JUNTANDO CODIGO DE 3 DIRECCIONES QUE VIENE DE LADO IZQUIERDO

      if (opI.tipo == "VARIABLE") {
        ////////LADO IZQUIERDO
        ///////TEMPORALES PARA OBTENER VALOR DE LA VARIABLE
        var t1 = rTemporal();
        var t2 = rTemporal();
        ////////LABELS PARA GENERAR COMPROBACION DE LA VARIABLE
        var etiV = rLabel();
        var etiF = rLabel();
        cod3d.push(generoC3("s", "", opI.inicioAmb, ""));
        cod3d.push(generoC3(t1, "s", opI.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        cod3d.push(generoC3("s", "", rInicioAmb(), ""));
        cod3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor

        cod3d.push(generarIfB(t2, etiV));
        cod3d.push(generarGoto(etiF));
        vTF.push(etiV);
        cod3d.push(generarEtiquetaJSON(etiF));
      } else {
        cod3d = cod3d.concat(opI.codigo3d);
        //GENERANDO ETIQUETAS DE LADO DERECHO
        if (Array.isArray(opI.etiqueta)) {
          //SI VIENE UN RELACIONAL
          etiqFI = opI.etiqueta[0].lbF;
          vTF = opI.etiqueta[0].lbV;
          cod3d.push(generarEtiquetaJSON(etiqFI));
        }
      }

      if (opD.tipo == "VARIABLE") {
        ////////LADO IZQUIERDO
        ///////TEMPORALES PARA OBTENER VALOR DE LA VARIABLE
        var t1 = rTemporal();
        var t2 = rTemporal();
        ////////LABELS PARA GENERAR COMPROBACION DE LA VARIABLE
        var etiV = rLabel();
        var etiF = rLabel();
        cod3d.push(generoC3("s", "", opD.inicioAmb, ""));
        cod3d.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        cod3d.push(generoC3("s", "", rInicioAmb(), ""));
        cod3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor

        cod3d.push(generarIfB(t2, etiV));
        cod3d.push(generarGoto(etiF));

        etiqFD = etiF;
        vTF.push(etiV);
      } else {
        //LADO DERECHO
        cod3d = cod3d.concat(opD.codigo3d);
        if (Array.isArray(opD.etiqueta)) {
          //SI VIENE UN RELACIONAL
          etiqFD = opD.etiqueta[0].lbF;
          if (Array.isArray(opD.etiqueta[0].lbV)) {
            vTF = vTF.concat(opD.etiqueta[0].lbV);
          } else {
            if (Array.isArray(vTF)) {
              vTF.push(opD.etiqueta[0].lbV);
            } else {
              var aux = [];
              aux.push(vTF);
              aux.push(opD.etiqueta[0].lbV);
              vTF = aux;
            }
          }
        }
      }

      etiq = [{ lbV: vTF, lbF: etiqFD }];
    }
  } else if (op == "!") {
    //CONCATENANDO EL CODIGO DE 3 DIRECCIONES QUE TRAE EL LADO DERECHO
    console.log(opD);
    if (opD.tipo == "VARIABLE") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      ////////LABELS PARA GENERAR COMPROBACION DE LA VARIABLE
      var etiV = rLabel();
      var etiF = rLabel();
      cod3d.push(generoC3("s", "", opD.inicioAmb, ""));
      cod3d.push(generoC3(t1, "s", opD.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      cod3d.push(generoC3("s", "", rInicioAmb(), ""));
      cod3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor

      cod3d.push(generarIfB(t2, etiV));
      cod3d.push(generarGoto(etiF));

      etiqVD = etiF;
      etiqFD = etiV;
    } else {
      cod3d = cod3d.concat(opD.codigo3d);
      etiqVD = opD.etiqueta[0].lbF;
      etiqFD = opD.etiqueta[0].lbV;
    }

    etiq = [{ lbV: etiqVD, lbF: etiqFD }];
  }
  return gC3D(tpD, etiq, cod3d);
}
///////////////////////////////////////////OPTIMIZACION PARA SUMAS Y RESTAS, SI ES 0 RETORNA "" DE LO CONTRARIO EL VALOR
function opCeroSR(temporal, opI, etiqI, opD, etiqD, op) {
  if (opI.tipo == "PRIMITIVO" && opD.tipo != "PRIMITIVO") {
    if (opI.valor == 0) {
      return {
        tipo: "C3D",
        etiqueta: etiq,
        opIzq: "",
        opDer: castearBoo(etiqD),
        operacion: "",
      };
    } else {
      return {
        tipo: "C3D",
        etiqueta: etiq,
        opIzq: castearBoo(etiqI),
        opDer: castearBoo(etiqD),
        operacion: op,
      };
    }
  } else if (opI.tipo != "PRIMITIVO" && opD.tipo == "PRIMITIVO") {
    if (opD.valor == 0) {
      return {
        tipo: "C3D",
        etiqueta: etiq,
        opIzq: castearBoo(etiqI),
        opDer: "",
        operacion: "",
      };
    } else {
      return {
        tipo: "C3D",
        etiqueta: etiq,
        opIzq: castearBoo(etiqI),
        opDer: castearBoo(etiqD),
        operacion: op,
      };
    }
  } else {
    return false;
  }
}

//FUNCION QUE DEVUELVE CODIGO DE 3 DIRECCIONES SOLO PARA CADENA
function generarCodigo3Direcciones(op, etiqB) {
  var v = [];
  if (op.tipoDato == "CADENA" && op.tipo == "VALOR") {
    return generarCodigo3DCadena(op.valor);
  } else if (op.tipoDato == "CADENA" && op.tipo == "C3D") {
    v.push(generoC3("m24", "", op.etiqueta, ""));
    v.push(gLL("cC", ""));
    return v;
  } else if (
    (op.tipoDato == "ENTERO" && op.tipo == "PRIMITIVO") ||
    (op.tipoDato == "DECIMAL" && op.tipo == "PRIMITIVO")
  ) {
    v.push(generoC3("m10", "", op.valor, ""));
    v.push(gLL("cNum", ""));
    return v;
  } else if (
    (op.tipoDato == "ENTERO" && op.tipo == "C3D") ||
    (op.tipoDato == "DECIMAL" && op.tipo == "C3D")
  ) {
    v.push(generoC3("m10", "", op.etiqueta, ""));
    v.push(gLL("cNum", ""));
    return v;
  } else if (op.tipoDato == "BOOLEAN" && op.tipo == "PRIMITIVO") {
    var c = castearBoo(op.valor);
    v.push(generoC3("m23", "", c, ""));
    v.push(gLL("cBool", ""));
    return v;
  } else if (op.tipoDato == "BOOLEAN" && op.tipo == "C3D") {
    v.push(generoC3("m23", "", etiqB, ""));
    v.push(gLL("cBool", ""));
    return v;
  } else if (op.tipo == "VARIABLE") {
    if (op.tipoDato == "ENTERO" || op.tipoDato == "DECIMAL") {
      v.push(generoC3("m10", "", op.etiqueta, ""));
      v.push(gLL("cNum", ""));
      return v;
    } else if (op.tipoDato == "CADENA") {
      v.push(generoC3("m24", "", op.etiqueta, ""));
      v.push(gLL("cC", ""));
      return v;
    } else if (op.tipoDato == "BOOLEAN") {
      v.push(generoC3("m23", "", op.etiqueta, ""));
      v.push(gLL("cBool", ""));
      return v;
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
    id: "pot",
    base: par1,
    expo: par2,
  };
}
//FUNCION QUE GENERA JSON PARA FUNCION DE POTENCIA
function gLLM(etiq, par1, par2) {
  return {
    tipo: "LLC3DMOD",
    etiqueta: etiq,
    id: "fmod",
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
    } else if (ele.tipo == "ARRAY") {
      declaracionArreglos(ele, mod);
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
        var tpD;
        if (elemento.tipoDDV == "NUMERO") {
          tpD = "ENTERO";
        } else if (elemento.tipoDDV == "BOOLEAN") {
          tpD = "BOOLEAN";
        } else if (elemento.tipoDDV == "CADENA") {
          tpD = "CADENA";
        }
        insertarAmbito({
          tipo: "VARIABLE",
          inicioAmb: rInicioAmb(),
          modificador: mod,
          identificador: elemento.identificador,
          tipoDato: tpD, //esta undefined por que en la asignacion se asignara el tipo de la expresion
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
/////////////////////FUNCIONES PARA DECLARACION DE ARREGLOS  ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function declaracionArreglos(elemento, mod) {
  //PRIMERO BUSCO EL VECTOR EN LA TABLA DE SIMBOLOS
  var c3d = [];
  var idVector = elemento.identificador;
  var tipoDVec;
  //console.log(elemento);
  if (!buscarVariable(idVector)) {
    //SE NECESITA SABER QUE TIPO DE VECTOR ES
    //si valor no es undefined let p : number [] = [1,2,3,4,5,6];
    if (elemento.valor != undefined) {
      tipoDVec = elemento.tipoDato;
      //me tendria que retornar un vector con codigo de 3 direcciones por cada valor de la expresion que trae asignada el vector
      var exp = verificarExpVectores(
        tipoDVec,
        elemento.valor,
        elemento.fila,
        elemento.columna
      );
      if (exp.tipo != "Error Semantico") {
        insertarAmbito({
          tipo: "ARRAY",
          inicioAmb: rInicioAmb(),
          modificador: mod,
          identificador: idVector,
          tipoDato: tipoDVec,
          pos: posAmb++,
          fila: elemento.fila,
          columna: elemento.columna,
        });
        c3d = c3d.concat(exp.codigo3d);
        var c3dV = generarC3DVector(exp.eti);
        c3d = c3d.concat(c3dV.codigo3d);
        ////////////////////////ASIGNACION EN EL STACK
        var tmp1 = rTemporal();
        var t = rTActual();
        c3d.push(generoC3(tmp1, "s", posAmb - 1, "+"));
        c3d.push(generoC3("stack[(int)" + t + "]", "", c3dV.etiqueta, ""));
        imprimirC3(c3d);
      } else {
        erroresCI.push(exp);
      }
    } else {
      //si el valor es undefined let vec:number[] = new Array(4);
      tipoDVec = elemento.tipoDato;
      var ex = leerExpresion(elemento.expresion[0]);
      if (ex.tipoDato == "ENTERO") {
        insertarAmbito({
          tipo: "ARRAY",
          inicioAmb: rInicioAmb(),
          modificador: mod,
          identificador: idVector,
          tipoDato: tipoDVec,
          pos: posAmb++,
          fila: elemento.fila,
          columna: elemento.columna,
        });
        var vNull = vectorNull(tipoDVec, ex.valor);
        var c3dV = generarC3DVector(vNull);
        c3d = c3d.concat(c3dV.codigo3d);
        //vectorNull
        var tmp1 = rTemporal();
        var t = rTActual();
        c3d.push(generoC3(tmp1, "s", posAmb - 1, "+"));
        c3d.push(generoC3("stack[(int)" + t + "]", "", c3dV.etiqueta, ""));
        imprimirC3(c3d);
      } else {
        erroresCI.push({
          tipo: "Error Semantico",
          Error:
            "La instruccion New Array unicamente acepta valores de tipo entero",
          Fila: elemento.fila,
          Columna: elemento.columna,
        });
      }
    }
  } else {
    var cad = "";
    if (mod.toLowerCase() == "const") {
      cad = "ya existe una constante u objeto con el mismo identificador -> ";
    } else {
      cad = "ya existe una variable u objeto con el mismo identificador -> ";
    }
    erroresCI.push({
      tipo: "Error Semantico",
      Error: cad + elemento.identificador,
      Fila: elemento.fila,
      Columna: elemento.columna,
    });
  }
}

function verificarExpVectores(tpD, vec, fil, col) {
  var c3d = [];
  var etiquetas = [];
  if (Array.isArray(vec)) {
    for (var element of vec) {
      var exp = leerExpresion(element);
      //console.log(exp);
      if (tpD == cambiarTNumber(exp.tipoDato)) {
        if (exp.tipo == "C3D") {
          c3d = c3d.concat(exp.codigo3d);
          if (exp.tipoDato == "CADENA") {
            etiquetas.push(exp.etiqueta);
          } else if (exp.tipoDato == "BOOLEAN") {
            var t = rTemporal();
            var etiqS = rLabel();
            c3d.push(generarEtiquetaJSON(exp.etiqueta[0].lbV));
            c3d.push(generoC3(t, "", 1, ""));
            c3d.push(generarGoto(etiqS));
            c3d.push(generarEtiquetaJSON(exp.etiqueta[0].lbF));
            c3d.push(generoC3(t, "", 0, ""));
            c3d.push(generarEtiquetaJSON(etiqS));
            etiquetas.push(t);
          }
        } else if (exp.tipo == "VARIABLE") {
          var t1 = rTemporal();
          var t2 = rTemporal();
          c3d.push(generoC3("s", "", exp.inicioAmb, ""));
          c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
          c3d.push(generoC3("s", "", rInicioAmb(), ""));
          c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
          etiquetas.push(t2);
        } else {
          etiquetas.push(exp.valor);
        }
      } else {
        return gError(
          "Problema en la asignacion, no coinciden los tipos",
          fil,
          col
        );
      }
    }
    return { eti: etiquetas, codigo3d: c3d };
  } else {
    return gError(
      "Problema en la asignacion, no coinciden los tipos",
      fil,
      col
    );
  }
}

function generarC3DVector(vec) {
  var c3d = [];
  var etiq = rTemporal();
  c3d.push(generoC3(etiq, "h", "", ""));
  c3d.push(generoC3("h", "h", 1, "+"));
  for (var element of vec) {
    c3d.push(generoC3("heap[h]", element, "", ""));
    c3d.push(generoC3("h", "h", 1, "+"));
  }
  c3d.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
  return { etiqueta: etiq, codigo3d: c3d };
}

function vectorNull(tpd, tam) {
  var vec = [];
  var val;
  if (tpd == "BOOLEAN") {
    val = false;
  } else if (tpd == "NUMERO") {
    val = 0;
  } else if (tpd == "CADENA") {
    val = -1;
  }
  for (let i = 0; i < tam; i++) {
    vec.push(val);
  }
  return vec;
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////FUNCIONES PARA ASIGNACION DE VARIABLES ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function asignacion(exp) {
  for (var element of exp) {
    if (element.tipo == "ASIGNACION") {
      asignacionVariables(element);
    }
  }
}

function asignacionVariables(ele) {
  //console.log(ele);
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
          if (
            (variable.tipoDato == "ENTERO" && exp.tipoDato == "DECIMAL") ||
            (variable.tipoDato == "DECIMAL" && exp.tipoDato == "ENTERO") ||
            cambiarTNumber(variable.tipoDato) == cambiarTNumber(exp.tipoDato)
          ) {
            var temp = rTemporal();
            var val;
            variable.tipoDato = exp.tipoDato;
            c3d.push(generoC3("s", "", variable.inicioAmb, ""));
            c3d.push(generoC3(temp, "s", variable.pos, "+"));
            c3d.push(generoC3("s", "", rInicioAmb(), ""));
            if (exp.tipo == "C3D") {
              if (exp.tipoDato == "BOOLEAN") {
                var t = rTemporal();
                var etiqS = rLabel();
                c3d = c3d.concat(exp.codigo3d);
                c3d.push(generarEtiquetaJSON(exp.etiqueta[0].lbV));
                c3d.push(generoC3(t, "", 1, ""));
                c3d.push(generarGoto(etiqS));
                c3d.push(generarEtiquetaJSON(exp.etiqueta[0].lbF));
                c3d.push(generoC3(t, "", 0, ""));
                c3d.push(generarEtiquetaJSON(etiqS));
                val = t;
              } else if (exp.tipoDato == "CADENA") {
                c3d = c3d.concat(exp.codigo3d);
                val = exp.etiqueta;
              } else {
                c3d = c3d.concat(exp.codigo3d);
                val = exp.etiqueta;
              }
            } else if (exp.tipo == "VARIABLE") {
              var t1 = rTemporal();
              var t2 = rTemporal();
              c3d.push(generoC3("s", "", exp.inicioAmb, ""));
              c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
              c3d.push(generoC3("s", "", rInicioAmb(), ""));
              c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
              val = t2;
            } else {
              val = exp.valor;
            }
            c3d.push(generoC3("stack[(int)" + temp + "]", "", val, ""));
            imprimirC3(c3d);
          } else {
            erroresCI.push(
              gError(
                "El tipo de dato del valor a asignar no corresponde con el declarado de la variable",
                exp.fila,
                exp.columna
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
    var ejec = operacionesIncremento(exp);
    if (ejec != "Error Semantico") {
      imprimirC3(ejec.codigo3d);
    } else {
      erroresCI.push(ejec);
    }
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCION PARA C3D DE IF /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generarCodigoIF(vec, v) {
  var c3d = [];
  var etV;
  var etF;
  var ls = rLabel();
  for (var ele of vec) {
    if (ele.tipo == "IF" || ele.tipo == "ELSEIF") {
      var exp = leerExpresion(ele.expresion[0]);
      if (exp.tipo != "Error Semantico") {
        if (exp.tipoDato == "BOOLEAN") {
          c3d = c3d.concat(exp.codigo3d);
          etV = exp.etiqueta[0].lbV;
          etF = exp.etiqueta[0].lbF;
          c3d.push(generarEtiquetaJSON(etV));
          imprimirC3(c3d);
          c3d = [];
          c3d.push(agregarAmbito(ele.tipo));
          imprimirC3(c3d);
          c3d = [];
          generate(ele.instrucciones, v);
          c3d.push(eliminarA());
          imprimirC3(c3d);
          c3d = [];
          c3d.push(generarGoto(ls));
          c3d.push(generarEtiquetaJSON(etF));
          imprimirC3(c3d);
          c3d = [];
        } else {
          erroresCI.push(
            gError(
              "En el if unicamente se permiten expresiones de tipo Boolean",
              ele.fila,
              ele.columna
            )
          );
        }
      } else {
        erroresCI.push(exp);
      }
    } else if (ele.tipo == "ELSE") {
      c3d.push(agregarAmbito(ele.tipo));
      imprimirC3(c3d);
      c3d = [];
      generate(ele.instrucciones, v);
      c3d.push(eliminarA());
      imprimirC3(c3d);
      c3d = [];
    }
  }
  c3d.push(generarEtiquetaJSON(ls));
  imprimirC3(c3d);
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCION PARA C3D DE SWITCH /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarCodigoSwitch(vec, v) {
  var exp = leerExpresion(vec.expresion[0]);
  var c3d = [];
  var etiq;
  var etiqSalida;
  var opD;
  var vc = [];
  var ambR;
  var vLabel = [];
  if (exp.tipo != "Error Semantico") {
    etiq = evaluarExpSwitch(exp);
    etiqSalida = rLabel();
    if (vec.instrucciones != undefined) {
      //FOR QUE GENERA LAS CONDICIONES Y GUARDA LOS LABELS
      for (var element of vec.instrucciones) {
        if (element.tipo == "CASE") {
          var expC = leerExpresion(element.expresion[0]);
          if (expC != "Error Semantico") {
            var val = evaluarExpSwitch(expC);
            var lbl = rLabel();
            vLabel.push(lbl);
            c3d.push(generarIf(etiq, "==", val, lbl));
          } else {
            erroresCI.push(expC);
            return;
          }
        } else if (element.tipo == "DEFAULT") {
          var lbl = rLabel();
          vLabel.push(lbl);
          c3d.push(generarGoto(lbl));
        }
      }
      imprimirC3(c3d);
      c3d = [];
      var temp = vec.instrucciones;
      ambR = rAmbActual();
      for (var ele in vec.instrucciones) {
        if (temp[ele].tipo == "CASE") {
          c3d.push(generarEtiquetaJSON(vLabel[ele]));

          vc = v.concat(generarST("BREAK", etiqSalida, ambR));
          c3d.push(agregarAmbito("CASE"));
          imprimirC3(c3d);
          c3d = [];
          generate(temp[ele].instrucciones, vc);
          c3d.push(eliminarA());
          imprimirC3(c3d);
          c3d = [];
        } else if (temp[ele].tipo == "DEFAULT") {
          c3d.push(generarEtiquetaJSON(vLabel[ele]));
          ambR = rAmbActual();
          vc = v.concat(generarST("BREAK", etiqSalida, ambR));
          c3d.push(agregarAmbito("DEFAULT"));
          imprimirC3(c3d);
          c3d = [];
          generate(temp[ele].instrucciones, vc);
          c3d.push(eliminarA());
          imprimirC3(c3d);
          c3d = [];
        }
      }
    }
    c3d = [];
    c3d.push(generarEtiquetaJSON(etiqSalida));
    imprimirC3(c3d);
  } else {
    erroresCI.push(exp);
  }
}

function evaluarExpSwitch(exp) {
  var c3d = [];
  var etiq;
  if (exp.tipo == "C3D") {
    if (exp.tipoDato == "BOOLEAN") {
      c3d = c3d.concat(exp.codigo3d);
      var t = rTemporal();
      var etiqS = rLabel();
      c3d.push(generarEtiquetaJSON(exp.etiqueta[0].lbV));
      c3d.push(generoC3(t, "", 1, ""));
      c3d.push(generarGoto(etiqS));
      c3d.push(generarEtiquetaJSON(exp.etiqueta[0].lbF));
      c3d.push(generoC3(t, "", 0, ""));
      c3d.push(generarEtiquetaJSON(etiqS));
      imprimirC3(c3d);
      etiq = t;
      c3d = [];
    } else {
      c3d = c3d.concat(exp.codigo3d);
      imprimirC3(c3d);
      etiq = exp.etiqueta;
      c3d = [];
    }
  } else if (exp.tipo == "PRIMITIVO") {
    etiq = exp.valor;
  } else if (exp.tipo == "VARIABLE") {
    var t1 = rTemporal();
    var t2 = rTemporal();
    c3d.push(generoC3("s", "", exp.inicioAmb, ""));
    c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
    c3d.push(generoC3("s", "", rInicioAmb(), ""));
    c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
    imprimirC3(c3d);
    c3d = [];
    etiq = t2;
  }
  return etiq;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCION PARA C3D DE WHILE /////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarCodigoWhile(exp, v) {
  var c3d = [];
  var lblV;
  var lblF;
  var lblW;
  var vc = [];
  var ambR;
  var ex = leerExpresion(exp.expresion[0]);
  if (ex.tipo != "Error Semantico") {
    if (ex.tipoDato == "BOOLEAN") {
      lblV = ex.etiqueta[0].lbV;
      lblF = ex.etiqueta[0].lbF;
      lblW = rLabel();
      //lblCont = rLabel();
      ambR = rAmbActual();
      vc = v.concat(generarST("CONTINUE", lblW, ambR));
      vc = vc.concat(generarST("BREAK", lblF, ambR));

      c3d.push(generarEtiquetaJSON(lblW));
      c3d = c3d.concat(ex.codigo3d);
      c3d.push(generarEtiquetaJSON(lblV));
      c3d.push(agregarAmbito("WHILE"));
      imprimirC3(c3d);
      c3d = [];
      generate(exp.instrucciones, vc);
      c3d.push(eliminarA());
      c3d.push(generarGoto(lblW));
      c3d.push(generarEtiquetaJSON(lblF));
      imprimirC3(c3d);
      c3d = [];
    } else {
      erroresCI.push(
        gError(
          "En una condicion unicamente aplica el tipo de dato boolean",
          exp.fila,
          exp.columna
        )
      );
    }
  } else {
    erroresCI.push(exp);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCION PARA C3D DE DO-WHILE ///////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarCodigoDoWhile(exp, v) {
  var c3d = [];
  var lblV;
  var lblF;
  var lblDW;
  var vc = [];
  var lblCont;
  var ex = leerExpresion(exp.expresion[0]);
  if (ex.tipo != "Error Semantico") {
    if (ex.tipoDato == "BOOLEAN") {
      lblV = ex.etiqueta[0].lbV;
      lblF = ex.etiqueta[0].lbF;
      lblDW = rLabel();
      lblCont = rLabel();
      //etiqueta de verdadero
      c3d.push(generarEtiquetaJSON(lblV));
      vc = v.concat(generarST("CONTINUE", lblCont, rAmbActual()));
      vc = vc.concat(generarST("BREAK", lblF, rAmbActual()));
      c3d.push(agregarAmbito("DO-WHILE"));
      imprimirC3(c3d);
      c3d = [];
      // instrucciones que tra el dowhile
      generate(exp.instrucciones, vc);
      c3d.push(eliminarA());
      c3d.push(generarEtiquetaJSON(lblDW));
      imprimirC3(c3d);
      c3d = [];
      //INSTRUCCIONES DE  LA CONDICION
      c3d.push(generarEtiquetaJSON(lblCont));
      c3d = c3d.concat(ex.codigo3d);
      imprimirC3(c3d);
      c3d = [];
      //etiqueta de salida
      c3d.push(generarEtiquetaJSON(lblF));
      imprimirC3(c3d);
      c3d = [];
    } else {
      erroresCI.push(
        gError(
          "Unicamente se permiten expresiones de tipo boolean en una condicion para Do-While",
          ex.fila,
          ex.columna
        )
      );
    }
  } else {
    erroresCI.push(ex);
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCION PARA C3D DE FOR ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarCodigoFor(exp, v, variableAux) {
  var c3d = [];
  var inicioFor = exp.inicio;
  var condicion;
  var finFor = exp.fin;
  var lblV;
  var lblF;
  var lblFor;
  var lblCont;
  var vc = [];
  var ambA;
  c3d.push(agregarAmbito("FOR"));
  imprimirC3(c3d);
  c3d = [];

  ambA = rAmbActual();
  if (inicioFor.tipo == "DECLARACION") {
    declaracion(inicioFor.contenido, inicioFor.modificador);
  } else if (inicioFor.tipo == "ASIGNACION") {
    asignacionVariables(inicioFor);
  } else if (inicioFor.tipo == "VALOR") {
    if (inicioFor.tipoDato == "IDENTIFICADOR") {
      var valId = buscarVModificar(inicioFor, inicioFor.identificador);
      if (valId.tipo == "Error Semantico") {
        erroresCI.push(valId);
        return;
      }
    }
  }

  if (variableAux != undefined) {
    declaracion(variableAux.contenido, "let");
  }

  condicion = leerExpresion(exp.expresion[0]);
  if (condicion.tipo != "Error Semantico") {
    if (condicion.tipoDato == "BOOLEAN") {
      lblFor = rLabel();
      lblCont = rLabel();
      c3d.push(generarEtiquetaJSON(lblFor));
      c3d = c3d.concat(condicion.codigo3d);
      lblV = condicion.etiqueta[0].lbV;
      lblF = condicion.etiqueta[0].lbF;
      vc = v.concat(generarST("CONTINUE", lblCont, ambA));
      vc = vc.concat(generarST("BREAK", lblF, ambA));
      c3d.push(generarEtiquetaJSON(lblV));
      c3d.push(agregarAmbito("INSTRUCCIONES FOR"));
      imprimirC3(c3d);
      c3d = [];
      generate(exp.instrucciones, vc);
      c3d.push(eliminarA());
      c3d.push(generarEtiquetaJSON(lblCont));
      imprimirC3(c3d);
      c3d = [];
      if (finFor.tipo == "ASIGNACION") {
        asignacionVariables(finFor);
      }
      c3d.push(generarGoto(lblFor));
      c3d.push(generarEtiquetaJSON(lblF));
      imprimirC3(c3d);
      c3d = [];
    } else {
      erroresCI.push(
        gError(
          "En la condicion del for unicamente se permiten tipos booleanos",
          exp.fila,
          exp.columna
        )
      );
    }
  } else {
    erroresCI.push(condicion);
    return;
  }
  c3d.push(eliminarA());
  imprimirC3(c3d);
  c3d = [];
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCION PARA C3D DE FORIN //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generarCodigoForIn(exp, varV) {
  var mod = exp.contenido.modificador;
  if (mod != undefined) {
    //cuando trae declaracion
    var id = exp.contenido.identificador;
    var v = exp.contenido.vector;
    if (buscarVariable(v)) {
      var gF = prototipoFIN(id, v, exp.instrucciones, exp.fila, exp.columna);
      generarCodigoFor(gF, varV, undefined);
    } else {
      erroresCI.push(
        gError(
          "El vector que desea recorrer no esta declarado",
          exp.fila,
          exp.columna
        )
      );
    }
  } else {
    //cuando es solo un identificador
    //prototipoFINA
    var id = exp.contenido.identificador;
    var v = exp.contenido.vector;
    if (buscarVariable(id)) {
      if (buscarVariable(v)) {
        var gF = prototipoFINA(id, v, exp.instrucciones, exp.fila, exp.columna);
        generarCodigoFor(gF, varV);
      } else {
        erroresCI.push(
          gError(
            "El vector que desea recorrer no esta declarado -> " + v,
            exp.fila,
            exp.columna
          )
        );
      }
    } else {
      erroresCI.push(
        gError("Variable no declarada -> " + id, exp.fila, exp.columna)
      );
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCION PARA C3D DE FOROF //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generarCodigoForOf(exp, vectorBre) {
  var mod = exp.contenido.modificador;
  if (mod != undefined) {
    //cuando trae declaracion
    var id = exp.contenido.identificador;
    var v = exp.contenido.vector;
    if (buscarVariable(v)) {
      var vector = buscarVModificar(exp, v);
      var gF = prototipoFOF(id, v, exp.instrucciones, exp.fila, exp.columna);
      var variableAux = declaracionVOF(
        id,
        vector.tipoDato,
        exp.fila,
        exp.columna
      );
      generarCodigoFor(gF, vectorBre, variableAux);
    } else {
      erroresCI.push(
        gError(
          "El vector que desea recorrer no esta declarado",
          exp.fila,
          exp.columna
        )
      );
    }
  } else {
    //cuando es solo un identificador
    //prototipoFINA
    var id = exp.contenido.identificador;
    var v = exp.contenido.vector;
    if (buscarVariable(id)) {
      if (buscarVariable(v)) {
        var variable = buscarVModificar(exp, id);
        var vector = buscarVModificar(exp, v);
        if (
          cambiarTNumber(variable.tipoDato) == cambiarTNumber(vector.tipoDato)
        ) {
          var gF = prototipoFOF(
            id,
            v,
            exp.instrucciones,
            exp.fila,
            exp.columna
          );
          generarCodigoFor(gF, vectorBre, undefined);
        } else {
          erroresCI.push(
            gError(
              "La variable a la que desea asignar el valor del for of, no corresponde el tipo con el vector -> " +
                v,
              exp.fila,
              exp.columna
            )
          );
        }
      } else {
        erroresCI.push(
          gError(
            "El vector que desea recorrer no esta declarado -> " + v,
            exp.fila,
            exp.columna
          )
        );
      }
    } else {
      erroresCI.push(
        gError("Variable no declarada -> " + id, exp.fila, exp.columna)
      );
    }
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////FUNCION QUE IMPRIME CODIGO DE 3 DIRECCIONES EN TEXTAREA /////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function imprimirC3(v) {
  //console.log(v);
  var cad = TraduccionTP.getValue();
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
      cad += element.id + "(" + ");\n";
    } else if (element.tipo == "LLC3DMOD") {
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
      //IF CON ELEMENTOS DE UN SOLO VALOR
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
//////////////////////////////FUNCION QUE GENERA SENTENCIAS DE TRANSFERENCIA/////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function generarCodigoST(vc, tpST, fil, col) {
  var c3d = [];
  for (var element = vc.length - 1; element >= 0; element--) {
    if (vc[element].tipo == tpST) {
      c3d.push(generoC3("s", "", vc[element].ambitoR, ""));
      c3d.push(generarGoto(vc[element].label));
      return c3d;
    }
  }
  return gError(tpST + " en instruccion no valida", fil, col);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////FUNCIONES PARA METODOS STRING /////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//CUANDO ES UNA CADENA
function metodoStringC(exp) {
  //console.log(exp);
  var c3d = [];
  var cad = leerExpresion(exp.cadena);
  if (cad.tipo != "Error Semantico") {
    if (cad.tipoDato == "CADENA") {
      var cod = mString(cad.etiqueta, exp.contenido);
      if (cod.tipo != "Error Semantico") {
        c3d = c3d.concat(cad.codigo3d);
        c3d = c3d.concat(cod.codigo3d);
        return gC3D("CADENA", cod.etiqueta, c3d);
      } else {
        return cod;
      }
    } else {
      return gError(
        "Tipo de dato no compatible con un metodo string",
        exp.fila,
        exp.columna
      );
    }
  } else {
    return cad;
  }
}

//CUANDO ES UN ID
function metodoStringI(exp) {
  var c3d = [];
  var id = leerExpresion(exp.identificador);
  if (id.tipo == "VARIABLE") {
    if (id.tipoDato == "CADENA") {
      var t1 = rTemporal();
      var t2 = rTemporal();
      c3d.push(generoC3("s", "", id.inicioAmb, ""));
      c3d.push(generoC3(t1, "s", id.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
      c3d.push(generoC3("s", "", rInicioAmb(), ""));
      c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
      var cod = mString(t2, exp.contenido);
      if (cod.tipo != "Error Semantico") {
        c3d = c3d.concat(cod.codigo3d);
        return gC3D("CADENA", cod.etiqueta, c3d);
      } else {
        return cod;
      }
    } else {
      return gError(
        "Tipo de dato no compatible con un metodo string",
        exp.fila,
        exp.columna
      );
    }
  } else {
    return id;
  }
}
//CUANDO ES UNA EXPRESION
function metodoStringE(exp) {
  var c3d = [];
  var etiq;
  var ex = leerExpresion(exp.expresion[0]);
  if (ex.tipo != "Error Semantico") {
    if (ex.tipoDato == "CADENA") {
      c3d = c3d.concat(ex.codigo3d);
      etiq = ex.etiqueta;
      var cod = mString(etiq, exp.contenido);
      if (cod.tipo != "Error Semantico") {
        c3d = c3d.concat(cod.codigo3d);
        return gC3D("CADENA", cod.etiqueta, c3d);
      } else {
        return cod;
      }
    } else {
      return gError(
        "Tipo de dato no compatible con un metodo string",
        exp.fila,
        exp.columna
      );
    }
  } else {
    return ex;
  }
}

function mString(etiqueta, cont) {
  var c3d = [];
  var m;
  var eti = etiqueta;
  var exp;
  for (var element of cont) {
    if (element.tipo == "CONCAT") {
      exp = leerExpresion(element.contenido[0]);
      if (exp.tipo != "Error Semantico") {
        if (
          exp.tipoDato == "CADENA" &&
          (exp.tipo == "C3D" || exp.tipo == "VARIABLE")
        ) {
          if (exp.tipo == "C3D") {
            c3d = c3d.concat(exp.codigo3d);
            m = generarConcat(etiqueta, exp.etiqueta);
          } else if (exp.tipo == "VARIABLE") {
            var t1 = rTemporal();
            var t2 = rTemporal();
            c3d.push(generoC3("s", "", exp.inicioAmb, ""));
            c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
            c3d.push(generoC3("s", "", rInicioAmb(), ""));
            c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
            m = generarConcat(etiqueta, t2);
          }
          c3d = c3d.concat(m.codigo3d);
          eti = m.etiqueta;
          etiqueta = eti;
        } else {
          return gError(
            "Tipo de dato no compatible con metodo string concat",
            element.fila,
            element.columna
          );
        }
      } else {
        return exp;
      }
    } else if (element.tipo == "TOUPPERCASE") {
      var p = generarToUpperCase(eti);
      c3d = c3d.concat(p.codigo3d);
      eti = p.etiqueta;
      etiqueta = eti;
    } else if (element.tipo == "TOLOWERCASE") {
      var p = generarToLowerCase(eti);
      c3d = c3d.concat(p.codigo3d);
      eti = p.etiqueta;
      etiqueta = eti;
    } else if (element.tipo == "CHARAT") {
      exp = leerExpresion(element.contenido[0]);
      if (exp.tipo != "Error Semantico") {
        if (exp.tipoDato == "ENTERO") {
          var val;
          if (exp.tipo == "VARIABLE") {
            var t1 = rTemporal();
            var t2 = rTemporal();
            c3d.push(generoC3("s", "", exp.inicioAmb, ""));
            c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
            c3d.push(generoC3("s", "", rInicioAmb(), ""));
            c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
            val = t2;
          } else if (exp.tipo == "PRIMITIVO") {
            val = exp.valor;
          }
          var p = generarCharAt(eti, val);
          c3d = c3d.concat(p.codigo3d);
          eti = p.etiqueta;
          etiqueta = eti;
        } else {
          return gError(
            "Indice no valido con metodo string charat",
            element.fila,
            element.columna
          );
        }
      } else {
        return exp;
      }
    }
  }
  return gC3D("CADENA", eti, c3d);
}

function generarLength(exp) {
  var c3d = [];
  if (exp.tipo == "LENGTHC") {
    var cad = leerExpresion(exp.cadena);
    if (cad.tipo != "Error Semantico") {
      if (cad.tipoDato == "CADENA") {
        c3d = c3d.concat(cad.codigo3d);
        var cod = gC3DLength(cad.etiqueta);
        c3d = c3d.concat(cod.codigo3d);
        return gC3D("ENTERO", cod.etiqueta, c3d);
      } else {
        return gError(
          "Tipo de dato no compatible con un metodo string length",
          exp.fila,
          exp.columna
        );
      }
    } else {
      return cad;
    }
  } else if (exp.tipo == "LENGTHI") {
    var cad = leerExpresion(exp.identificador);
    if (cad.tipo != "Error Semantico") {
      if (cad.tipoDato == "CADENA" && cad.tipo == "VARIABLE") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        c3d.push(generoC3("s", "", cad.inicioAmb, ""));
        c3d.push(generoC3(t1, "s", cad.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        c3d.push(generoC3("s", "", rInicioAmb(), ""));
        c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        var cod = gC3DLength(t2);
        c3d = c3d.concat(cod.codigo3d);
        return gC3D("ENTERO", cod.etiqueta, c3d);
      } else if (cad.tipo == "ARRAY") {
        var t1 = rTemporal();
        var t2 = rTemporal();
        c3d.push(generoC3("s", "", cad.inicioAmb, ""));
        c3d.push(generoC3(t1, "s", cad.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        c3d.push(generoC3("s", "", rInicioAmb(), ""));
        c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        var cod = gC3DLength(t2);
        c3d = c3d.concat(cod.codigo3d);
        return gC3D("ENTERO", cod.etiqueta, c3d);
      } else {
        return gError(
          "Tipo de dato no compatible con un metodo string length",
          exp.fila,
          exp.columna
        );
      }
    } else {
      return cad;
    }
  }
}

function gC3DLength(temp) {
  var c3d = [];
  c3d.push(generoC3("m40", "", temp, ""));
  c3d.push(gLL("length", ""));
  return gC3D("ENTERO", "m43", c3d);
}

function generarConcat(tmp1, tmp2) {
  //console.log(tmp1);
  //console.log(tmp2);
  var cod = [];
  var etiq = rTemporal();
  cod.push(generoC3(etiq, "h", "", ""));
  cod.push(generoC3("h", "h", 1, "+"));
  cod.push(generoC3("m24", "", tmp1, ""));
  cod.push(gLL("cC", ""));
  cod.push(generoC3("m24", "", tmp2, ""));
  cod.push(gLL("cC", ""));
  cod.push(generoC3("heap[(int)" + etiq + "]", "h", etiq, "-"));
  //console.log(cod);
  return gC3D("CADENA", etiq, cod);
}

function generarToUpperCase(tmp) {
  var c3d = [];
  c3d.push(generoC3("m35", "", tmp, ""));
  c3d.push(gLL("toUpperCase", ""));
  return gC3D("CADENA", "m39", c3d);
}

function generarToLowerCase(tmp) {
  var c3d = [];
  c3d.push(generoC3("m29", "", tmp, ""));
  c3d.push(gLL("toLowerCase", ""));
  return gC3D("CADENA", "m33", c3d);
}

function generarCharAt(tmp, indice) {
  var c3d = [];
  c3d.push(generoC3("m44", "", tmp, ""));
  c3d.push(generoC3("m45", "", indice, ""));
  c3d.push(gLL("charAt", ""));
  return gC3D("CADENA", "m50", c3d);
}

function generarObtenerObjeto(element) {
  var c3d = [];
  var id = leerExpresion(element.identificador);
  var tpdVector;
  var etiqueta;
  var etIndice;
  if (id.tipo != "Error Semantico") {
    if (id.tipo == "ARRAY") {
      var exp = leerExpresion(element.contenido[0]);
      if (exp.tipo != "Error Semantico") {
        //guardo el tipo de dato para hacer el retorno
        tpdVector = id.tipoDato;
        //si la expresion esta correcta se saca la posicion del vector
        var t1 = rTemporal();
        var t2 = rTemporal();
        c3d.push(generoC3("s", "", id.inicioAmb, ""));
        c3d.push(generoC3(t1, "s", id.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
        c3d.push(generoC3("s", "", rInicioAmb(), ""));
        c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
        etiqueta = t2;
        // se procede a procesar la expresion
        if (exp.tipoDato == "ENTERO") {
          //se verifica si es
          if (exp.tipo == "VARIABLE") {
            var t1 = rTemporal();
            var t2 = rTemporal();
            c3d.push(generoC3("s", "", exp.inicioAmb, ""));
            c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
            c3d.push(generoC3("s", "", rInicioAmb(), ""));
            c3d.push(generoC3(t2, "", "stack[(int)" + t1 + "]", "")); // se obtiene el valor
            etIndice = t2;
          } else if (exp.tipo == "C3D") {
            c3d = c3d.concat(exp.codigo3d);
            etIndice = exp.etiqueta;
          } else if (exp.tipo == "PRIMITIVO") {
            etIndice = exp.valor;
          }
          var c3dOBJ = gC3DObtObj(tpdVector, etiqueta, etIndice);
          c3d = c3d.concat(c3dOBJ.codigo3d);
          return gC3D(tpdVector, c3dOBJ.etiqueta, c3d);
        } else {
          return gError(
            "Operacion valida unicamente con indices enteros",
            id.fila,
            id.columna
          );
        }
      } else {
        return exp;
      }
    } else {
      return gError(
        "El ciclo for of unicamente es aplicable sobre array",
        id.fila,
        id.columna
      );
    }
  } else {
    return id;
  }
}
////codigo de 3 direcciones de obtener objeto
function gC3DObtObj(tpd, tmp, indice) {
  var c3d = [];
  var eti = "m56";
  if (tpd == "BOOLEAN") {
    var etV = rLabel();
    var etF = rLabel();
    eti = [];
    c3d.push(generoC3("m51", "", tmp, ""));
    c3d.push(generoC3("m52", "", indice, ""));
    c3d.push(gLL("obtenerObj", ""));
    c3d.push(generarIfB("m56", etV));
    c3d.push(generarGoto(etF));
    eti.push({ lbV: etV, lbF: etF });
  } else {
    c3d.push(generoC3("m51", "", tmp, ""));
    c3d.push(generoC3("m52", "", indice, ""));
    c3d.push(gLL("obtenerObj", ""));
  }
  return gC3D(tpd, eti, c3d);
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////FUNCIONES PARA FUNCIONAMIENTO BASICO/////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
function generarST(tp, lblR, ambR) {
  return { tipo: tp, label: lblR, ambitoR: ambR };
}

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
    c3d.push(generoC3("s", "", exp.inicioAmb, ""));
    c3d.push(generoC3(t1, "s", exp.pos, "+")); //se accesa a la variable mediante la posicion guardada en tabla de simbolos
    c3d.push(generoC3("s", "", rInicioAmb(), ""));
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
    ini =
      ambitos[ambitos.length - 1].CantidadE +
      ambitos[ambitos.length - 1].Inicio;
  }
  ambitos.push({ Nombre: nombre, Inicio: ini, CantidadE: 0, DatosAmbito: [] });
  return generoC3("s", "", ini, "");
}
///////////////////////////////////////////////INSERTAR VALOR EN EL AMBITO ACTUAL
function insertarAmbito(nValor) {
  var json = ambitos[ambitos.length - 1];
  json.CantidadE++;
  json.DatosAmbito.push(nValor);
}

function rInicioAmb() {
  if (ambitos.length > 0) {
    return ambitos[ambitos.length - 1].Inicio;
  } else {
    return 0;
  }
}

function rAmbActual() {
  return ambitos[ambitos.length - 1].Inicio;
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PROTOTIPO FOR IN CON DECLARACION

function prototipoFIN(idV, idVector, inst, f, c) {
  var ptFIN = {
    tipo: "FOR",
    inicio: {
      tipo: "DECLARACION",
      modificador: "let",
      contenido: [
        {
          tipo: "VARIABLE",
          identificador: idV,
          tipoDDV: "NUMERO",
          valor: [
            {
              tipo: "PRIMITIVO",
              tipoDato: "ENTERO",
              valor: 0,
              fila: f,
              columna: c,
            },
          ],
          fila: f,
          columna: c,
        },
      ],
    },
    expresion: [
      {
        OpIzq: [
          {
            tipo: "VALOR",
            tipoDato: "IDENTIFICADOR",
            identificador: idV,
            fila: f,
            columna: c,
          },
        ],
        tipo: "<",
        OpDer: {
          tipo: "LENGTHI",
          tipoDato: "CADENA",
          identificador: [
            {
              tipo: "VALOR",
              tipoDato: "IDENTIFICADOR",
              identificador: idVector,
              fila: f,
              columna: c,
            },
          ],
          fila: f,
          columna: c,
        },
      },
    ],
    fin: {
      tipo: "ASIGNACION",
      identificador: [
        {
          tipo: "VALOR",
          tipoDato: "IDENTIFICADOR",
          identificador: idV,
          fila: f,
          columna: c,
        },
      ],
      ope: "++D",
      fila: f,
      columna: c,
    },
    instrucciones: inst,
    fila: f,
    columna: c,
  };
  return ptFIN;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PROTOTIPO FOR IN SIN DECLARACION

function prototipoFINA(idV, idVector, inst, f, c) {
  var p = {
    tipo: "FOR",
    inicio: {
      tipo: "ASIGNACION",
      identificador: [
        {
          tipo: "VALOR",
          tipoDato: "IDENTIFICADOR",
          identificador: idV,
          fila: f,
          columna: c,
        },
      ],
      ope: "=",
      valor: [
        {
          tipo: "PRIMITIVO",
          tipoDato: "ENTERO",
          valor: 0.0,
          fila: f,
          columna: c,
        },
      ],
      fila: f,
      columna: c,
    },
    expresion: [
      {
        OpIzq: [
          {
            tipo: "VALOR",
            tipoDato: "IDENTIFICADOR",
            identificador: idV,
            fila: f,
            columna: c,
          },
        ],
        tipo: "<",
        OpDer: {
          tipo: "LENGTHI",
          tipoDato: "CADENA",
          identificador: [
            {
              tipo: "VALOR",
              tipoDato: "IDENTIFICADOR",
              identificador: idVector,
              fila: f,
              columna: c,
            },
          ],
          fila: f,
          columna: c,
        },
      },
    ],
    fin: {
      tipo: "ASIGNACION",
      identificador: [
        {
          tipo: "VALOR",
          tipoDato: "IDENTIFICADOR",
          identificador: idV,
          fila: f,
          columna: c,
        },
      ],
      ope: "++D",
      fila: f,
      columna: c,
    },
    instrucciones: inst,
    fila: f,
    columna: c,
  };
  return p;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//PROTOTIPO FOR OF CON DECLARACION

function prototipoFOF(idV, idVector, inst, f, c) {
  var instru = [];
  instru = asig(idV, idVector, f, c).concat(inst);
  var p = {
    tipo: "FOR",
    inicio: {
      tipo: "DECLARACION",
      modificador: "let",
      contenido: [
        {
          tipo: "VARIABLE",
          identificador: "ind",
          tipoDDV: "NUMERO",
          valor: [
            {
              tipo: "PRIMITIVO",
              tipoDato: "ENTERO",
              valor: 0,
              fila: f,
              columna: c,
            },
          ],
          fila: f,
          columna: c,
        },
      ],
    },
    expresion: [
      {
        OpIzq: [
          {
            tipo: "VALOR",
            tipoDato: "IDENTIFICADOR",
            identificador: "ind",
            fila: f,
            columna: c,
          },
        ],
        tipo: "<",
        OpDer: {
          tipo: "LENGTHI",
          tipoDato: "ENTERO",
          identificador: [
            {
              tipo: "VALOR",
              tipoDato: "IDENTIFICADOR",
              identificador: idVector,
              fila: f,
              columna: c,
            },
          ],
          fila: f,
          columna: c,
        },
      },
    ],
    fin: {
      tipo: "ASIGNACION",
      identificador: [
        {
          tipo: "VALOR",
          tipoDato: "IDENTIFICADOR",
          identificador: "ind",
          fila: f,
          columna: c,
        },
      ],
      ope: "++D",
      fila: f,
      columna: c,
    },
    instrucciones: instru,
    fila: f,
    columna: c,
  };
  return p;
}

function declaracionVOF(idV, tpd, f, c) {
  var decl = {
    tipo: "DECLARACION",
    modificador: "let",
    contenido: [
      {
        tipo: "VARIABLE",
        identificador: idV,
        tipoDDV: tpd,
        fila: f,
        columna: c,
      },
    ],
  };
  return decl;
}

function asig(idV, idVector, f, c) {
  var p = [
    {
      tipo: "LISTA_ASIGNACION",
      contenido: [
        {
          tipo: "ASIGNACION",
          identificador: [
            {
              tipo: "VALOR",
              tipoDato: "IDENTIFICADOR",
              identificador: idV,
              fila: f,
              columna: c,
            },
          ],
          ope: "=",
          valor: [
            {
              tipo: "OBJ",
              identificador: [
                {
                  tipo: "VALOR",
                  tipoDato: "IDENTIFICADOR",
                  identificador: idVector,
                  fila: f,
                  columna: c,
                },
              ],
              contenido: [
                {
                  tipo: "VALOR",
                  tipoDato: "IDENTIFICADOR",
                  identificador: "ind",
                  fila: f,
                  columna: c,
                },
              ],
              fila: f,
              columna: c,
            },
          ],
        },
      ],
    },
  ];
  return p;
}
