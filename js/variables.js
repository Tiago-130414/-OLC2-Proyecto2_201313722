//VERIFICAR DECLARACION TYPES, VARIABLES, VECTORES
function declaracion(elemento, mod) {
  for (var ele of elemento) {
    if (ele.tipo == "VARIABLE") {
      declaracionVariables(ele, mod);
    }
  }
}

function declaracionVariables(elemento, mod) {
  //console.log(typeof mod);
  console.log(elemento);
  if (!buscarVariable(elemento.identificador)) {
    //CUANDO ES UNA CONSTANTE
    if (mod.toLowerCase() == "const") {
      if (elemento.valor != undefined) {
        var exp = leerExpresion(elemento.valor[0]);
        if (exp.tipo != "Error Semantico") {
          //SI ES UNA EXPRESION VALIDA SE VERIFICAN LOS TIPOS
          if (elemento.tipoDato == exp.tipoDato) {
            console.log("ASIGNACION VALIDA");
          } else {
            console.log("ASIGNACION INVALIDA");
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
  for (var element of ambitos[i]) {
    console.log(element);
    if (element.identificador == idV) {
      return true;
    }
  }
  return false;
}

//FUNCION QUE INICIALIZA VARIABLE

function inicializarVariable(tipo) {}
