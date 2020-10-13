/* descripcion: ANALIZADOR DEL LENGUAJE JAVA */
// segmento de codigo, importaciones y todo dentro de 

/*  Directivas lexicas, expresiones regulares ,Analisis Lexico */
%lex
%options flex case-sensitive
%options yylineno
%locations
%%
\s+                   /* salta espacios en blanco */
"//".*               {/* comentario simple*/}
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/] {/*comentario multilinea*/}

/*  CADENAS  */
[\"][^\\\"]*([\\][\\\"ntr][^\\\"]*)*[\"]            {  return 'Cadena'; }
[\'][^\\\']*([\\][\\\'ntr][^\\\']*)*[\']            {  return 'Cadena'; }
[\`][^\\\`]*([\\][\\\`ntr][^\\\`]*)*[\`]            {  return 'Cadena'; }


/*TIPOS DE DATOS*/

"number"                                            {  return 'T_Number';  }
"boolean"                                           {  return 'T_Boolean'; }
"string"                                            {  return 'T_String';  }
"type"                                              {  return 'T_Type';    }
"void"                                              {  return 'T_Void';    }                              

/*PALABRAS RESERVADAS*/

"let"                                               {  return 'R_Let';   }
"const"                                             {  return 'R_Const'; }
"Array"                                             {  return 'R_Array'; }
"push"                                              {  return 'R_Push';  }
"pop"                                               {  return 'R_Pop';   }
"length"                                            {  return 'R_Length';}
"function"                                          {  return 'R_Funcion';}

/*ESTRUCTURAS DE CONTROL*/
"if"                                                {return 'R_If';}
"else"                                              {return 'R_Else';}
"switch"                                            {return 'R_Switch';}
"case"                                              {return 'R_Case';}
"default"                                           {return 'R_Default';}
"for"                                               {return 'R_For';}
"in"                                                {return 'R_In';}
"of"                                                {return 'R_Of';}
"while"                                             {return 'R_While';}
"do"                                                {return 'R_Do';}
"break"                                             {return 'R_Break';}
"continue"                                          {return 'R_Continue';}
"return"                                            {return 'R_Return';}
"console"                                           {return 'R_Console';}
"log"                                               {return 'R_Log';}
"true"                                              {return 'R_True';}    
"false"                                             {return 'R_False';}
"undefined"                                         {return 'R_Undefined';}
"graficar_ts"                                       {return 'R_Graficar';}

/*  EXPRESION */

"++"                                                {return 'OP_Incremento';}
"--"                                                {return 'OP_Decremento';}
"**"                                                {return 'OP_Exponenciacion';}
"+"                                                 {return 'OP_Mas';}
"-"                                                 {return 'OP_Menos';}
"*"                                                 {return 'OP_Multiplicacion';}
"/"                                                 {return 'OP_Division';}
"%"                                                 {return 'OP_Modulo';}

/* OPERADORES RELACIONALES*/

"<="	                                            {return 'REL_MenorIgualQue';}
">="		                                        {return 'REL_MayorIgualQue';}
"=="		                                        {return 'REL_IgualIgual';}
"="                                                 {return 'S_Igual';}
"!="		                                        {return 'REL_Distinto';}
"<"			                                        {return 'REL_MenorQue';}
">"			                                        {return 'REL_MayorQue';}

/*OPERADORES LOGICOS*/

"!"			                                        {return 'LOG_Not';}
"&&"		                                        {return 'LOG_Concatenar';}
"||"		                                        {return 'LOG_OR';}

/*  SIMBOLO */

":"			                                        {return 'S_DosPuntos';}
";"			                                        {return 'S_PuntoComa';}
"{"			                                        {return 'S_LlaveAbre';}
"}"			                                        {return 'S_LlaveCierra';}
"("			                                        {return 'S_ParentesisAbre';}
")"			                                        {return 'S_ParentesisCierra';}
"."                                                 {return 'S_Punto';}
"\'"                                                {return 'S_ComillaSimple';}
","                                                 {return 'S_Coma';}
"\""                                                {return 'S_ComillaDoble';}
"?"                                                 {return 'S_Interrogacion';}
"["                                                 {return 'S_CorcheteAbre';}
"]"                                                 {return 'S_CorcheteCierra';}

/*  NUMEROS */
[0-9]+("."[0-9]+)?\b                                {return 'Decimal';}
[0-9]+\b                                            {return 'Entero';}

/*  IDENTIFICADORES */
([a-zA-Z_])[a-zA-Z0-9_]*                            {return 'Identificador';}
<<EOF>>                                             {  return 'EOF'; }
.                                                   {console.error("error lexico: " + yytext)}
/lex
%{
// funcion que retorna vector de operaciones con 2 operadores
function expresion(valor1, operador, valor2) {
    var json = [];
    json = json.concat(returnVector(valor1));
    json = json.concat(returnVector(operador));
    json = json.concat(returnVector(valor2));
    return json;
}

// funcion que retorna vector de operaciones con 1 operador
function unaria(valor1,valor2){
    var json = [];
    json = json.concat(returnVector(valor1));
    json = json.concat(returnVector(valor2));
    return json;
}

//funcion que retorna 1 vector
function returnVector(val){
    if(Array.isArray(val)==true){
        return val;
    }else{
        return [val];
    }
}

//funcion que desanida funciones anidadas
function recorrerJson(json){
    var instr = [];
    var t = [];
    var fPadre = "";
    var fHijo = "";
    if(json.tipo == "funcion" || json.tipo == "funcionT" ){
        for( var element of json.contenido){
            if(element.tipo == "identificador"){          
                    fPadre = element.contenido;
            }
            if(element.tipo == "instrucciones"){
                for(var ele of element.contenido){
                    var index = element.contenido.indexOf(ele);
                    if(ele.tipo == "funcion"){
                        t.push(ele);
                    }else if(ele.tipo == "funcionT"){
                        t.push(ele);
                    }else{
                        instr.push(ele);
                    }
                }   
                if(t.length != 0){
                  recV(fPadre,t,instr);
                }      
                element.contenido = instr;
                break;
            }
        }
    }
    if(t.length == 0){
        return json;
    }else{
        return t.concat([json]);
    }
}

//funcion que recorre vector de funciones desanidadas
function recV (idP ,t,instr){
    for(var element of t){
        var fH = element.contenido[0].contenido;
        for(var e of t){
            recursiva(idP,fH,e);
        }

        for(var el of instr){
            recursiva(idP,fH,el);
        }
    }
}

//funcion que busca llamadas a funciones de la funcion padre
function recursiva(idP ,idB ,arbol){
    if(arbol.tipo == "identificador"){
        if(arbol.contenido == idB){
            arbol.contenido = idP+"_"+arbol.contenido;
        }
    }else{
        if(Array.isArray(arbol.contenido)){
            for(var e of arbol.contenido){
                recursiva(idP,idB,e);
            }
        }
    }
}

//funcion que analiza el json formado de funciones anidadas para generar traduccion
function traducir(json){
    var traduccion = ""
    for(var element of json){
        if(element.tipo == "funcion"){
            traduccion += tFuncion(element)
        }else if(element.tipo == "funcionT"){
            traduccion += tFuncionT(element)
        }else if(element.tipo == "variable_let"){
            traduccion += decVariable(element, "let ");
        }else if(element.tipo == "variable_const"){
            traduccion += decVariable(element , "const ");
        }else if(element.tipo == "asignacion"){
            traduccion += asignacionV(element);
        }else if(element.tipo == "type"){
            traduccion += typesTraduccion(element);
        }else if(element.tipo == "contenidoGlobal"){
            traduccion += traducir(element.contenido);
        }else if(element.tipo == "llamadaF"){
            traduccion += llamadasFuncion(element);
        }else if(element.tipo == "graficar"){
            traduccion += graficarTs();
        }else if(element.tipo == "imprimir"){
            traduccion += imprimirConsole(element.contenido) ;
        }else if(element.tipo == "break"){
            traduccion += "break;\n"
        }else if(element.tipo == "continue"){
            traduccion += "continue;\n"
        }else if(element.tipo == "return"){
            traduccion += "return;\n"
        }else if(element.tipo == "returnE"){
            traduccion += rConValor(element.contenido);
        }else if(element.tipo == "while"){
            traduccion += eWhile(element.contenido);
        }else if(element.tipo == "doWhile"){
            traduccion += eDoWhile(element.contenido)
        }else if(element.tipo == "for"){
            traduccion += eFor(element.contenido);
        }else if(element.tipo == "ForOf"){
            traduccion += eForOf(element.contenido);
        }else if(element.tipo == "ForIn"){
            traduccion += eForIn(element.contenido);
        }else if(element.tipo == "switch"){
            traduccion += eSwitch(element.contenido);
        }else if(element.tipo == "condicionalIf"){
            traduccion += eIf(element.contenido);
        }
    }
    return traduccion;
}

//funcion que retorna funcion para traduccion
function tFuncion(f){
    var cad= "";
    var par = "";
    var inst ="";
    par = parametros(f.contenido[1].contenido);
    inst = traducir(f.contenido[2].contenido);
    cad += "function " + f.contenido[0].contenido  + "(" + par +  "){\n";
    cad += inst;
    cad += "}\n\n";
    return cad;
}

//funcion que retorna funcion con tipo para traduccion
function tFuncionT(f){
    var cad= "";
    var par = "";
    var inst ="";
    par = parametros(f.contenido[1].contenido);
    inst = traducir(f.contenido[3].contenido);
    cad += "function " + f.contenido[0].contenido  + "(" + par +  ") : "+ f.contenido[2].contenido +"{\n";
    cad += inst;
    cad += "}\n\n";
    return cad;
}

//funcion que retorna parametros para traduccion
function parametros(f){
    var cad = "";
    for(var element of f){
        if(element.tipo == "parametro"){
            for(var ele of element.contenido){
                if(ele.tipo == "expresion"){
                    for(var e of ele.contenido){
                        cad += e.contenido;
                    }
                }else{
                    cad += ele.contenido;
                }
            }
        }else if(element.tipo == "concatenar"){
            cad += element.contenido + " ";
        }
    }
    return cad;
}

// funcion que retorna declaracion de variables para traduccion
function decVariable (f, tip){
    var cad = tip;
    for(var ele of f.contenido){
        if(ele.tipo == "expresion"){
            for(var e of ele.contenido){
                cad+= e.contenido;
            }
        }else{
            cad+= ele.contenido;
        }
    }
    cad+= "\n";
    return cad;
}

// funcion que retorna asignacion de valores para la traduccion
function asignacionV (f){
    var cad = "";
    for(var element of f.contenido){
        cad += element.contenido;
    }
    cad += "\n";
    return cad;
}

// funcion que retorna declaracion de types para la traduccion
function typesTraduccion (f){
    var cad = "";
    for(var element of f.contenido){
        cad += element.contenido;
    }
    cad += "\n";
    return cad;
}

//funcion que retorna las llamadas a funcion para la traduccion
function llamadasFuncion(f){
    var cad = "";
    for(var element of f.contenido){
        cad += element.contenido;
    }
    cad += "\n";
    return cad;
}

//funcion que retorna la funcion graficar para la traduccion
function graficarTs(){
    var cad = "graficar_ts();\n"
    return cad;
}

//funcion que retorna la funcion imprimir para la traduccion
function imprimirConsole(f){
    var cad = "console.log(";
    for(var element of f ){
        cad += element.contenido;
    }
    cad += ");\n";
    return cad;
}

//funcion que devuelve el return con valor para traduccion
function rConValor(f){
    var cad = "return "
    for(var element of f){
        if(element.tipo == "expresion"){
            for(var ele of element.contenido){
                cad += ele.contenido;
            }
        }
    }
    cad += ";\n";
    return cad;
}

//funcion que devuelve el while para traduccion
function eWhile(f){
    cad ="\nwhile( ";
    for(var element of f){
        if(element.tipo == "condicionWhile"){
            for(var ele of element.contenido){
                cad += ele.contenido;
            }
            cad +=" ){\n";
        }else if(element.tipo == "estructuras"){
            cad += traducir(element.contenido);
        }
    }
    cad +="}\n";
    return cad;
}

//funcion que devuelve el dowhile para traduccion
function eDoWhile(f){
    var cad = "\ndo{\n";
    for(var element of f){
        if(element.tipo == "estructuras"){
            cad += traducir(element.contenido);
            cad += "}while( "
        }else if(element.tipo == "condicionDoWhile"){
            for(var e of element.contenido){
                cad += e.contenido;
            }
        }
    }
    cad += " );\n"
    return cad;
}

//funcion que devuelve el for para traduccion
function eFor(f){
    var cad = "\nfor( ";
    for(var element of f){
        if(element.tipo == "inicioFor"){
            for(var ele of element.contenido){
                if(ele.tipo == "expresion"){
                    for(var e of ele.contenido){
                        cad += e.contenido; 
                    }
                }else{
                    cad+=ele.contenido;
                }
            }
        }else if(element.tipo == "condicionFor"){
            for(var ele of element.contenido){
                cad += ele.contenido;
            }
            cad += "; ";
        }else if(element.tipo == "finFor"){
            for(var ele of element.contenido){
                cad += ele.contenido;
            }
            cad+=" ){\n"
        }else if(element.tipo == "estructuras"){
            cad += traducir(element.contenido);
        }
    }
    cad+= "}\n";
    return cad;
}

function eForIn(f){
    var cad = "\nfor( ";
    for(var element of f){
        if(element.tipo == "condicionForIn"){
            for(var ele of element.contenido){
                cad += ele.contenido;
            }
            cad += " ){\n";
        }else if(element.tipo == "estructuras"){
            cad += traducir(element.contenido);
        }

    }
    cad += "}\n";
    return cad;
}

function eForOf(f){
    var cad = "\nfor( ";
    for(var element of f){
        if(element.tipo == "condicionForOf"){
            for(var ele of element.contenido){
                cad += ele.contenido;
            }
            cad += " ){\n";
        }else if(element.tipo == "estructuras"){
            cad += traducir(element.contenido);
        }
    }
    cad += "}\n"
    return cad;
}

function eSwitch(f){
    var cad = "switch( ";
    for(var element of f){
        if(element.tipo == "expresion"){
            for(var e of element.contenido){
                cad += e.contenido;
            }
            cad += " ){\n"
        }else if(element.tipo == "case"){
            cad += "case ";
            for(var ele of element.contenido){
                if(ele.tipo == "expresion"){
                    for(var p of ele.contenido){
                        cad += p.contenido
                    }
                }else if(ele.tipo == "concatenar"){
                    cad += ele.contenido;
                }else if(ele.tipo == "estructuras"){
                    cad += traducir(ele.contenido);
                }
            }
        }else if(element.tipo == "default"){
            cad += "default :\n"
            for(var ele of element.contenido){
                if(ele.tipo == "estructuras"){
                    cad+= traducir(ele.contenido);
                }
            }
        }
    }
    cad += "}\n";
    return cad;
}

function eIf(f){
    var cad = "";
    for(var element of f){
        if(element.tipo ==  "if"){
            cad += "if( ";
            for(var ele of element.contenido){
                if(ele.tipo == "condicionIf"){
                    for(var e of ele.contenido){
                        cad += e.contenido
                    }
                    cad += " )\n{\n"
                }else if(ele.tipo == "estructuras"){
                    cad += traducir(ele.contenido);
                }
            }
        }else if(element.tipo ==  "elseIf"){
            cad += "}\nelse if( ";
            for(var ele of element.contenido){
                if(ele.tipo == "condicionIf"){
                    for(var e of ele.contenido){
                        cad += e.contenido
                    }
                    cad += " )\n{\n"
                }else if(ele.tipo == "estructuras"){
                    cad += traducir(ele.contenido);
                }
            }
        }else if(element.tipo == "else"){
            cad += "}\nelse\n{\n";
            for(var ele of element.contenido){
                if(ele.tipo == "estructuras"){
                    cad += traducir(ele.contenido);
                }
            }
        }
    }
    cad += "}\n";
    return cad;
}

%}

//PRECEDENCIA DE OPERADORES
//prescedencia operadores logicos
%left 'LOG_Concatenar' 'LOG_OR'
//prescedencia operadores relcionales
%left 'REL_IgualIgual' 'REL_Distinto' 'REL_MayorIgualQue' 'REL_MayorQue' 'REL_MenorIgualQue' 'REL_MenorQue'
//prescedencia operadores aritmeticos
%left 'OP_Mas' 'OP_Menos'
%left 'OP_Multiplicacion' 'OP_Division' 
%left 'OP_Exponenciacion' 'OP_Modulo'
%left UMINUS PRUEBA
%start INICIO

%%
INICIO : CONT EOF {var t = { tipo : "contenidoGlobal" , contenido : $1};console.log(t);return traducir($1);}
;
/*---------------------------------------------LISTA DE CONTENIDO GLOBAL---------------------------------------------------------*/
CONT: LISTA_CONTENIDO 
    |                                                           {$$ = [];}
;

LISTA_CONTENIDO : CONTENIDO LISTA_CONTENIDO_PRIM                {$$ = $2;}               
;

LISTA_CONTENIDO_PRIM : CONTENIDO LISTA_CONTENIDO_PRIM          {$$ = $2;} 
                    |                                           {
                                                                var pila = eval('$$');
                                                                var valSintetizar = pila[pila.length - 1 ];
                                                                $$ = valSintetizar;
                                                                }
;

//CONTENIDO GLOBAL
CONTENIDO : FUNCIONES                   { 
                                        var pila = eval('$$');
                                        //console.log(pila);
                                        var anterior = pila[pila.length - 2]; 
                                        if(Array.isArray(anterior)){
                                            var temp = anterior.concat($1);
                                            //console.log(temp);
                                        }else{
                                            if(Array.isArray($1)){
                                                var temp = $1;
                                                //console.log(temp);
                                            }else{

                                                var temp  = [$1];
                                                //console.log(temp);
                                            }
                                        }
                                        $$ = temp;
                                        }
          | ESTRUCTURAS_DE_CONTROL      { 
                                        var pila = eval('$$');
                                        //console.log(pila);
                                        var anterior = pila[pila.length - 2];  
                                        if(Array.isArray(anterior)){
                                            var temp = anterior.concat($1);
                                        }else{
                                            if(Array.isArray($1)){
                                                var temp = $1;
                                            }else{
                                                var temp  = [$1];
                                            }
                                        }
                                        $$ = temp;
                                        }
          |  error  {$$ ='';console.log({ Tipo_Error  : ' Error_Sintactico ', Error  : yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;
/*---------------------------------------------DEFINICION DE FUNCIONES---------------------------------------------------------*/
FUNCIONES : R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_LlaveAbre CONT S_LlaveCierra {var json  = { tipo: "funcion" , contenido : [{tipo : "identificador", contenido : $2},{tipo : "parametros", contenido : $4},{tipo : "instrucciones", contenido : $7}]};$$ =recorrerJson(json);}//contenido : [$7]
          | R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_DosPuntos TIPOS_DE_DATO S_LlaveAbre CONT S_LlaveCierra {var json = {tipo : "funcionT" ,contenido : [{tipo : "identificador", contenido : $2},{tipo : "parametros", contenido : $4},{tipo : "tipoDato", contenido : $7},{tipo : "instrucciones", contenido : $9}] }; $$ =recorrerJson(json);}
          | R_Let Identificador S_Igual R_Funcion S_ParentesisAbre PARAM S_ParentesisCierra TIPAR_FUNCION S_LlaveAbre CONT S_LlaveCierra S_PuntoComa //{var json = {tipo : "funcion" ,contenido : [{tipo : "concatenar", contenido :$1} , {tipo : "identificador", contenido :$2},{tipo : "concatenar", contenido :$3},{tipo : "concatenar", contenido :$4},{tipo : "concatenar", contenido :$5},{tipo : "parametros", contenido :$6},{tipo : "concatenar", contenido :$7},{tipo : "concatenar", contenido :$8},{tipo : "concatenar", contenido :$9},{tipo : "instrucciones", contenido :$10},{tipo : "concatenar", contenido :$11},{tipo : "concatenar", contenido :$12}] }; $$ = json;}
          | R_Const Identificador S_Igual R_Funcion S_ParentesisAbre PARAM S_ParentesisCierra TIPAR_FUNCION S_LlaveAbre CONT S_LlaveCierra S_PuntoComa //{var json = {tipo : "funcion" ,contenido : [{tipo : "concatenar", contenido :$1} , {tipo : "identificador", contenido :$2},{tipo : "concatenar", contenido :$3},{tipo : "concatenar", contenido :$4},{tipo : "concatenar", contenido :$5},{tipo : "parametros", contenido :$6},{tipo : "concatenar", contenido :$7},{tipo : "concatenar", contenido :$8},{tipo : "concatenar", contenido :$9},{tipo : "instrucciones", contenido :$10},{tipo : "concatenar", contenido :$11},{tipo : "concatenar", contenido :$12}] }; $$ = json;}
;
/*---------------------------------------------LISTADO DE ESTRUCTURAS DE CONTROL---------------------------------------------------------*/
EDD:LISTADO_ESTRUCTURAS                 {$$ = {tipo : "estructuras" , contenido : $1};}
   |                                    {$$ = {tipo : "estructuras" , contenido : []};}
;

LISTADO_ESTRUCTURAS : LISTADO_ESTRUCTURAS CONT_ESTRUCTURAS_CONTROL          {$1.push($2);$$ = $1;}
                    | CONT_ESTRUCTURAS_CONTROL                              {$$ = [$1];}
;

CONT_ESTRUCTURAS_CONTROL : ESTRUCTURAS_DE_CONTROL
                         | error  {$$ ='';console.log({ Tipo_Error  : ' Error_Sintactico ', Error  : yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;

ESTRUCTURAS_DE_CONTROL: VARIABLES                       //ya se realizo su traduccion
                      | ASIGNACION                      //ya se realizo su traduccion
                      | LISTADO_IF ELSE                 {var json = $1; json =  json.concat($2) ;$$ = {tipo : "condicionalIf" , contenido : json };}
                      | SWITCH                          //ya se realizo su traduccion
                      | IMPRIMIR                        //ya se realizo su traduccion
                      | WHILE                           //ya se realizo su traduccion
                      | DO_WHILE                        //ya se realizo su traduccion
                      | FOR                             // ya se realizo su traduccion
                      | FOR_OF                          // ya se realizo su traduccion
                      | FOR_IN                          // ya se realizo su traduccion
                      | SENTENCIAS_TRANSFERENCIA        //ya se realio su traduccion
                      | FUNCION_GRAFICAR                //ya se realizo su traduccion
                      | LLAMADA_FUNC                    //ya se realizo su traduccion
                      | TYPES                           //ya se realizo su traduccion
;
/*--------------------------------------------- FUNCIONES NATIVAS ---------------------------------------------------------*/
FUNCION_GRAFICAR : R_Graficar S_ParentesisAbre S_ParentesisCierra S_PuntoComa                 {$$ = {tipo : "graficar" , contenido : []};}
;
/*--------------------------------------------- SENTENCIAS DE TRANSFERENCIA ---------------------------------------------------------*/

SENTENCIAS_TRANSFERENCIA : R_Break S_PuntoComa                                                  {$$ = {tipo : "break" , contenido : []};}
                         | R_Continue S_PuntoComa                                               {$$ = {tipo : "continue" , contenido : []};}
                         | R_Return S_PuntoComa                                                 {$$ = {tipo : "return" , contenido : []};}
                         | R_Return EXPRESION_G S_PuntoComa                                     {var exp = returnVector($2);var json = [{tipo : "expresion" , contenido : exp}];$$ = {tipo : "returnE" , contenido : json};}
;

/*--------------------------------------------- LISTADO IF---------------------------------------------------------*/
LISTADO_IF : LISTADO_IF R_Else IF                                                               {var json = $1;var temp = [{ tipo : "elseIf" , contenido : $3}]; json = json.concat(temp);$$ = json;}
           | IF                                                                                 {$$ = [{ tipo : "if" , contenido : $1}];}
;

IF : R_If S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra         {var exp ; if(Array.isArray($3)){exp = $3;}else{exp = [$3];} ;var json = [{tipo : "condicionIf" , contenido : exp},$6];$$ =json;}
;

ELSE : R_Else S_LlaveAbre EDD S_LlaveCierra                                                     {var json = [{tipo : "else" , contenido : [$3]}];$$ = json;}
     |                                                                                          {$$ = [];}
;

/*---------------------------------------------SWITCH---------------------------------------------------------*/
SWITCH : R_Switch S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre CASE DEFINIR_DEFAULT S_LlaveCierra    {var exp ; if(Array.isArray($3)){exp = $3;}else{exp = [$3];} ;var json = [{tipo : "expresion" , contenido : exp}]; json = json.concat($6);json = json.concat($7);$$ = {tipo : "switch" , contenido : json};}            
;

/*---------------------------------------------LISTADO DE CASE---------------------------------------------------------*/

CASE : LISTA_CASE                                                   
     |                                                                              {$$ = [];}
;

LISTA_CASE: LISTA_CASE DEFINIR_CASE                                                 {var json = $1; json = json.concat($2);$$ = json;}
          | DEFINIR_CASE                                                            {$$ = [$1];}
;

DEFINIR_CASE:R_Case EXPRESION_G S_DosPuntos EDD                                     {var exp ; if(Array.isArray($2)){exp = $2;}else{exp = [$2];} ;var json = [{tipo : "expresion" , contenido : exp} , {tipo : "concatenar" , contenido : " " + $3 + "\n"} ,$4]; $$ = {tipo : "case" , contenido : json};}
;
/*---------------------------------------------DEFINICION DE DEFAULT---------------------------------------------------------*/

DEFINIR_DEFAULT: R_Default S_DosPuntos EDD                                          {$$ = [{tipo : "default" , contenido : [$3]}];}
               |                                                                    {$$ = [];}
;
/*---------------------------------------------IMPRIMIR---------------------------------------------------------*/
IMPRIMIR: R_Console S_Punto R_Log S_ParentesisAbre FUNC S_ParentesisCierra S_PuntoComa {$$ = {tipo : "imprimir" , contenido : $5 };}
;

FUNC: EXPRESION_G       {var json; if(Array.isArray($1)){json = $1;}else{json = [$1];};$$ = json;}
    |                   {$$=[];}
;
/*---------------------------------------------WHILE---------------------------------------------------------*/
WHILE: R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                            { var exp = returnVector($3) ; var json = [{ tipo : "condicionWhile" , contenido : exp} , $6 ]; $$ = {tipo : "while" , contenido : json}; }
;
/*---------------------------------------------DO-WHILE---------------------------------------------------------*/
DO_WHILE: R_Do S_LlaveAbre EDD S_LlaveCierra R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_PuntoComa        {var exp ; if(Array.isArray($7)){exp = $7;}else{exp = [$7];} ;var json = [$3 , { tipo : "condicionDoWhile" , contenido : exp}]; $$ = {tipo : "doWhile" , contenido : json};}
;

/*---------------------------------------------FOR---------------------------------------------------------*/
FOR : R_For S_ParentesisAbre CONT_FOR EXPRESION_G S_PuntoComa FIN_FOR S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra {var exp ; if(Array.isArray($4)){exp = $4;}else{exp = [$4];} ; var json = [{tipo : "inicioFor" , contenido : $3},{tipo : "condicionFor" , contenido : exp},{tipo : "finFor" , contenido : $6},$9]; $$ = {tipo : "for" , contenido : json}; } 
;

CONT_FOR
    : R_Let Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G S_PuntoComa                                     {var exp = returnVector($6); var json = [{tipo : "variable_let" , contenido : $1},{tipo : "identificador" , contenido : $2},{tipo : "concatenar" , contenido : $3},{tipo : "tipoDato" , contenido : $4},{tipo : "concatenar" , contenido : " " + $5+ " "},{tipo : "expresion" , contenido : exp},{tipo : "concatenar" , contenido : $7 +" "}];$$=json;}
    | R_Let Identificador S_Igual EXPRESION_G S_PuntoComa                                                               {var exp = returnVector($4);var json = [{tipo : "variable_let", contenido : $1},{tipo : "identificador" , contenido : $2},{tipo : "concatenar" , contenido : " "+$3+" "},{tipo : "expresion" , contenido : exp},{tipo : "concatenar" , contenido : $5}]; $$ = json;}
    | Identificador S_PuntoComa                                                                                         { var json = [{tipo : "identificador", contenido : $1},{tipo : "concatenar" , contenido : $2}];$$ = json;}
    | Identificador S_Igual EXPRESION_G S_PuntoComa                                                                     {var exp = returnVector($3);var json = [{tipo : "identificador", contenido : $1},{tipo : "concatenar" , contenido : " " + $2 + " "},{tipo : "expresion" , contenido : exp},{tipo : "concatenar" , contenido : $4}];$$ = json;}
;

FIN_FOR
    : Identificador S_Igual EXPRESION_G                                                { var exp = returnVector($3);var  json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "expresion" , contenido : exp}]; $$ = json;}
    | Identificador OP_Incremento                                                      { var  json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2}]; $$ = json;}
    | OP_Incremento Identificador                                                      { var  json = [{tipo : "concatenar" , contenido : $1},{tipo : "identificador" , contenido : $2}]; $$ = json;} 
    | Identificador OP_Decremento                                                      { var  json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2}]; $$ = json;}
    | OP_Decremento Identificador                                                      { var  json = [{tipo : "concatenar" , contenido : $1},{tipo : "identificador" , contenido : $2}]; $$ = json;}                        
    ;
/*---------------------------------------------FOR IN---------------------------------------------------------*/

FOR_IN: R_For S_ParentesisAbre CONT_FOR_IN S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra         {var json = [{tipo : "condicionForIn" , contenido : $3},$6];$$ = {tipo : "ForIn" , contenido : json};}
;

CONT_FOR_IN : R_Const Identificador R_In Identificador                                              {var json = [{tipo : "variable_const" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2 + " "},{tipo : "concatenar" , contenido : $3 + " "},{tipo : "identificador" , contenido : $4}];$$ = json;}
            | R_Let Identificador R_In Identificador                                                {var json = [{tipo : "variable_let" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2 + " "},{tipo : "concatenar" , contenido : $3 + " "},{tipo : "identificador" , contenido : $4}];$$ = json;}
            | Identificador R_In Identificador                                                      {var json = [{tipo : "identificador" , contenido : $1 + " "},{tipo : "concatenar" , contenido : $2 + " "},{tipo : "identificador" , contenido : $3 + " "}];$$ = json;}
;


/*---------------------------------------------FOR OF---------------------------------------------------------*/
FOR_OF: R_For S_ParentesisAbre CONT_FOR_OF S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra         {var json = [{tipo : "condicionForOf" , contenido : $3},$6];$$ = {tipo : "ForOf" , contenido : json};}
;

CONT_FOR_OF : R_Const Identificador R_Of Identificador                                              {var json = [{tipo : "variable_const" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2 + " "},{tipo : "concatenar" , contenido : $3 + " "},{tipo : "identificador" , contenido : $4}];$$ = json;}
            | R_Let Identificador R_Of Identificador                                                {var json = [{tipo : "variable_let" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2 + " "},{tipo : "concatenar" , contenido : $3 + " "},{tipo : "identificador" , contenido : $4}];$$ = json;}
            | Identificador R_Of Identificador                                                      {var json = [{tipo : "identificador" , contenido : $1 + " "},{tipo : "concatenar" , contenido : $2 + " "},{tipo : "identificador" , contenido : $3 + " "}];$$ = json;}
;

/*---------------------------------------------ASIGNACION VARIABLES---------------------------------------------------------*/

ASIGNACION : ATRIBUTOS S_Igual LISTA_DE_ASIGNACIONES S_PuntoComa                        {var json = $1; json.push({tipo : "concatenar" , contenido : " " + $2 + " "}); json = json.concat($3);json.push({tipo : "concatenar" , contenido : $4});$$ = {tipo : "asignacion" , contenido : json};}
           //incrementos 
           | ATRIBUTOS OP_Incremento COMPLETAR_ASIGNACION S_PuntoComa                   {var json = $1; json.push({tipo : "concatenar" , contenido : $2}); json = json.concat($3);json.push({tipo : "concatenar" , contenido : $4});$$ = {tipo : "asignacion" , contenido : json};}
           | OP_Incremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                   {var json = [{tipo : "concatenar", contenido : $1}]; json = json.concat($2);json = json.concat($3);json.push({tipo : "concatenar" , contenido : $4});$$ = {tipo : "asignacion" , contenido : json};}
           | ATRIBUTOS OP_Decremento COMPLETAR_ASIGNACION S_PuntoComa                   {var json = $1; json.push({tipo : "concatenar" , contenido : $2}); json = json.concat($3);json.push({tipo : "concatenar" , contenido : $4});$$ = {tipo : "asignacion" , contenido : json};}
           | OP_Decremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                   {var json = [{tipo : "concatenar", contenido : $1}]; json = json.concat($2); json = json.concat($3);json.push({tipo : "concatenar" , contenido : $4});$$ = {tipo : "asignacion" , contenido : json};}
           | ATRIBUTOS S_Punto R_Push S_ParentesisAbre LISTA_DE_ASIGNACIONES S_ParentesisCierra COMPLETAR_ASIGNACION S_PuntoComa {var json = $1; json.push({tipo : "concatenar" , contenido : $2});json.push({tipo : "concatenar" , contenido : $3});json.push({tipo : "concatenar" , contenido : $4}); json = json.concat($5); json.push({ tipo : "concatenar" , contenido : $6});json = json.concat($7);json.push({ tipo : "concatenar" , contenido : $8}); $$ = {tipo : "asignacion" , contenido : json};}
;

COMPLETAR_ASIGNACION : LISTADO_ASIGNACION
                      |                                                     {$$ = [];}
;

LISTADO_ASIGNACION: LISTADO_ASIGNACION  CONTENIDO_ASIGNACION                {var json = $1; json = json.concat($2);$$ = json;}
                  | CONTENIDO_ASIGNACION                                    {$$ = $1;}
;

CONTENIDO_ASIGNACION: S_Coma Identificador S_Igual EXPRESION_G              { var json = [{tipo : "concatenar" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2},{tipo : "concatenar" , contenido : " " + $3 + " "}]; json = json.concat($4);$$ = json;}
                    | S_Coma Identificador OP_Incremento                    { var json = [{tipo : "concatenar" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2},{tipo : "concatenar" , contenido : $3}];$$ = json;}
                    | S_Coma OP_Incremento Identificador                    { var json = [{tipo : "concatenar" , contenido : $1 + " "},{tipo : "concatenar"    , contenido : $2},{tipo : "identificador" , contenido : $3}]; $$ = json;}
                    | S_Coma Identificador OP_Decremento                    { var json = [{tipo : "concatenar" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2},{tipo : "concatenar" , contenido : $3}];$$ = json;}
                    | S_Coma OP_Decremento Identificador                    { var json = [{tipo : "concatenar" , contenido : $1 + " "},{tipo : "concatenar"    , contenido : $2},{tipo : "identificador" , contenido : $3}]; $$ = json;}
                    | S_Coma ATRIBUTOS S_Punto R_Push S_ParentesisAbre LISTA_DE_ASIGNACIONES S_ParentesisCierra {var json = [{tipo : "concatenar" , contenido : $1 + " "}].concat($2); json.push({tipo : "concatenar" , contenido : $3}); json.push({tipo : "concatenar" , contenido : $4}); json.push({tipo : "concatenar" , contenido : $5}); json = json.concat($6) ; json.push({tipo : "concatenar" , contenido : $7});$$ = json;}
;

LISTA_DE_ASIGNACIONES : EXPRESION_G                                             {$$ = $1;}
                      | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra         {var json = []; json.push({tipo : "concatenar" , contenido : $1});json = json.concat($2);json.push({tipo : "concatenar" , contenido : $3}); $$ = json;}
                      | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra       {var json = []; json.push({tipo : "concatenar" , contenido : $1});json = json.concat($2);json.push({tipo : "concatenar" , contenido : $3}); $$ = json;}
;
/*---------------------------------------------LISTA DE CORCHETES PARA MATRIZ Y ARRAY---------------------------------------------------------*/
///LISTA CORCHETES SIN VALOR
L_CORCHETE : L_C                                                            
;

L_C: L_C LISTA_CORCHETE                                                             {var json = $1; json = json.concat($2);$$ = json;}
    |LISTA_CORCHETE                                                                 {$$ = $1;}
;

/*LISTA PARA DECLARACIONES*/
LISTA_CORCHETE : S_CorcheteAbre S_CorcheteCierra                                    {$$ = [{tipo : "concatenar" , contenido : "[]" }];}
;
///LISTA CORCHETES CON VALOR
L_CORCHETE_V : L_C_V
;

L_C_V : L_C_V LISTA_AS_MV                                                           {var json = $1; json = json.concat($2);$$ = json;}
      | LISTA_AS_MV                                                                 {$$ = $1;}
;

/*LISTA PARA ASIGNACIONES MATRIZ Y VECTOR*/
LISTA_AS_MV: S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra                        {var json = [{tipo : "concatenar" , contenido : $1}].concat($2); json.push({tipo : "concatenar" , contenido : $3});$$ = json;}
;
/*---------------------------------------------LISTA DE ASIGNACION ARRAY DENTRO DE ARRAY---------------------------------------------------------*/
CONT_ASIG_ARRAY: LISTA_ASIGN_ARRAY
               |                                                            {$$ = [];}
;

LISTA_ASIGN_ARRAY: LISTA_ASIGN_ARRAY S_Coma CONT_ARRAY_ASIGN_VV             {var json = [] ; $1.push({tipo : "concatenar" , contenido : $2 + " "}); json = $1.concat($3); $$ = json;}
                 | CONT_ARRAY_ASIGN_VV                                      {var val; if(Array.isArray($1)){val = $1;}else{val = [$1];};$$ = val;}
;   

CONT_ARRAY_ASIGN_VV: EXPRESION_G                                            {$$ = $1;}
                   | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra        {var json = []; json.push({tipo : "concatenar" , contenido : $1});json = json.concat($2);json.push({tipo : "concatenar" , contenido : $3}); $$ = json;}
                   | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra      {var json = []; json.push({tipo : "concatenar" , contenido : $1});json = json.concat($2);json.push({tipo : "concatenar" , contenido : $3}); $$ = json;}
;


/*---------------------------------------------VARIABLES---------------------------------------------------------*/

VARIABLES : R_Let LISTADO_VAR S_PuntoComa                       {var json = []; json = json.concat($2); json.push({tipo : "concatenar" , contenido : $3}); $$ = {tipo : "variable_let" , contenido : json};}
          | R_Const LISTADO_VAR S_PuntoComa                     {var json = []; json = json.concat($2); json.push({tipo : "concatenar" , contenido : $3}); $$ = {tipo : "variable_const" , contenido : json};}
;

/*---------------------------------------------LISTADO VARIABLES---------------------------------------------------------*/

LISTADO_VAR : LISTADO_VAR S_Coma CONT_VAR                       {$1.push({tipo : "concatenar" , contenido : $2 +" "});var json = $1.concat($3);$$ = json;}
            | CONT_VAR                                          {$$ = $1;}
;
/*--------------------------------------------- DEFINICION DE VARIABLES---------------------------------------------------------*/

CONT_VAR: Identificador /*declaracion de variable solo id*/                                                                         {$$ = [{tipo : "identificador" ,contenido : $1}];}
        | Identificador S_DosPuntos TIPOS_DE_DATO  /*declaracion de variable con tipo de dato*/                                     {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : $2},{tipo : "tipoDato" ,contenido : $3}];$$ = json;}
        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G   /*declaracion de variable con tipo y asignacion de valor*/  {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : $2},{tipo : "tipoDato" ,contenido : $3},{tipo : "tipoDato" ,contenido : " " + $4 + " "}];json = json.concat($5);$$ = json;}
        | Identificador S_Igual EXPRESION_G /*declaracion de variable con asignacion de valor*/                                     {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : " " + $2 + " "}];json = json.concat($3);$$ = json;}


        | Identificador S_Igual S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra /*array*/                                            {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : " " + $2 + " "},{tipo : "concatenar" ,contenido : $3}]; json = json.concat($4);json.push({tipo : "concatenar" ,contenido : $5});$$ = json;}
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE/*array*/                                                            {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : $2},{tipo : "tipoDato" ,contenido : $3},{tipo : "concatenar" ,contenido : $4}];$$ = json;}
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual L_CORCHETE_V /*array*/                                       {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : $2},{tipo : "tipoDato" ,contenido : $3},{tipo : "concatenar" ,contenido : $4},{tipo : "concatenar" ,contenido : " " + $5 + " "},{tipo : "expresion" ,contenido : $6}];$$ = json;}


        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/                                 {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : $2},{tipo : "tipoDato" ,contenido : $3},{tipo : "concatenar" ,contenido : " " + $4 + " "},{tipo : "concatenar" ,contenido : $5}];json = json.concat($6);json.push({tipo : "concatenar" ,contenido : $7});$$ = json;}
        | Identificador S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/                                                           {var json = [{tipo : "identificador" ,contenido : $1},{tipo : "concatenar" ,contenido : " " + $2 + " "},{tipo : "concatenar" ,contenido : $3}]; json = json.concat($4);json.push({tipo : "concatenar" ,contenido : $5});$$=json;}
;

/*---------------------------------------------LLAMADAS A FUNCION---------------------------------------------------------*/

LLAMADA_FUNC
    : Identificador S_ParentesisAbre PARAMETROS_FUNC S_ParentesisCierra S_PuntoComa         {var temp = []; temp.push({tipo : "identificador" , contenido : $1});temp.push({tipo : "concatenar" , contenido : $2}); temp = temp.concat($3);temp.push({tipo : "concatenar" , contenido : $4});temp.push({tipo : "concatenar" , contenido : $5});$$ = { tipo : "llamadaF" , contenido : temp};}
    | ATRIBUTOS S_Punto R_Pop S_ParentesisAbre S_ParentesisCierra S_PuntoComa               {var json = $1; json.push({tipo : "concatenar" , contenido : $2});json.push({tipo : "concatenar" , contenido : $3});json.push({tipo : "concatenar" , contenido : $4});json.push({tipo : "concatenar" , contenido : $5});json.push({tipo : "concatenar" , contenido : $6});$$ = {tipo : "llamadaF" , contenido : json};}
;

PARAMETROS_FUNC
    : PARAMETROS_FUNC S_Coma EXPRESION_G                                    {var json = $1; json.push({tipo : "concatenar" , contenido : $2 + " "}); json = json.concat($3);$$ = json;}
    | EXPRESION_G                                                           {var json;if(Array.isArray($1)){json = $1;}else{json = [$1]};$$ = json;}
    |                                                                       {$$ = [];}
;

/*---------------------------------------------PARAMETROS---------------------------------------------------------*/
PARAM: LISTA_PARAMETROS
     |                                                  {$$=[];}
;

LISTA_PARAMETROS : LISTA_PARAMETROS S_Coma PARAMETROS  {$1.push({tipo:"concatenar",contenido : $2 + " "});$1.push($3); $$ = $1;}
                 | PARAMETROS {$$=[$1];}              
;

PARAMETROS : Identificador S_DosPuntos TIPOS_DE_DATO                                            {var json = {tipo : "parametro" , contenido : [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "tipoDato" , contenido : $3}]} ; $$ = json;}
           | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual LISTA_DE_ASIGNACIONES              {var json = {tipo : "parametro" , contenido : [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "tipoDato" , contenido : $3},{tipo : "concatenar" , contenido : $4},{tipo : "expresion" , contenido : $5}]} ; $$ = json;}
           | Identificador S_Interrogacion S_DosPuntos TIPOS_DE_DATO                            {var json = {tipo : "parametro" , contenido : [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "concatenar" , contenido : $3},{tipo : "tipoDato" , contenido : $4}]} ; $$ = json;}
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE                                 {var json = {tipo : "parametro" , contenido : [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "tipoDato" , contenido : $3}].concat($4)} ; $$ = json;}
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual LISTA_DE_ASIGNACIONES   {var json = {tipo : "parametro" , contenido : [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "tipoDato" , contenido : $3}].concat($4)} ;json.push({tipo : "concatenar" , contenido : $5}); json.push({tipo : "expresion" , contenido : $6});$$ = json;}
           | Identificador S_Interrogacion S_DosPuntos TIPOS_DE_DATO L_CORCHETE                 {var json = {tipo : "parametro" , contenido : [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "concatenar" , contenido : $3},{tipo : "tipoDato" , contenido : $4}].concat($5)} ; $$ = json;}
;
/*---------------------------------------------TYPES---------------------------------------------------------*/


TYPES: T_Type Identificador S_Igual S_LlaveAbre LISTA_TYPES FIN_TYPES                                       {var json = [{tipo : "concatenar" , contenido : $1 + " "},{tipo : "identificador" , contenido : $2 + " "},{tipo : "concatenar" , contenido : " " + $3 + " "},{tipo : "concatenar" , contenido : $4 + "\n"}]; json = json.concat($5);json = json.concat($6); $$ = {tipo : "type" , contenido : json};}
;

LISTA_TYPES: LISTA_TYPES SEPARADOR CONTENIDO_TYPES                                                          {var json = []; $1.push($2);json = $1.concat($3);$$ = json;}
           | CONTENIDO_TYPES                                                                                {$$=$1;}
;

CONTENIDO_TYPES : Identificador S_DosPuntos TIPOS_DE_DATO                                                   {var json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "tipoDato" , contenido : $3}];$$ = json;}       
                | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE                                        {var json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "tipoDato" , contenido : $3}].concat($4);$$ = json;}
;

SEPARADOR : S_Coma                                                                                          {$$  = {tipo : "concatenar", contenido : $1 + "\n"};}
          | S_PuntoComa                                                                                     {$$  = {tipo : "concatenar", contenido : $1 + "\n"};}
;

FIN_TYPES: S_LlaveCierra S_PuntoComa                                                                        {var json = [{tipo : "concatenar", contenido : "\n" +  $1},{tipo : "concatenar", contenido : $2 + "\n"}];$$=json;}
         | S_LlaveCierra                                                                                    {$$ = [{tipo : "concatenar", contenido : "\n" + $1 + "\n"}];}
;

/*---------------------------------------------DECLARACION DE TYPES---------------------------------------------------------*/
LISTA_DECLARACION_TYPES: LISTA_DECLARACION_TYPES SEPARADOR_DECLARACION_TYPES CONTENIDO_DECLARACION_TYPES        {var json = $1;json.push($2); json = json.concat($3);$$ =json;}
                        | CONTENIDO_DECLARACION_TYPES                                                           {$$ = $1;}
;

CONTENIDO_DECLARACION_TYPES : Identificador S_DosPuntos LISTA_DE_ASIGNACIONES                                   {var json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2}].concat($3);$$ = json;}
;

SEPARADOR_DECLARACION_TYPES : S_Coma                                                                            {$$ = {tipo : "concatenar" , contenido : $1};}
                            | S_PuntoComa                                                                       {$$ = {tipo : "concatenar" , contenido : $1};}
;

/*---------------------------------------------TIPOS DE DATO---------------------------------------------------------*/
// ESTO NO SE MODIFICA PARA RETORNAR VALORES PARA FORMAR JSON
TIPOS_DE_DATO : T_Number                                                                        
              | T_Boolean                                                                       
              | T_String                                                                        
              | T_Void                                                                          
              | Identificador                                                                  
;
//agrega tipos de dato a funciones anonimas
TIPAR_FUNCION : S_DosPuntos TIPOS_DE_DATO                                                       
              |
;
/*---------------------------------------------ACCEDER A ATRIBUTOS---------------------------------------------------------*/

 ATRIBUTOS: ATRIBUTOS S_Punto CONT_ATRIBUTOS                                                    {var json = $1 ; json.push({tipo : "concatenar" , contenido : $2});json = json.concat($3);$$=json;}
          | CONT_ATRIBUTOS                                                                      {$$ = $1;}
 ;

 CONT_ATRIBUTOS:  Identificador L_CORCHETE_V                                                    { var json = [{tipo : "identificador" , contenido : $1}].concat($2); $$ = json;}
               |  Identificador                                                                 {var json  = [{tipo : "identificador" , contenido : $1}]; $$ = json;}
;

/*---------------------------------------------EXPRESIONES---------------------------------------------------------*/
EXPRESION_G 
    : EXPRESION_G LOG_Concatenar EXPRESION_G                                                     { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G LOG_OR EXPRESION_G                                                             { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G REL_IgualIgual EXPRESION_G                                                     { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G REL_MayorIgualQue EXPRESION_G                                                  { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G REL_MayorQue EXPRESION_G                                                       { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G REL_MenorIgualQue EXPRESION_G                                                  { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G REL_MenorQue EXPRESION_G                                                       { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G REL_Distinto EXPRESION_G                                                       { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}     
    | EXPRESION_G OP_Mas EXPRESION_G                                                             { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G OP_Menos EXPRESION_G                                                           { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G OP_Multiplicacion EXPRESION_G                                                  { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G OP_Division EXPRESION_G                                                        { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G OP_Exponenciacion EXPRESION_G                                                  { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | EXPRESION_G OP_Modulo EXPRESION_G                                                          { $$ = expresion($1,{ tipo : "concatenar", contenido : " " + $2 + " "},$3);}
    | CONTENIDO_EXPRESION OP_Decremento %prec PRUEBA                                             { $$ = unaria($1,{ tipo : "concatenar", contenido : $2 +" "}); }
    | CONTENIDO_EXPRESION OP_Incremento %prec PRUEBA                                             { $$ = unaria($1,{ tipo : "concatenar", contenido : $2 +" "}); }
    | OP_Decremento CONTENIDO_EXPRESION                                                          { $$ = unaria({ tipo : "concatenar", contenido : $1},$2); }
    | OP_Incremento CONTENIDO_EXPRESION                                                          { $$ = unaria({ tipo : "concatenar", contenido : $1},$2); }
    | OP_Menos  CONTENIDO_EXPRESION     %prec UMINUS                                             { $$ = unaria({ tipo : "concatenar", contenido : $1},$2); }
    | LOG_Not   CONTENIDO_EXPRESION     %prec UMINUS                                             { $$ = unaria({ tipo : "concatenar", contenido : $1},$2); }
    | CONTENIDO_EXPRESION
;

 CONTENIDO_EXPRESION
    : Entero                                                                                    {var json  = {tipo : "valor" , contenido : $1}; $$ = json;}
    | Decimal                                                                                   {var json  = {tipo : "valor" , contenido : $1}; $$ = json;}
    | R_True                                                                                    {var json  = {tipo : "valor" , contenido : $1}; $$ = json;}
    | R_False                                                                                   {var json  = {tipo : "valor" , contenido : $1}; $$ = json;}
    | Cadena                                                                                    {var json  = {tipo : "valor" , contenido : $1}; $$ = json;}
    | Identificador S_ParentesisAbre S_ParentesisCierra                                         { var json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2},{tipo : "concatenar" , contenido : $3}]; $$ = json;}
    | Identificador S_ParentesisAbre OPCIONAL S_ParentesisCierra                                { var json = [{tipo : "identificador" , contenido : $1},{tipo : "concatenar" , contenido : $2}]; var temp = json.concat($3); temp.push({tipo : "concatenar" , contenido : $4}); $$ = temp;}
    | S_ParentesisAbre EXPRESION_G S_ParentesisCierra                                           { $$ = expresion({ tipo : "concatenar", contenido : $1},$2,{ tipo : "concatenar", contenido : $3});}                                                               
    | ATRIBUTOS                                                                                 {$$ = $1;}
    | ATRIBUTOS S_Punto R_Length                                                                {$1.push({tipo : "concatenar" , contenido : $2 });$1.push({tipo : "concatenar" , contenido : $3 });$$=$1;}
    | ATRIBUTOS S_Punto R_Pop S_ParentesisAbre S_ParentesisCierra                               {$1.push({tipo : "concatenar" , contenido : $2 });$1.push({tipo : "concatenar" , contenido : $3 });$1.push({tipo : "concatenar" , contenido : $4 });$1.push({tipo : "concatenar" , contenido : $5 });$$=$1;}
; /*ATRIBUTOS CONTIENE ID Y VECTOR */

OPCIONAL 
    : OPCIONAL S_Coma EXPRESION_G                                                               {var json = $1 ;json.push({tipo : "concatenar" , contenido : $2 + " "}); json = json.concat($3);$$ = json;}                                                              
    | EXPRESION_G                                                                               {var json ; if(Array.isArray($1)){json = $1;}else{json = [$1];} ;$$ = json;}
; 