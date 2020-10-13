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
[\"][^\\\"]*([\\][\\\"ntr][^\\\"]*)*[\"]            {  yytext = yytext.substr(1,yyleng-2);return 'Cadena'; }
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
"graficar_ts"                                       { return 'R_Graficar';}

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
[0-9]+("."[0-9]+)?\b                                {return 'Decimal';}
[0-9]+\b                                            {return 'Entero';}



/*  IDENTIFICADORES */
([a-zA-Z_])[a-zA-Z0-9_]*                            {return 'Identificador';}
<<EOF>>                                             {  return 'EOF'; }
.                                                   {console.error("error lexico: " + yytext)}
/lex
%{


let ind = 0;
function graficar(arbol){
    let graphviz = "", nodo1 = "";
    nodo1 = 'nodo' + ind++;
    graphviz +=  nodo1 + '[label="' + arbol.Nombre + '"];\n';
    arbol.vector.forEach(function(elemento){
        let nodo2 = 'nodo' + ind;
        graphviz += nodo1 + '->' + nodo2 + ';\n';
        graphviz += graficar(elemento);
    });
    return graphviz;
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
INICIO : CONT EOF{console.log($1);console.log(graficar($1));return graficar($1);}
;
/*---------------------------------------------LISTA DE CONTENIDO GLOBAL---------------------------------------------------------*/
CONT: LISTA_CONTENIDO                                       {$$ = {Nombre:"CONT",vector:[$1]};}
    |                                                       {$$ = {Nombre:"CONT",vector:[{Nombre : "&epsilon;" , vector : []}]};}
;


LISTA_CONTENIDO : LISTA_CONTENIDO CONTENIDO                 {$$ = {Nombre: "LISTA_CONTENIDO" , vector:[$1,$2]};}
                | CONTENIDO                                 {$$ = {Nombre:"LISTA_CONTENIDO",vector:[$1]};}
;

//CONTENIDO GLOBAL
CONTENIDO : FUNCIONES                                       {$$ = {Nombre:"CONTENIDO",vector:[$1]};}
          | ESTRUCTURAS_DE_CONTROL                          {$$ = {Nombre:"CONTENIDO",vector:[$1]};}
          |  error  {$$ ='';console.log({ Tipo_Error  : ' Error_Sintactico ', Error  : yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;
/*---------------------------------------------DEFINICION DE FUNCIONES---------------------------------------------------------*/
FUNCIONES : R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                                            {$$ = {Nombre:"FUNCIONES",vector:[{Nombre:$2,vector :[]},$4,$7]};}
          | R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_DosPuntos TIPOS_DE_DATO S_LlaveAbre EDD S_LlaveCierra                  {$$ = {Nombre:"FUNCIONES",vector:[{Nombre:$2,vector :[]},$4,$7,$9]};}
          | R_Let Identificador S_Igual R_Funcion S_ParentesisAbre PARAM S_ParentesisCierra TIPAR_FUNCION S_LlaveAbre EDD S_LlaveCierra S_PuntoComa    {$$ = {Nombre:"FUNCIONES",vector:[{Nombre:$2,vector :[]},$6,$8,$10]};}
          | R_Const Identificador S_Igual R_Funcion S_ParentesisAbre PARAM S_ParentesisCierra TIPAR_FUNCION S_LlaveAbre EDD S_LlaveCierra S_PuntoComa  {$$ = {Nombre:"FUNCIONES",vector:[{Nombre:$2,vector :[]},$4,$8,$10]};}
;
/*---------------------------------------------LISTADO DE ESTRUCTURAS DE CONTROL---------------------------------------------------------*/
EDD:LISTADO_ESTRUCTURAS                                                 {$$ = $1;}
   |                                                                    {$$ = {Nombre: "LISTADO_ESTRUCTURAS" , vector: [{Nombre : "&epsilon;" , vector : []}]};}                     
;

LISTADO_ESTRUCTURAS : LISTADO_ESTRUCTURAS CONT_ESTRUCTURAS_CONTROL        {$$ = {Nombre:"LISTADO_ESTRUCTURAS",vector:[$1,$2]};}
                    | CONT_ESTRUCTURAS_CONTROL                            {$$ = {Nombre:"LISTADO_ESTRUCTURAS",vector:[$1]};}
;

CONT_ESTRUCTURAS_CONTROL : ESTRUCTURAS_DE_CONTROL
                         | error  {$$ ='';console.log({ Tipo_Error  : ' Error_Sintactico ', Error  : yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;

ESTRUCTURAS_DE_CONTROL: VARIABLES                                       {$$ = {Nombre:"DECLARACION_VARIABLES",vector:[$1]};}
                      | ASIGNACION                                      {$$ = {Nombre:"ESTRUCTURAS_DE_CONTROL",vector:[$1]};}
                      | LISTADO_IF ELSE                                 {$$ = {Nombre:"CONDICIONAL",vector:[$1,$2]};}
                      | SWITCH                                          {$$ = {Nombre:"CONDICIONAL",vector:[$1]};}
                      | IMPRIMIR
                      | WHILE                                           {$$ = {Nombre:"CICLO",vector:[$1]};}
                      | DO_WHILE                                        {$$ = {Nombre:"CICLO",vector:[$1]};}
                      | FOR                                             {$$ = {Nombre:"CICLO",vector:[$1]};}
                      | FOR_OF                                          {$$ = {Nombre:"CICLO",vector:[$1]};}
                      | FOR_IN                                          {$$ = {Nombre:"CICLO",vector:[$1]};}
                      | SENTENCIAS_TRANSFERENCIA                        
                      | FUNCION_GRAFICAR
                      | LLAMADA_FUNC                                    {$$ = {Nombre:"ESTRUCTURAS_DE_CONTROL",vector:[$1]};}
                      | TYPES                                           {$$ = {Nombre:"DECLARACION_TYPE",vector:[$1]};}
;
/*--------------------------------------------- FUNCIONES NATIVAS ---------------------------------------------------------*/
FUNCION_GRAFICAR : R_Graficar S_ParentesisAbre S_ParentesisCierra S_PuntoComa      {$$ = {Nombre : "GRAFICAR_TS" , vector:[]};}
;
/*--------------------------------------------- SENTENCIAS DE TRANSFERENCIA ---------------------------------------------------------*/

SENTENCIAS_TRANSFERENCIA : R_Break S_PuntoComa                          {$$ = {Nombre:"BREAK",vector:[]};}
                         | R_Continue S_PuntoComa                       {$$ = {Nombre:"CONTINUE",vector:[]};}
                         | R_Return S_PuntoComa                         {$$ = {Nombre:"RETURN",vector:[]};}
                         | R_Return EXPRESION_G S_PuntoComa             {$$ = {Nombre:"RETURN",vector:[$2]};}
;

/*--------------------------------------------- LISTADO IF---------------------------------------------------------*/
LISTADO_IF : LISTADO_IF R_Else IF                                                                                       {$$={Nombre:"ELSE_IF",vector : [$1].concat($3)};}
           | IF                                                                                                         {$$ = {Nombre:"IF",vector:$1};}
;

IF : R_If S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                                 {$$ = [$3,$6];}
;

ELSE : R_Else S_LlaveAbre EDD S_LlaveCierra                                                                             {$$ = {Nombre:"ELSE",vector:[$3]};}
     |                                                                                                                  {$$ = {Nombre : "ELSE", vector : [{Nombre : "&epsilon;" , vector : []}]};}
;

/*---------------------------------------------SWITCH---------------------------------------------------------*/
SWITCH : R_Switch S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre CASE DEFINIR_DEFAULT S_LlaveCierra        {$$ = {Nombre:"SWITCH",vector:[$3,$6,$7]};}
;

/*---------------------------------------------LISTADO DE CASE---------------------------------------------------------*/

CASE : LISTA_CASE
     |                                                                                                                  {$$ = {Nombre:"CASE",vector:[{Nombre : "&epsilon;" , vector : []}]};}
;

LISTA_CASE: LISTA_CASE DEFINIR_CASE                                                                                     {$$ = {Nombre:"LISTA_CASE",vector:[$1,$2]};}
          | DEFINIR_CASE                                                                                                {$$ = {Nombre:"LISTA_CASE",vector:[$1]};}
;

DEFINIR_CASE:R_Case EXPRESION_G S_DosPuntos EDD                                                                         {$$ = {Nombre:"CASE",vector:[$2,$4]};}
;
/*---------------------------------------------DEFINICION DE DEFAULT---------------------------------------------------------*/

DEFINIR_DEFAULT: R_Default S_DosPuntos EDD                                                                              {$$ = {Nombre:"DEFAULT",vector:[$3]};}
               |                                                                                                        {$$ = {Nombre:"DEFAULT",vector:[{Nombre : "&epsilon;" , vector : []}]};}
;
/*---------------------------------------------IMPRIMIR---------------------------------------------------------*/
IMPRIMIR: R_Console S_Punto R_Log S_ParentesisAbre FUNC S_ParentesisCierra S_PuntoComa                                  {$$ = {Nombre:"IMPRIMIR",vector:[$5]};}
;

FUNC: EXPRESION_G                                                                                                       {$$ = $1;}
    |                                                                                                                   {$$ = {Nombre:"FUNC",vector:[{Nombre : "&epsilon;" , vector : []}]};}
;
/*---------------------------------------------WHILE---------------------------------------------------------*/
WHILE: R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                            {$$ = {Nombre:"WHILE",vector:[$3,$6]};}           
;
/*---------------------------------------------DO-WHILE---------------------------------------------------------*/
DO_WHILE: R_Do S_LlaveAbre EDD S_LlaveCierra R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_PuntoComa        {$$ = {Nombre:"DO_WHILE",vector:[$3,$7]};}
;

/*---------------------------------------------FOR---------------------------------------------------------*/
FOR : R_For S_ParentesisAbre CONT_FOR EXPRESION_G S_PuntoComa FIN_FOR S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra  {$$ = {Nombre:"FOR",vector:[$3,$4,$6,$9]};}
;

CONT_FOR
    : R_Let Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G S_PuntoComa                                     {$$ = {Nombre:"INICIO_FOR",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []},$4,$6]};}                          
    | R_Let Identificador S_Igual EXPRESION_G S_PuntoComa                                                               {$$ = {Nombre:"INICIO_FOR",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []},$4]};}
    | Identificador S_PuntoComa                                                                                         {$$ = {Nombre:"INICIO_FOR",vector:[{Nombre: $1 , vector : []}]};}
    | Identificador S_Igual EXPRESION_G S_PuntoComa                                                                     {$$ = {Nombre:"INICIO_FOR",vector:[{Nombre: $1 , vector : []},$3]};}
;

FIN_FOR
    : Identificador S_Igual EXPRESION_G                                                                                 {$$ = {Nombre:"FIN_FOR",vector:[{Nombre: $1 , vector : []},$3]};}                                                                                  
    | Identificador OP_Incremento                                                                                       {$$ = {Nombre:"FIN_FOR",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []}]};}
    | OP_Incremento Identificador                                                                                       {$$ = {Nombre:"FIN_FOR",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []}]};}
    | Identificador OP_Decremento                                                                                       {$$ = {Nombre:"FIN_FOR",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []}]};}
    | OP_Decremento IdentificadorG                                                                                      {$$ = {Nombre:"FIN_FOR",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []}]};}                                                                  
    ;
/*---------------------------------------------FOR IN---------------------------------------------------------*/

FOR_IN: R_For S_ParentesisAbre CONT_FOR_IN S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                             {$$ = {Nombre:"FOR_IN",vector:[$3,$6]};}      
;

CONT_FOR_IN : R_Const Identificador R_In Identificador                                                                  {$$ = {Nombre:"CONT_FOR_IN",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []},{Nombre: $4 , vector : []}]};}
            | R_Let Identificador R_In Identificador                                                                    {$$ = {Nombre:"CONT_FOR_IN",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []},{Nombre: $4 , vector : []}]};}
            | Identificador R_In Identificador                                                                          {$$ = {Nombre:"CONT_FOR_IN",vector:[{Nombre: $1 , vector : []},{Nombre: $3 , vector : []}]};}
;


/*---------------------------------------------FOR OF---------------------------------------------------------*/
FOR_OF: R_For S_ParentesisAbre CONT_FOR_OF S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                             {$$ = {Nombre:"FOR_OF",vector:[$3,$6]};}
;

CONT_FOR_OF : R_Const Identificador R_Of Identificador                                                                  {$$ = {Nombre:"CONT_FOR_OF",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []},{Nombre: $4 , vector : []}]};}
            | R_Let Identificador R_Of Identificador                                                                    {$$ = {Nombre:"CONT_FOR_OF",vector:[{Nombre: $1 , vector : []},{Nombre: $2 , vector : []},{Nombre: $4 , vector : []}]};}
            | Identificador R_Of Identificador                                                                          {$$ = {Nombre:"CONT_FOR_OF",vector:[{Nombre: $1 , vector : []},{Nombre: $3 , vector : []}]};}
;

/*---------------------------------------------ASIGNACION VARIABLES---------------------------------------------------------*/

ASIGNACION : ATRIBUTOS S_Igual LISTA_DE_ASIGNACIONES S_PuntoComa                                                        {$$ = {Nombre : "ASIGNACION" , vector :[$1,{Nombre : $2 , vector : []},$3]};}
           //incrementos 
           | ATRIBUTOS OP_Incremento COMPLETAR_ASIGNACION S_PuntoComa                                                   {$$ = {Nombre : "ASIGNACION" , vector :[{Nombre : "ASIGNACION", vector : [$1 ,{Nombre : $2 , vector : []}]},$3]};}
           | OP_Incremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                                                   {$$ = {Nombre : "ASIGNACION" , vector :[{Nombre : "ASIGNACION", vector : [{Nombre : $1 , vector : []} ,$2]},$3]};}   
           | ATRIBUTOS OP_Decremento COMPLETAR_ASIGNACION S_PuntoComa                                                   {$$ = {Nombre : "ASIGNACION" , vector :[{Nombre : "ASIGNACION", vector : [$1 ,{Nombre : $2 , vector : []}]},$3]};}
           | OP_Decremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                                                   {$$ = {Nombre : "ASIGNACION" , vector :[{Nombre : "ASIGNACION", vector : [{Nombre : $1 , vector : []} ,$2]},$3]};}
           | ATRIBUTOS S_Punto R_Push S_ParentesisAbre LISTA_DE_ASIGNACIONES S_ParentesisCierra COMPLETAR_ASIGNACION S_PuntoComa  {$$ = {Nombre : "ASIGNACION" , vector : [$1,{Nombre: $3 , vector : []},{Nombre : $4 , vector : []},$5,{Nombre : $6 , vector : []},$7]};}
            //asignacion push
;

COMPLETAR_ASIGNACION : LISTADO_ASIGNACION
                      |                                                                             {$$ = { Nombre : "COMPLETAR_ASIGNACION" , vector : [{Nombre : "&epsilon;" , vector : []}]};}
;

LISTADO_ASIGNACION: LISTADO_ASIGNACION  CONTENIDO_ASIGNACION                                        {$$ = { Nombre : "LISTADO_ASIGNACION" , vector : [$1,$2]};}
                  | CONTENIDO_ASIGNACION                                                            {$$ = { Nombre : "LISTADO_ASIGNACION" , vector : [$1]};}
;

CONTENIDO_ASIGNACION: S_Coma Identificador S_Igual EXPRESION_G                                      {$$ = {Nombre : "CONTENIDO_ASIGNACION" , vector : [{Nombre : $2 , vector : []},$4]};}
                    | S_Coma Identificador OP_Incremento                                            {$$ = {Nombre : "CONTENIDO_ASIGNACION" , vector : [{Nombre : $2 , vector : []},{Nombre : $3 , vector : []}]};}
                    | S_Coma OP_Incremento Identificador                                            {$$ = {Nombre : "CONTENIDO_ASIGNACION" , vector : [{Nombre : $2 , vector : []},{Nombre : $3 , vector : []}]};}
                    | S_Coma Identificador OP_Decremento                                            {$$ = {Nombre : "CONTENIDO_ASIGNACION" , vector : [{Nombre : $2 , vector : []},{Nombre : $3 , vector : []}]};}
                    | S_Coma OP_Decremento Identificador                                            {$$ = {Nombre : "CONTENIDO_ASIGNACION" , vector : [{Nombre : $2 , vector : []},{Nombre : $3 , vector : []}]};}
                    | S_Coma ATRIBUTOS S_Punto R_Push S_ParentesisAbre LISTA_DE_ASIGNACIONES S_ParentesisCierra {$$ = {Nombre : "CONTENIDO_ASIGNACION" , vector : [$2 , {Nombre : $4 , vector : []},{Nombre : $5 , vector : []},$6,{Nombre : $7 , vector : []}]};}
;

LISTA_DE_ASIGNACIONES : EXPRESION_G                                                                 {$$ = $1;}
                      | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra                             {$$ = $2;}
                      | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra                           {$$ = $2;}
;
/*---------------------------------------------LISTA DE CORCHETES PARA MATRIZ Y ARRAY---------------------------------------------------------*/
///LISTA CORCHETES SIN VALOR
L_CORCHETE : L_C                                                            
;

L_C: L_C LISTA_CORCHETE                                     {$$ = {Nombre : "L_C" , vector : [$1,$2]};}                        
    |LISTA_CORCHETE                                         {$$ = {Nombre : "L_C" , vector : [$1]};}                                        
;

/*LISTA PARA DECLARACIONES*/
LISTA_CORCHETE : S_CorcheteAbre S_CorcheteCierra            {var nom = $1+$2; $$ = {Nombre : nom , vector : []};}                        
;
///LISTA CORCHETES CON VALOR
L_CORCHETE_V : L_C_V
;

L_C_V : L_C_V LISTA_AS_MV                                       {$$ = {Nombre : "L_C_V" , vector : [$1,$2]};}                          
      | LISTA_AS_MV                                             {$$ = {Nombre : "L_C_V" , vector : [$1]};}                                          
;

/*LISTA PARA ASIGNACIONES MATRIZ Y VECTOR*/
LISTA_AS_MV: S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra    {$$ = {Nombre : "LISTA_AS_MV" , vector : [{Nombre : $1 , vector : []},$2,{Nombre : $3 , vector : []}]};}
;


/*---------------------------------------------LISTA DE ASIGNACION ARRAY DENTRO DE ARRAY---------------------------------------------------------*/
CONT_ASIG_ARRAY: LISTA_ASIGN_ARRAY                                                                                                  
               |                                                                                                                    {$$ = {Nombre : "CONT_ASIG_ARRAY", vector : [{Nombre : "&epsilon;" , vector : []}]};}
;

LISTA_ASIGN_ARRAY: LISTA_ASIGN_ARRAY S_Coma CONT_ARRAY_ASIGN_VV                                                                     {$$ = {Nombre : "LISTA_ASIGN_ARRAY", vector : [$1,$3]};}
                 | CONT_ARRAY_ASIGN_VV                                                                                              {$$ = {Nombre : "LISTA_ASIGN_ARRAY", vector : [$1]};}
;   

CONT_ARRAY_ASIGN_VV: EXPRESION_G                                                                                                    {$$ = $1;}
                   | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra                                                                {$$ = $2;}
                   | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra                                                              {$$ = $2;}
;


/*---------------------------------------------VARIABLES---------------------------------------------------------*/

VARIABLES : R_Let LISTADO_VAR S_PuntoComa                                                                                           {$$ = {Nombre : "VARIABLES" , vector : [{Nombre:$1 , vector: []},$2]};}
          | R_Const LISTADO_VAR S_PuntoComa                                                                                         {$$ = {Nombre : "VARIABLES" , vector : [{Nombre:$1 , vector: []},$2]};}
;

/*---------------------------------------------LISTADO VARIABLES---------------------------------------------------------*/

LISTADO_VAR : LISTADO_VAR S_Coma CONT_VAR                                                                                                           {$$ = { Nombre: "LISTADO_VAR" , vector : [$1,$3]};}
            | CONT_VAR                                                                                                                              {$$ = { Nombre: "LISTADO_VAR" , vector : [$1]};}
;
/*--------------------------------------------- DEFINICION DE VARIABLES---------------------------------------------------------*/

CONT_VAR: Identificador /*declaracion de variable solo id*/                                                                                         {$$ = {Nombre : "VARIABLE" , vector : [{Nombre : $1 , vector : []}]};}              
        | Identificador S_DosPuntos TIPOS_DE_DATO  /*declaracion de variable con tipo de dato*/                                                     {$$ = {Nombre : "VARIABLE" , vector : [{Nombre : $1 , vector : []},$3]};} 
        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G   /*declaracion de variable con tipo y asignacion de valor*/                  {$$ = {Nombre : "VARIABLE" , vector : [{Nombre : $1 , vector : []},$3,$5]};}  
        | Identificador S_Igual EXPRESION_G /*declaracion de variable con asignacion de valor*/                                                     {$$ = {Nombre : "VARIABLE" , vector : [{Nombre : $1 , vector : []},$3]};} 


        | Identificador S_Igual S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra /*array*/                                                           {$$ = {Nombre : "ARRAY" , vector : [{Nombre : $1 , vector : []},$4]};}
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE/*array*/                                                                               {$$ = {Nombre : "ARRAY" , vector : [{Nombre : $1 , vector : []},$3,$4]};}
        //| Identificador S_DosPuntos TIPOS_DE_DATO S_CorcheteAbre S_CorcheteCierra
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual L_CORCHETE_V /*array*/                                                         {$$ = {Nombre : "ARRAY" , vector : [{Nombre : $1 , vector : []},$3,$4,{Nombre : $5 , vector : []},$6]};}
        //| Identificador S_DosPuntos TIPOS_DE_DATO S_CorcheteAbre S_CorcheteCierra S_Igual S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra

        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/                               {$$ = {Nombre : "TYPE" ,vector : [{Nombre : $1 , vector : []},$3,$6]};}
        | Identificador S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/                                                         {$$ = {Nombre : "TYPE" ,vector : [{Nombre : $1 , vector : []},$4]};}
;   


/*---------------------------------------------LLAMADAS A FUNCION---------------------------------------------------------*/

LLAMADA_FUNC
    : Identificador S_ParentesisAbre PARAMETROS_FUNC S_ParentesisCierra S_PuntoComa                     {$$ = {Nombre : "LLAMADA_FUNC", vector : [{Nombre : $1, vector : []},$3]};}
    | ATRIBUTOS S_Punto R_Pop S_ParentesisAbre S_ParentesisCierra S_PuntoComa                           {$$ = {Nombre : "LLAMADA_FUNC", vector : [$1,{Nombre : $3 , vector : []}]};}
;

PARAMETROS_FUNC
    : PARAMETROS_FUNC S_Coma EXPRESION_G                                                                {$$ = {Nombre : "PARAMETROS_FUNC" , vector : [$1,$3] };}
    | EXPRESION_G                                                                                       {$$ = {Nombre : "PARAMETROS_FUNC" , vector : [$1] };}
    |                                                                                                   {$$ = {Nombre : "PARAMETROS_FUNC" , vector : [{Nombre : "&epsilon;" , vector : []}] };}
;

/*---------------------------------------------PARAMETROS---------------------------------------------------------*/
PARAM: LISTA_PARAMETROS
     |                                                                                                  {$$ = {Nombre : "PARAM" , vector : [{Nombre : "&epsilon;" , vector : []}]};}
;

LISTA_PARAMETROS : LISTA_PARAMETROS S_Coma PARAMETROS                                                   {$$ = {Nombre : "LISTA_PARAMETROS" , vector : [$1,$3]};}
                 | PARAMETROS                                                                           {$$ = {Nombre : "LISTA_PARAMETROS" , vector : [$1]};}
;

PARAMETROS : Identificador S_DosPuntos TIPOS_DE_DATO                                                    {$$ = {Nombre : "PARAMETROS" , vector : [{Nombre: $1 , vector : []}, $3]};}
           | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual LISTA_DE_ASIGNACIONES                      {$$ = {Nombre : "PARAMETROS" , vector : [{Nombre: $1 , vector : []}, $3,{Nombre : $4 , vector : []},$5]};}
           | Identificador S_Interrogacion S_DosPuntos TIPOS_DE_DATO                                    {$$ = {Nombre : "PARAMETROS_OPCIONALES" , vector : [{Nombre: $1 , vector : []}, $4]};}
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE                                         {$$ = {Nombre : "PARAMETROS" , vector : [{Nombre: $1 , vector : []}, $3,$4]};}
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual LISTA_DE_ASIGNACIONES           {$$ = {Nombre : "PARAMETROS" , vector : [{Nombre: $1 , vector : []}, $3,$4,{Nombre : $5 , vector : []},$6]};}
           | Identificador S_Interrogacion S_DosPuntos TIPOS_DE_DATO L_CORCHETE                         {$$ = {Nombre : "PARAMETROS_OPCIONALES" , vector : [{Nombre: $1 , vector : []}, $4,$5]};}

;
/*---------------------------------------------TYPES---------------------------------------------------------*/


TYPES: T_Type Identificador S_Igual S_LlaveAbre LISTA_TYPES FIN_TYPES                                           {$$ = {Nombre: "TYPES" , vector:[{Nombre: $2 ,vector:[]},$5]};}
;

LISTA_TYPES: LISTA_TYPES SEPARADOR CONTENIDO_TYPES                                                              {$$ = {Nombre: "LISTA_TYPES" , vector : [$1,$3]};}            
           | CONTENIDO_TYPES                                                                                    {$$ = {Nombre: "LISTA_TYPES" , vector : [$1]};}
;

CONTENIDO_TYPES : Identificador S_DosPuntos TIPOS_DE_DATO                                                       {$$ = {Nombre: "CONTENIDO_TYPES", vector : [{Nombre: $1 ,vector:[]},$3] };}
                | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE                                            {$$ = {Nombre: "CONTENIDO_TYPES", vector : [{Nombre: $1 ,vector:[]},$3,$4] };}
;

SEPARADOR : S_Coma
          | S_PuntoComa
;

FIN_TYPES: S_LlaveCierra S_PuntoComa
         | S_LlaveCierra
;

/*---------------------------------------------DECLARACION DE TYPES---------------------------------------------------------*/
LISTA_DECLARACION_TYPES: LISTA_DECLARACION_TYPES SEPARADOR_DECLARACION_TYPES CONTENIDO_DECLARACION_TYPES        {$$ = {Nombre : "LISTA_DECLARACION_TYPES", vector : [$1,$3]};}
                        | CONTENIDO_DECLARACION_TYPES                                                           {$$ = {Nombre : "LISTA_DECLARACION_TYPES", vector : [$1]};}
;

CONTENIDO_DECLARACION_TYPES : Identificador S_DosPuntos LISTA_DE_ASIGNACIONES                                   {$$ = { Nombre : "CONTENIDO_DECLARACION_TYPES", vector : [{ Nombre : $1 , vector : []},$3]};}
;

SEPARADOR_DECLARACION_TYPES : S_Coma
                            | S_PuntoComa
;

/*---------------------------------------------TIPOS DE DATO---------------------------------------------------------*/
TIPOS_DE_DATO : T_Number                                                            {$$ = {Nombre: "TIPOS_DE_DATO" , vector : [{Nombre: $1 , vector : []}]};}
              | T_Boolean                                                           {$$ = {Nombre: "TIPOS_DE_DATO" , vector : [{Nombre: $1 , vector : []}]};}
              | T_String                                                            {$$ = {Nombre: "TIPOS_DE_DATO" , vector : [{Nombre: $1 , vector : []}]};}
              | T_Void                                                              {$$ = {Nombre: "TIPOS_DE_DATO" , vector : [{Nombre: $1 , vector : []}]};}
              | Identificador                                                       {$$ = {Nombre: "TIPOS_DE_DATO" , vector : [{Nombre: $1 , vector : []}]};}
;
//agrega tipos de dato a funciones anonimas
TIPAR_FUNCION : S_DosPuntos TIPOS_DE_DATO                                           {$$=$2;}
              |                                                                     {$$ = {Nombre : "TIPAR_FUNCION" ,vector:[{Nombre : "&epsilon;" , vector : []}]};}
;
/*---------------------------------------------ACCEDER A ATRIBUTOS---------------------------------------------------------*/

 ATRIBUTOS: ATRIBUTOS S_Punto CONT_ATRIBUTOS                                                      {$$ = {Nombre : "ATRIBUTOS" ,vector:[$1,$3]};}
          | CONT_ATRIBUTOS                                                                        {$$ = {Nombre : "ATRIBUTOS" ,vector:[$1]};}
 ;

 CONT_ATRIBUTOS:  Identificador L_CORCHETE_V                                                      {$$ = {Nombre: "CONT_ATRIBUTOS" , vector : [{Nombre: $1 , vector : []},$2]};}
               |  Identificador                                                                   {$$ = {Nombre: $1 , vector : []};}
;

/*---------------------------------------------EXPRESIONES---------------------------------------------------------*/
EXPRESION_G 
    : EXPRESION_G LOG_Concatenar EXPRESION_G                                                     { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G LOG_OR EXPRESION_G                                                             { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G REL_IgualIgual EXPRESION_G                                                     { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G REL_MayorIgualQue EXPRESION_G                                                  { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G REL_MayorQue EXPRESION_G                                                       { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G REL_MenorIgualQue EXPRESION_G                                                  { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G REL_MenorQue EXPRESION_G                                                       { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }
    | EXPRESION_G REL_Distinto EXPRESION_G                                                       { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }    
    | EXPRESION_G OP_Mas EXPRESION_G                                                             { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }                                                    
    | EXPRESION_G OP_Menos EXPRESION_G                                                           { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }                                                          
    | EXPRESION_G OP_Multiplicacion EXPRESION_G                                                  { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }                                                 
    | EXPRESION_G OP_Division EXPRESION_G                                                        { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }                                            
    | EXPRESION_G OP_Exponenciacion EXPRESION_G                                                  { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }                                                 
    | EXPRESION_G OP_Modulo EXPRESION_G                                                          { $$ = {Nombre:"EXPRESION_G",vector : [$1, {Nombre: $2 , vector : []},$3]}; }                                                                                                              
    | CONTENIDO_EXPRESION OP_Decremento                                                          { $$ = {Nombre:"EXPRESION_G",vector : [$1,{Nombre: $2 , vector : []}]}; }
    | CONTENIDO_EXPRESION OP_Incremento                                                          { $$ = {Nombre:"EXPRESION_G",vector : [$1,{Nombre: $2 , vector : []}]}; }
    | OP_Decremento CONTENIDO_EXPRESION                                                          { $$ = {Nombre:"EXPRESION_G",vector : [{Nombre: $1 , vector : []},$2]}; }
    | OP_Incremento CONTENIDO_EXPRESION                                                          { $$ = {Nombre:"EXPRESION_G",vector : [{Nombre: $1 , vector : []},$2]}; }
    | OP_Menos  CONTENIDO_EXPRESION     %prec UMINUS                                                     { $$ = {Nombre:"EXPRESION_G",vector : [{Nombre: $1 , vector : []},$2]}; }  
    | LOG_Not   EXPRESION_G     %prec UMINUS                                                     { $$ = {Nombre:"EXPRESION_G",vector : [{Nombre: $1 , vector : []},$2]}; }  
    | CONTENIDO_EXPRESION                                                                        { $$ = {Nombre:"EXPRESION_G",vector : [$1]}; } 
;

 CONTENIDO_EXPRESION
    : Entero                                                                                    {$$ = {Nombre: $1 , vector : []};}
    | Decimal                                                                                   {$$ = {Nombre: $1 , vector : []};}
    | R_True                                                                                    {$$ = {Nombre: $1 , vector : []};}
    | R_False                                                                                   {$$ = {Nombre: $1 , vector : []};}
    | Cadena                                                                                    {$$ = {Nombre: $1 , vector : []};}
    | Identificador S_ParentesisAbre S_ParentesisCierra                                         {$$ = {Nombre: "LLAMADA_FUNCION",vector : [{Nombre : $1, vector : []}]};}            
    | Identificador S_ParentesisAbre OPCIONAL S_ParentesisCierra                                {$$ = {Nombre: "LLAMADA_FUNCION",vector : [{Nombre : $1, vector : []},$3]};}  
    | S_ParentesisAbre EXPRESION_G S_ParentesisCierra                                           {$$ = $2;}
    | ATRIBUTOS                                                                                 {$$ = $1;}
    | ATRIBUTOS S_Punto R_Length                                                                {$$ = {Nombre : "FUNCION_LENGTH" , vector : [$1 , {Nombre : $3 , vector : []}]};}
    | ATRIBUTOS S_Punto R_Pop S_ParentesisAbre S_ParentesisCierra                               {$$ = {Nombre : "FUNCION_POP"    , vector : [$1 , {Nombre : $3 , vector : []}]};}
; /*ATRIBUTOS CONTIENE ID Y VECTOR */   

OPCIONAL 
    : OPCIONAL S_Coma EXPRESION_G                                                               {$$ = { Nombre : "OPCIONAL" , vector :[$1,$3]} ;}
    | EXPRESION_G                                                                               {$$ = { Nombre : "OPCIONAL" , vector :[$1]} ;}
; 