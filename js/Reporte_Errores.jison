/* descripcion: ANALIZADOR DEL LENGUAJE JAVA */
// segmento de codigo, importaciones y todo dentro de 
%{
    var tablaErrores = [];
%}
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
[\"][^\\\"]*([\\][\\\"ntr][^\\\"]*)*[\"]            {  yytext = yytext.substr(1,yyleng-2);return 'Cadena'; }
[\'][^\\\']*([\\][\\\'ntr][^\\\']*)*[\']            {  yytext = yytext.substr(1,yyleng-2);return 'Cadena'; }
[\`][^\\\`]*([\\][\\\`ntr][^\\\`]*)*[\`]            {  yytext = yytext.substr(1,yyleng-2);return 'Cadena'; }


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
"graficar_ts"                                       {  return 'R_Graficar';}

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

/*  EXPRESION */

"++"                                                {return 'OP_Incremento';}
"--"                                                {return 'OP_Decremento';}
"+"                                                 {return 'OP_Mas';}
"-"                                                 {return 'OP_Menos';}
"**"                                                {return 'OP_Exponenciacion';}
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
[0-9]+('.'[0-9]+)?\b                                {return 'Decimal';}
[0-9]+\b                                            {return 'Entero';}
/*  IDENTIFICADORES */
([a-zA-Z_])[a-zA-Z0-9_]*                            {return 'Identificador';}
<<EOF>>                                             {  return 'EOF'; }
.                                                   {tablaErrores.push({tipo: 'Error_Lexico',Error : 'Simbolo desconocido: ' + yytext , Fila  : yylloc.first_line , Columna  :  yylloc.first_column });}
/lex
//PRECEDENCIA DE OPERADORES
%{
    function limpiarErrores(){
        tablaErrores = [];
    }

    function operacionB(operadorIzq, operadorDer, tipo) {
        return {
            opIzq: operadorIzq,
            opDer: operadorDer,
            tipo: tipo,
        };
    }

    function operacionU(operador, tipo) {
        return {
            opIzq: operador,
            opDer: {tipo : "UNDEFINED",valor : undefined},
            tipo: tipo
        };
    }

    function valor(tipo,valor ,fil){
        return { 
            tipo : tipo, 
            valor : valor,
            fila : fil
        };
    }

%}
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
INICIO : CONT EOF{console.log($1);var temp = tablaErrores; limpiarErrores(); return {Arbol : $1 , Errores : temp};}
;
/*---------------------------------------------LISTA DE CONTENIDO GLOBAL---------------------------------------------------------*/
CONT: LISTA_CONTENIDO
    |
;

LISTA_CONTENIDO : LISTA_CONTENIDO CONTENIDO                         {$1.push($2);$$=$1;}
                | CONTENIDO                                         {$$ = [$1];}
;

//CONTENIDO GLOBAL
CONTENIDO : FUNCIONES
          | ESTRUCTURAS_DE_CONTROL
          |  error  {$$ ='';tablaErrores.push({ tipo  : ' Error_Sintactico ', Error  : 'Simbolo inesperado: ' + yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;
/*---------------------------------------------DEFINICION DE FUNCIONES---------------------------------------------------------*/

FUNCIONES : R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                                             {$$ = { tipoInstruccion : "FUNCIONSTR" , identificador : [valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,tipoDato : undefined , parametros : $4 , instrucciones : $7 , fila : this._$.first_line};}
          | R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_DosPuntos TIPOS_DE_DATO S_LlaveAbre EDD S_LlaveCierra                   {$$ = { tipoInstruccion : "FUNCIONCTR" , identificador : [valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,tipoDato : $7,parametros : $4 , instrucciones : $9, fila : this._$.first_line};}
          | R_Let Identificador S_Igual R_Funcion S_ParentesisAbre PARAM S_ParentesisCierra TIPAR_FUNCION S_LlaveAbre EDD S_LlaveCierra S_PuntoComa     //{$$ = { tipoInstruccion : "FUNCIONSTP" , nombre : $2 , parametros : $4 , instrucciones : $7};}
          | R_Const Identificador S_Igual R_Funcion S_ParentesisAbre PARAM S_ParentesisCierra TIPAR_FUNCION S_LlaveAbre EDD S_LlaveCierra S_PuntoComa   //{$$ = { tipoInstruccion : "FUNCIONSTP" , nombre : $2 , parametros : $4 , instrucciones : $7};}
          
;
/*---------------------------------------------LISTADO DE ESTRUCTURAS DE CONTROL---------------------------------------------------------*/
EDD:LISTADO_ESTRUCTURAS
   |                                                                        {$$ = [];}
;

LISTADO_ESTRUCTURAS : LISTADO_ESTRUCTURAS CONT_ESTRUCTURAS_CONTROL          {$1.push($2);$$ = $1;}
                    | CONT_ESTRUCTURAS_CONTROL                              {$$ = [$1];}
;

CONT_ESTRUCTURAS_CONTROL : ESTRUCTURAS_DE_CONTROL
                         | error  {$$ ='';tablaErrores.push({ tipo  : ' Error_Sintactico ', Error  : 'Simbolo inesperado: ' + yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;

ESTRUCTURAS_DE_CONTROL: VARIABLES
                      | ASIGNACION
                      | LISTADO_IF ELSE                                 {var vec = $1.concat($2);$$ = {tipoInstruccion : "LISTADO_IF" , contenido : vec};}
                      | SWITCH
                      | IMPRIMIR
                      | WHILE
                      | DO_WHILE
                      | FOR
                      | FOR_OF
                      | FOR_IN
                      | SENTENCIAS_TRANSFERENCIA
                      | FUNCION_GRAFICAR
                      | LLAMADA_FUNC
                      | TYPES
                      

;
/*--------------------------------------------- FUNCIONES NATIVAS ---------------------------------------------------------*/
FUNCION_GRAFICAR : R_Graficar S_ParentesisAbre S_ParentesisCierra S_PuntoComa                {$$ = {tipoInstruccion : "GRAFICARTS" , contenido : []};}
;

/*--------------------------------------------- SENTENCIAS DE TRANSFERENCIA ---------------------------------------------------------*/

SENTENCIAS_TRANSFERENCIA : R_Break S_PuntoComa                                               {$$ = {tipoInstruccion : "BREAK" , contenido : [] , fila : this._$.first_line };}
                         | R_Continue S_PuntoComa                                            {$$ = {tipoInstruccion : "CONTINUE" , contenido : [], fila : this._$.first_line};}
                         | R_Return S_PuntoComa                                              {$$ = {tipoInstruccion : "RETURN" , contenido : valor("UNDEFINED", undefined,this._$.first_line), fila : this._$.first_line};}
                         | R_Return EXPRESION_G S_PuntoComa                                  {var exp;if(Array.isArray($2)){exp = $2;}else{exp = [$2];};$$ = {tipoInstruccion : "RETURN_V" , contenido : exp, fila : this._$.first_line};}
;

/*--------------------------------------------- LISTADO IF---------------------------------------------------------*/
LISTADO_IF : LISTADO_IF R_Else IF                                                                   {$1.push($3);$$ = $1;}
           | IF                                                                                     {$$ = [$1];}
;

IF : R_If S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra             {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};$$ = {tipoInstruccion : "IF" ,condicion : exp, instrucciones : $6};}
;

ELSE : R_Else S_LlaveAbre EDD S_LlaveCierra                                                         {$$ = [{tipoInstruccion : "ELSE" , instrucciones : $3 }];}
     |                                                                                              {$$ = [];}
;

/*---------------------------------------------SWITCH---------------------------------------------------------*/
SWITCH : R_Switch S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre CASE DEFINIR_DEFAULT S_LlaveCierra        {var cont = $6.concat($7);var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];}; $$ = {tipoInstruccion : "SWITCH" , condicion : exp , contenido : cont , fila :this._$.first_line };}
;

/*---------------------------------------------LISTADO DE CASE---------------------------------------------------------*/

CASE : LISTA_CASE                                           
     |                                                      {$$ = [];}
;

LISTA_CASE: LISTA_CASE DEFINIR_CASE                         {$1.push($2);$$ = $1;}
          | DEFINIR_CASE                                    {$$ = [$1];}
;

DEFINIR_CASE:R_Case EXPRESION_G S_DosPuntos EDD             {var exp;if(Array.isArray($2)){exp = $2;}else{exp = [$2];};$$ = {tipoInstruccion : "CASE" , condicion : exp , instrucciones : $4 , fila : this._$.first_line};}
;
/*---------------------------------------------DEFINICION DE DEFAULT---------------------------------------------------------*/

DEFINIR_DEFAULT: R_Default S_DosPuntos EDD                  {$$ = [{tipoInstruccion : "DEFAULT" , instrucciones : $3 , fila : this._$.first_line}];}
               |                                            {$$ = [];}
;
/*---------------------------------------------IMPRIMIR---------------------------------------------------------*/
IMPRIMIR: R_Console S_Punto R_Log S_ParentesisAbre FUNC S_ParentesisCierra S_PuntoComa                              {$$ = {tipoInstruccion : "CONSOLE" , contenido : $5};}
;

FUNC: EXPRESION_G                                                                                                    {$$ = $1;}                                
    |                                                                                                               
;   
/*---------------------------------------------WHILE---------------------------------------------------------*/
WHILE: R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                        {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];}; $$ = {tipoInstruccion : "WHILE" , condicion : exp , instrucciones : $6};}
;
/*---------------------------------------------DO-WHILE---------------------------------------------------------*/
DO_WHILE: R_Do S_LlaveAbre EDD S_LlaveCierra R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_PuntoComa    {var exp;if(Array.isArray($7)){exp = $7;}else{exp = [$7];}; $$ = {tipoInstruccion : "DOWHILE" , condicion : exp , instrucciones : $3};}
;

/*---------------------------------------------FOR---------------------------------------------------------*/
FOR : R_For S_ParentesisAbre CONT_FOR EXPRESION_G S_PuntoComa FIN_FOR S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra  {$$ ={tipoInstruccion : "FOR" , inicio : $3 , condicion : $4 , fin : $6, instrucciones : $9 , fila : this._$.first_line} ;}
;

CONT_FOR
    : R_Let Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G S_PuntoComa                                 {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : [{tipo : "VARIABLE" , identificador : $2 , tipoDato : $4 , valor : $6 , fila : this._$.first_line}]};}
    | R_Let Identificador S_Igual EXPRESION_G S_PuntoComa                                                           {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : [{tipo : "VARIABLE" , identificador : $2 , tipoDato : undefined , valor : $4 , fila : this._$.first_line}]};}
    | Identificador S_PuntoComa                                                                                     {$$ = {tipoInstruccion :"ASIGNACION_M", identificador:$1};}    
    | Identificador S_Igual EXPRESION_G S_PuntoComa                                                                 {$$ = {tipoInstruccion :"ASIGNACION", identificador :[valor("IDENTIFICADOR" ,$1,this._$.first_line)] ,valor : $3};}   
;

FIN_FOR
    : Identificador S_Igual EXPRESION_G                                                                             {$$ = {tipoInstruccion : "ASIGNACION", contenido : [{tipoInstruccion : "ASIGNACION", identificador :[valor("IDENTIFICADOR" ,$1,this._$.first_line)] ,valor : $3}]};}                             
    | Identificador OP_Incremento                                                                                   {$$ = {tipoInstruccion : "ASIGNACION_INC_D", contenido : [{tipoInstruccion : "ASIGNACION_INC_D", identificador :[valor("IDENTIFICADOR" ,$1,this._$.first_line)] ,valor : undefined }]};}
    | OP_Incremento Identificador                                                                                   {$$ = {tipoInstruccion : "ASIGNACION_INC_A", contenido : [{tipoInstruccion : "ASIGNACION_INC_A", identificador :[valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,valor : undefined }]};}
    | Identificador OP_Decremento                                                                                   {$$ = {tipoInstruccion : "ASIGNACION_DEC_D", contenido : [{tipoInstruccion : "ASIGNACION_DEC_D", identificador :[valor("IDENTIFICADOR" ,$1,this._$.first_line)] ,valor : undefined }]};}
    | OP_Decremento IdentificadorG                                                                                  {$$ = {tipoInstruccion : "ASIGNACION_DEC_A", contenido : [{tipoInstruccion : "ASIGNACION_DEC_A", identificador :[valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,valor : undefined }]};}
    ;
/*---------------------------------------------FOR IN---------------------------------------------------------*/

FOR_IN: R_For S_ParentesisAbre CONT_FOR_IN S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                         {$$ = {tipoInstruccion : "FOR_IN" , condicion : $3 , instrucciones : $6};}
;

CONT_FOR_IN : R_Const Identificador R_In Identificador                                                              {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : [{tipo : "VARIABLE" , identificador : $2 , tipoDato : undefined , valor : undefined , fila : this._$.first_line}], nombreA : $4};}
            | R_Let Identificador R_In Identificador                                                                {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : [{tipo : "VARIABLE" , identificador : $2 , tipoDato : undefined , valor : undefined , fila : this._$.first_line}], nombreA : $4};}
            | Identificador R_In Identificador                                                                      {$$ = {tipoInstruccion : "ASIGNACION", identificador:$1 , nombreA :$3};}
;


/*---------------------------------------------FOR OF---------------------------------------------------------*/
FOR_OF: R_For S_ParentesisAbre CONT_FOR_OF S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                         {$$ = {tipoInstruccion : "FOR_OF" , condicion : $3 , instrucciones : $6};}
;

CONT_FOR_OF : R_Const Identificador R_Of Identificador                                                              {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : [{tipo : "VARIABLE" , identificador : $2 , tipoDato : undefined , valor : undefined , fila : this._$.first_line}], nombreA : $4};}
            | R_Let Identificador R_Of Identificador                                                                {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : [{tipo : "VARIABLE" , identificador : $2 , tipoDato : undefined , valor : undefined , fila : this._$.first_line}], nombreA : $4};}
            | Identificador R_Of Identificador                                                                      {$$ = {tipoInstruccion :"ASIGNACION", identificador:$1 , nombreA :$3};}
;

/*---------------------------------------------ASIGNACION VARIABLES---------------------------------------------------------*/

ASIGNACION : ATRIBUTOS S_Igual LISTA_DE_ASIGNACIONES COMPLETAR_ASIGNACION S_PuntoComa                {var v ;if(Array.isArray($3)){v = $3;}else{v = [$3];};$$ = {tipoInstruccion : "ASIGNACION" , contenido : [{tipoInstruccion : "ASIGNACION", identificador :$1 ,valor : v }].concat($4)} ;}
           //incrementos 
           | ATRIBUTOS OP_Incremento COMPLETAR_ASIGNACION S_PuntoComa                                {$$ = {tipoInstruccion : "ASIGNACION_INC_D", contenido : [{tipoInstruccion : "ASIGNACION_INC_D", identificador :$1 ,valor : undefined}].concat($3)};}   
           | OP_Incremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                                {$$ = {tipoInstruccion : "ASIGNACION_INC_A", contenido : [{tipoInstruccion : "ASIGNACION_INC_A", identificador :$2 ,valor : undefined}].concat($3)};}
           | ATRIBUTOS OP_Decremento COMPLETAR_ASIGNACION S_PuntoComa                                {$$ = {tipoInstruccion : "ASIGNACION_DEC_D", contenido : [{tipoInstruccion : "ASIGNACION_DEC_D", identificador :$1 ,valor : undefined}].concat($3)};}
           | OP_Decremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                                {$$ = {tipoInstruccion : "ASIGNACION_DEC_A", contenido : [{tipoInstruccion : "ASIGNACION_DEC_A", identificador :$2 ,valor : undefined}].concat($3)};}
           | ATRIBUTOS S_Punto R_Push S_ParentesisAbre LISTA_DE_ASIGNACIONES S_ParentesisCierra COMPLETAR_ASIGNACION S_PuntoComa    {$$ = {tipoInstruccion : "PUSH" , contenido : [{tipoInstruccion : "PUSH" , identificador : $1 , valor : $5, fila : this._$.first_line}].concat($7)};}
;

COMPLETAR_ASIGNACION : LISTADO_ASIGNACION
                     |                                                                 {$$ = [];}
;

LISTADO_ASIGNACION: LISTADO_ASIGNACION  CONTENIDO_ASIGNACION                            {$1.push($2);$$=$1;}
                  | CONTENIDO_ASIGNACION                                                {$$ = [$1];}
;

CONTENIDO_ASIGNACION: S_Coma Identificador S_Igual EXPRESION_G                          {$$ = {tipoInstruccion : "ASIGNACION", identificador :[valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,valor : $4};}
                    | S_Coma Identificador OP_Incremento                                {$$ = {tipoInstruccion : "ASIGNACION_INC_D", identificador :[valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,valor : undefined };}
                    | S_Coma OP_Incremento Identificador                                {$$ = {tipoInstruccion : "ASIGNACION_INC_A", identificador :[valor("IDENTIFICADOR" ,$3,this._$.first_line)] ,valor : undefined };}
                    | S_Coma Identificador OP_Decremento                                {$$ = {tipoInstruccion : "ASIGNACION_DEC_D", identificador :[valor("IDENTIFICADOR" ,$2,this._$.first_line)] ,valor : undefined };}
                    | S_Coma OP_Decremento Identificador                                {$$ = {tipoInstruccion : "ASIGNACION_DEC_A", identificador :[valor("IDENTIFICADOR" ,$3,this._$.first_line)] ,valor : undefined };}
                    | S_Coma ATRIBUTOS S_Punto R_Push S_ParentesisAbre LISTA_DE_ASIGNACIONES S_ParentesisCierra {$$ = {tipoInstruccion : "PUSH" , contenido : [{tipoInstruccion : "PUSH" , identificador : $2 , valor : $6 , fila : this._$.first_line}]};}
;

LISTA_DE_ASIGNACIONES : EXPRESION_G                                                     {$$ = $1;}
                      | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra 
                      | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra
;
/*---------------------------------------------LISTA DE CORCHETES PARA MATRIZ Y ARRAY---------------------------------------------------------*/
///LISTA CORCHETES SIN VALOR
L_CORCHETE : LISTA_CORCHETE                                                            
;

/*L_C: L_C LISTA_CORCHETE                                                             
    |LISTA_CORCHETE                                                                 
;*/

/*LISTA PARA DECLARACIONES*/
LISTA_CORCHETE : S_CorcheteAbre S_CorcheteCierra                                    
;
///LISTA CORCHETES CON VALOR
L_CORCHETE_V : LISTA_AS_MV
;
/*
L_C_V : L_C_V LISTA_AS_MV                                                           
      | LISTA_AS_MV                                                                 
;
*/
/*LISTA PARA ASIGNACIONES MATRIZ Y VECTOR*/
LISTA_AS_MV: S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra {$$ = $2;}
;
/*---------------------------------------------LISTA DE ASIGNACION ARRAY DENTRO DE ARRAY---------------------------------------------------------*/
CONT_ASIG_ARRAY: LISTA_ASIGN_ARRAY
               |                                                                {$$ =[];}
;

LISTA_ASIGN_ARRAY: LISTA_ASIGN_ARRAY S_Coma CONT_ARRAY_ASIGN_VV                 {$1.push($3);$$ = $1;}
                 | CONT_ARRAY_ASIGN_VV                                          {$$ = [$1];}
;   

CONT_ARRAY_ASIGN_VV: EXPRESION_G                                                {$$ = $1;}
                   //| S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra
                   //| S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra
;


/*---------------------------------------------VARIABLES---------------------------------------------------------*/

VARIABLES : R_Let LISTADO_VAR S_PuntoComa   {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : $2};}
          | R_Const LISTADO_VAR S_PuntoComa {$$ = {tipoInstruccion :"DECLARACION" , modificador : $1, contenido : $2};}
;

/*---------------------------------------------LISTADO VARIABLES---------------------------------------------------------*/

LISTADO_VAR : LISTADO_VAR S_Coma CONT_VAR       {$1.push($3);$$ = $1;}
            | CONT_VAR                          {$$ = [$1];}
;
/*--------------------------------------------- DEFINICION DE VARIABLES---------------------------------------------------------*/

CONT_VAR: Identificador /*declaracion de variable solo id*/                                                                         { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato : undefined , valor : undefined , fila : this._$.first_line};}
        | Identificador S_DosPuntos TIPOS_DE_DATO  /*declaracion de variable con tipo de dato*/                                     { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato : $3 , valor : undefined , fila : this._$.first_line};}
        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G   /*declaracion de variable con tipo y asignacion de valor*/  { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato : $3 , valor : $5 , fila : this._$.first_line };}
        | Identificador S_Igual EXPRESION_G /*declaracion de variable con asignacion de valor*/                                     { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato : undefined , valor : $3 , fila : this._$.first_line};}


        | Identificador S_Igual S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra /*array */                                          { $$ = {tipo : "ARRAY_ST" , identificador : $1 , tipoDato : undefined , valor : $4 , fila : this._$.first_line};}                 
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE/*array */                                                              { $$ = {tipo : "ARRAY_CT" , identificador : $1 , tipoDato : $3 , valor : undefined , fila : this._$.first_line};}
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual L_CORCHETE_V /*array*/                                         { $$ = {tipo : "ARRAY_CTV", identificador : $1 , tipoDato : $3 , valor : $6 , fila : this._$.first_line};}

        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/
        | Identificador S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/
;

/*---------------------------------------------LLAMADAS A FUNCION---------------------------------------------------------*/

LLAMADA_FUNC
    : Identificador S_ParentesisAbre PARAMETROS_FUNC S_ParentesisCierra S_PuntoComa                                                 {$$ = {tipoInstruccion : "LLAMADA_F" , identificador : $1 , parametros : $3 , fila : this._$.first_line};}
    | ATRIBUTOS S_Punto R_Pop S_ParentesisAbre S_ParentesisCierra S_PuntoComa                                                       {$$ = {tipoInstruccion : "POP" , identificador : $1, fila : this._$.first_line};}
;

PARAMETROS_FUNC
    : PARAMETROS_FUNC S_Coma EXPRESION_G        {var v ;var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};v = $1.concat(exp);$$ = v;}
    | EXPRESION_G                               {var exp;if(Array.isArray($1)){exp = $1;}else{exp = [$1];};$$ = exp;}
    |                                           {$$ = [];}
;

/*---------------------------------------------PARAMETROS---------------------------------------------------------*/
PARAM: LISTA_PARAMETROS
     |                                                                  {$$ = [];}
;

LISTA_PARAMETROS : LISTA_PARAMETROS S_Coma PARAMETROS                   {$1.push($3); $$ = $1;}
                 | PARAMETROS                                           {$$ = [$1];}
;

PARAMETROS : Identificador S_DosPuntos TIPOS_DE_DATO                                                    { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato : $3 , valor : undefined , fila : this._$.first_line};}
           | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G                                { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato : $3 , valor : $5 , fila : this._$.first_line};}
           | Identificador S_Interrogacion S_DosPuntos TIPOS_DE_DATO 
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE                                 
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual LISTA_DE_ASIGNACIONES 
           | Identificador S_Interrogacion S_DosPuntos TIPOS_DE_DATO L_CORCHETE
;
/*---------------------------------------------TYPES---------------------------------------------------------*/


TYPES: T_Type Identificador S_Igual S_LlaveAbre LISTA_TYPES FIN_TYPES
;

LISTA_TYPES: LISTA_TYPES SEPARADOR CONTENIDO_TYPES
           | CONTENIDO_TYPES
;

CONTENIDO_TYPES : Identificador S_DosPuntos TIPOS_DE_DATO
                | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE
;

SEPARADOR : S_Coma
          | S_PuntoComa
;

FIN_TYPES: S_LlaveCierra S_PuntoComa
         | S_LlaveCierra
;

/*---------------------------------------------DECLARACION DE TYPES---------------------------------------------------------*/
LISTA_DECLARACION_TYPES: LISTA_DECLARACION_TYPES SEPARADOR_DECLARACION_TYPES CONTENIDO_DECLARACION_TYPES
                        | CONTENIDO_DECLARACION_TYPES
;

CONTENIDO_DECLARACION_TYPES : Identificador S_DosPuntos LISTA_DE_ASIGNACIONES
;

SEPARADOR_DECLARACION_TYPES : S_Coma
                            | S_PuntoComa
;

/*---------------------------------------------TIPOS DE DATO---------------------------------------------------------*/
TIPOS_DE_DATO : T_Number                        {$$ = "NUMERO";}
              | T_Boolean                       {$$ = "BOOLEAN";}
              | T_String                        {$$ = "CADENA";}
              | T_Void                          {$$ = "VOID";}
              | Identificador                   {$$ = "IDENTIFICADOR";}
;
//agrega tipos de dato a funciones anonimas
TIPAR_FUNCION : S_DosPuntos TIPOS_DE_DATO
              |
;
/*---------------------------------------------ACCEDER A ATRIBUTOS---------------------------------------------------------*/

 ATRIBUTOS: ATRIBUTOS S_Punto CONT_ATRIBUTOS                                                    {$1.push($3);$$ = $1;}
          | CONT_ATRIBUTOS                                                                      {$$ = [$1];}
 ;

 CONT_ATRIBUTOS:  Identificador L_CORCHETE_V                                                    
               |  Identificador                                                                 {$$ = valor("IDENTIFICADOR" , $1, this._$.first_line);}
;

/*---------------------------------------------EXPRESIONES---------------------------------------------------------*/
EXPRESION_G 
    : EXPRESION_G LOG_Concatenar EXPRESION_G                                                     { $$ = operacionB($1,$3,"OPERACION_AND");}
    | EXPRESION_G LOG_OR EXPRESION_G                                                             { $$ = operacionB($1,$3,"OPERACION_OR");}
    | EXPRESION_G REL_IgualIgual EXPRESION_G                                                     { $$ = operacionB($1,$3,"OPERACION_IGUALIGUAL");}   
    | EXPRESION_G REL_MayorIgualQue EXPRESION_G                                                  { $$ = operacionB($1,$3,"OPERACION_MAYORIGUALQUE");}
    | EXPRESION_G REL_MayorQue EXPRESION_G                                                       { $$ = operacionB($1,$3,"OPERACION_MAYORQUE");}
    | EXPRESION_G REL_MenorIgualQue EXPRESION_G                                                  { $$ = operacionB($1,$3,"OPERACION_MENORIGUALQUE");}
    | EXPRESION_G REL_MenorQue EXPRESION_G                                                       { $$ = operacionB($1,$3,"OPERACION_MENORQUE");}
    | EXPRESION_G REL_Distinto EXPRESION_G                                                       { $$ = operacionB($1,$3,"OPERACION_DISTINTO");}
    | EXPRESION_G OP_Mas EXPRESION_G                                                             { $$ = operacionB($1,$3,"OPERACION_SUMA");}
    | EXPRESION_G OP_Menos EXPRESION_G                                                           { $$ = operacionB($1,$3,"OPERACION_RESTA");}
    | EXPRESION_G OP_Multiplicacion EXPRESION_G                                                  { $$ = operacionB($1,$3,"OPERACION_MULTIPLICACION");}
    | EXPRESION_G OP_Division EXPRESION_G                                                        { $$ = operacionB($1,$3,"OPERACION_DIVISION");}   
    | EXPRESION_G OP_Exponenciacion EXPRESION_G                                                  { $$ = operacionB($1,$3,"OPERACION_EXPONENCIACION");}
    | EXPRESION_G OP_Modulo EXPRESION_G                                                          { $$ = operacionB($1,$3,"OPERACION_MODULO");}
    | CONTENIDO_EXPRESION OP_Decremento %prec PRUEBA                                             { $$ = operacionU($1,"OPERACION_DECREMENTO_D"); }
    | CONTENIDO_EXPRESION OP_Incremento %prec PRUEBA                                             { $$ = operacionU($1,"OPERACION_INCREMENTO_D"); }
    | OP_Decremento CONTENIDO_EXPRESION                                                          { $$ = operacionU($2,"OPERACION_DECREMENTO_A"); }
    | OP_Incremento CONTENIDO_EXPRESION                                                          { $$ = operacionU($2,"OPERACION_INCREMENTO_A"); }
    | OP_Menos  CONTENIDO_EXPRESION     %prec UMINUS                                             { $$ = operacionU($2,"OPERACION_NEGATIVO"); }
    | LOG_Not   EXPRESION_G             %prec UMINUS                                             { $$ = operacionU($2,"OPERACION_NOT"); }
    | CONTENIDO_EXPRESION                                                                        { $$ = $1;}
;

 CONTENIDO_EXPRESION
    : Decimal                                                                                     {$$ = valor("NUMERO", Number($1),this._$.first_line);} 
    | Entero                                                                                      {$$ = valor("NUMERO", Number($1),this._$.first_line);}
    | R_True                                                                                      {$$ = valor("BOOLEAN", true,this._$.first_line);}
    | R_False                                                                                     {$$ = valor("BOOLEAN", false,this._$.first_line);}
    | R_Undefined                                                                                 {$$ = valor("UNDEFINED", undefined,this._$.first_line);}  
    | Cadena                                                                                      {$$ = valor("CADENA" , String($1), this._$.first_line);}
    | Identificador S_ParentesisAbre S_ParentesisCierra                                           {$$ = {tipo : "LLAMADA_F" , identificador : $1 , parametros : [] , fila : this._$.first_line};}                          
    | Identificador S_ParentesisAbre OPCIONAL S_ParentesisCierra                                  {$$ = {tipo : "LLAMADA_F" , identificador : $1 , parametros : $3 , fila : this._$.first_line};}
    | S_ParentesisAbre EXPRESION_G S_ParentesisCierra                                             {$$ = $2;}
    | ATRIBUTOS                                                                                   {$$ = $1;}
    | ATRIBUTOS S_Punto R_Length                                                                  {$$ = {tipo : "LENGTH" , identificador : $1 , fila : this._$.first_line};}
    | ATRIBUTOS S_Punto R_Pop S_ParentesisAbre S_ParentesisCierra                                 {$$ = {tipo : "POP" , identificador : $1 , fila : this._$.first_line};}
; /*ATRIBUTOS CONTIENE ID Y VECTOR */

OPCIONAL 
    : OPCIONAL S_Coma EXPRESION_G                                                                 {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};var v; v = $1.concat(exp);$$=v;}                                                                
    | EXPRESION_G                                                                                 {var exp;if(Array.isArray($1)){exp = $1;}else{exp = [$1];};$$ = exp;}
; 