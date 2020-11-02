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
  //console.log(typeof mod);
  //console.log(elemento);
  if (!buscarVariable(elemento.identificador)) {
    //CUANDO ES UNA CONSTANTE
    if (mod.toLowerCase() == "const") {
      if (elemento.valor != undefined) {
        var exp = leerExpresion(elemento.valor[0]);
        if (exp.tipo != "Error Semantico") {
          //SI ES UNA EXPRESION VALIDA SE VERIFICAN LOS TIPOS
          exp.tipoDato = cambiarTNumber(exp.tipoDato);
          if (elemento.tipoDato.toLowerCase() == exp.tipoDato.toLowerCase()) {
            console.log("ASIGNACION VALIDA");
            insertarAmbito("va");
          } else {
            //CUANDO LOS TIPOS NO COINCIDEN
            //console.log("ASIGNACION INVALIDA");
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
      console.log("perra");
    }
  } else {
    //ERROR SI EXISTE UNA VARIABLE CON EL MISMO ID EN EL AMBITO ACTUAL
    erroresCI.push({
      tipo: "Error Semantico",
      Error: "variable ya declarada -> " + elemento.identificador,
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
  if (tipo == "NUMBER") {
    return 0;
  } else if (tipo == "BOOLEAN") {
    return "false";
  } else if (tipo == "CADENA") {
    return "null";
  }
}
//FUNCION QUE RETORNA TIPO NUMBER EN DADO CASO SEA TIPO DECIMAL O ENTERO LA EXPRESION
function cambiarTNumber(tp) {
  if (tp == "ENTERO" || tp == "DECIMAL") {
    return "NUMERO";
  }
  return tp;
}
