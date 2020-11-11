/* descripcion: ANALIZADOR DEL LENGUAJE JAVA */
// segmento de codigo, importaciones y todo dentro de 
%{
    var tablaErrores = [];
%}
/*  Directivas lexicas, expresiones regulares ,Analisis Lexico */
%lex
%options case-insensitive
%%
\s+                   /* salta espacios en blanco */
"//".*               {/* comentario simple*/}
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/] {/*comentario multilinea*/}

/*  CADENAS  */
[\"][^\\\"]*([\\][\\\"'ntr][^\\\"]*)*[\"]            {yytext = yytext.substr(1,yyleng-2);  return 'Cadena'; }
[\'][^\\\']*([\\][\\\'"ntr][^\\\']*)*[\']            {yytext = yytext.substr(1,yyleng-2);  return 'Cadena'; }

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
"new"                                               {  return 'R_New'; }
"CharAt"                                            {  return 'R_CharAt'; }
"ToLowerCase"                                       {  return 'R_Tlower';}
"ToUpperCase"                                       {  return 'R_Touppper';}
"Concat"                                            {  return 'R_Concat'; }
"length"                                            {  return 'R_Length';}
"function"                                          {  return 'R_Funcion';}
"null"                                              {  return 'R_Null';}

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
[0-9]+("."[0-9]+)\b                                 {return 'Decimal';}
[0-9]+\b                                            {return 'Entero';}

/*  IDENTIFICADORES */
([a-zA-Z_])[a-zA-Z0-9_]*                            {return 'Identificador';}
<<EOF>>                                             {  return 'EOF'; }
.                                                   {tablaErrores.push({ tipo  : ' Error_Lexico ', Error  : yytext ,  Fila  : yylloc.first_line , Columna  :  yylloc.first_column });}
/lex
%{
    function expresionB (OpI,operacion,opD){
        return {
            OpIzq : OpI,
            tipo: operacion,
            OpDer : opD,
        };
    }

    function expresionU (OpI,operacion){
        return {
            OpIzq : OpI,
            operacion: operacion,
        };
    }

    function limpiarErrores(){
        tablaErrores = [];
    }

    function UND(td){
        return {tipo : "PRIMITIVO" , tipoDato : td , valor:""};
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
INICIO : CONT EOF {var tErr = tablaErrores;limpiarErrores();return {jsonInt : $1 , err : tErr};}
;
/*---------------------------------------------LISTA DE CONTENIDO GLOBAL---------------------------------------------------------*/
CONT: LISTA_CONTENIDO 
    |                                   {$$ = [];}                        
;

LISTA_CONTENIDO : LISTA_CONTENIDO CONTENIDO {$1.push($2);$$ = $1;}
                | CONTENIDO {$$=[$1];}
;

//CONTENIDO GLOBAL
CONTENIDO : FUNCIONES
          | ESTRUCTURAS_DE_CONTROL      
          |  error  {$$ ='';tablaErrores.push({ tipo  : ' Error_Sintactico ', Error  : yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;
/*---------------------------------------------DEFINICION DE FUNCIONES---------------------------------------------------------*/
FUNCIONES : R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_LlaveAbre CONT S_LlaveCierra
          | R_Funcion Identificador S_ParentesisAbre PARAM S_ParentesisCierra S_DosPuntos TIPOS_DE_DATO S_LlaveAbre CONT S_LlaveCierra 
;
/*---------------------------------------------LISTADO DE ESTRUCTURAS DE CONTROL---------------------------------------------------------*/
EDD:LISTADO_ESTRUCTURAS                 
   |                                                                    {$$= [];}
;

LISTADO_ESTRUCTURAS : LISTADO_ESTRUCTURAS CONT_ESTRUCTURAS_CONTROL      {$1.push($2);$$ = $1;}    
                    | CONT_ESTRUCTURAS_CONTROL                          {$$ = [$1];}          
;

CONT_ESTRUCTURAS_CONTROL : ESTRUCTURAS_DE_CONTROL
                         | error  {$$ ='';tablaErrores.push({ tipo  : ' Error_Sintactico ', Error  : yytext , Fila  : this._$.first_line , Columna  :  this._$.first_column });}
;

ESTRUCTURAS_DE_CONTROL: VARIABLES                       
                      | ASIGNACION                      
                      | LISTADO_IF ELSE                                 {var vec = $1; vec = vec.concat($2);$$ = {tipo : "LISTADO_IF" , contenido : vec};} 
                      | SWITCH                          
                      | IMPRIMIR                        
                      | WHILE                           
                      | DO_WHILE                        
                      | FOR                             
                      | FOR_OF                          
                      | FOR_IN                          
                      | SENTENCIAS_TRANSFERENCIA                  
                      | LLAMADA_FUNC                    
                      | TYPES            
                      | M_STRING               
;
/*--------------------------------------------- FUNCIONES STRING ---------------------------------------------------------*/
M_STRING : ATRIBUTOS MET_STRING S_PuntoComa
         | Cadena  MET_STRING S_PuntoComa
;
/*--------------------------------------------- SENTENCIAS DE TRANSFERENCIA ---------------------------------------------------------*/

SENTENCIAS_TRANSFERENCIA : R_Break S_PuntoComa                                                  
                         | R_Continue S_PuntoComa                                               
                         | R_Return S_PuntoComa                                                 
                         | R_Return EXPRESION_G S_PuntoComa                                     
;

/*--------------------------------------------- LISTADO IF---------------------------------------------------------*/
LISTADO_IF : LISTADO_IF R_Else IF                                                               {var elsif = $3;elsif.tipo = "ELSEIF";$1.push(elsif);$$ = $1;}
           | IF                                                                                 {var json =[]; json.push($1); $$ = json;}      
;

IF : R_If S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra         {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};$$ = {tipo : "IF" , expresion : exp , instrucciones : $6 , fila: this._$.first_line, columna: this._$.first_column};}
;

ELSE : R_Else S_LlaveAbre EDD S_LlaveCierra                                                     {$$ = { tipo : "ELSE" , instrucciones : $3 , fila: this._$.first_line, columna: this._$.first_column};}
     |                                                                                          {$$ = [];}
;

/*---------------------------------------------SWITCH---------------------------------------------------------*/
SWITCH : R_Switch S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre CASE DEFINIR_DEFAULT S_LlaveCierra                 {var vec = [];vec = vec.concat($6);vec = vec.concat($7) ; var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];}; $$ = {tipo : "SWITCH" , expresion : exp , instrucciones : vec , fila: this._$.first_line, columna: this._$.first_column};}
;
/*---------------------------------------------LISTADO DE CASE---------------------------------------------------------*/

CASE : LISTA_CASE                                                   
     |                                                                                            {$$ = [];}
;

LISTA_CASE: LISTA_CASE DEFINIR_CASE                                                               {$1.push($2);$$=$1;}
          | DEFINIR_CASE                                                                          {var vec = []; vec.push($1);$$ = vec}  
;

DEFINIR_CASE:R_Case EXPRESION_G S_DosPuntos EDD                                                   {var exp;if(Array.isArray($2)){exp = $2;}else{exp = [$2];};$$ = { tipo : "CASE" , expresion :exp , instrucciones : $4 , fila: this._$.first_line, columna: this._$.first_column};}   
;
/*---------------------------------------------DEFINICION DE DEFAULT---------------------------------------------------------*/

DEFINIR_DEFAULT: R_Default S_DosPuntos EDD                                                         {$$ = [{tipo : "DEFAULT" , instrucciones : $3 , fila: this._$.first_line, columna: this._$.first_column}];}                 
               |                                                                                   {$$ = [];} 
;
/*---------------------------------------------IMPRIMIR---------------------------------------------------------*/
IMPRIMIR: R_Console S_Punto R_Log S_ParentesisAbre PARAMETROS_FUNC S_ParentesisCierra S_PuntoComa                  {$$ = {tipo : "IMPRIMIR" , instruccion: "CONSOLE", contenido: $5};}
;

FUNC: EXPRESION_G                       {var arr;if(Array.isArray($1)){arr = $1;}else{arr = [$1];} ;$$ = arr;}
    |                                   {$$ = [];}
;
/*---------------------------------------------WHILE---------------------------------------------------------*/
WHILE: R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra                        {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];}; $$ = {tipo : "WHILE" , expresion : exp, instrucciones : $6 , fila: this._$.first_line, columna: this._$.first_column};}
;
/*---------------------------------------------DO-WHILE---------------------------------------------------------*/
DO_WHILE: R_Do S_LlaveAbre EDD S_LlaveCierra R_While S_ParentesisAbre EXPRESION_G S_ParentesisCierra S_PuntoComa    {var exp;if(Array.isArray($7)){exp = $7;}else{exp = [$7];};$$ = {tipo : "DOWHILE" , instrucciones : $3 , expresion : exp , fila: this._$.first_line, columna: this._$.first_column};}
;

/*---------------------------------------------FOR---------------------------------------------------------*/
FOR : R_For S_ParentesisAbre CONT_FOR EXPRESION_G S_PuntoComa FIN_FOR S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra  {var exp;if(Array.isArray($4)){exp = $4;}else{exp = [$4];};$$ = {tipo : "FOR" , inicio : $3 , expresion : exp , fin: $6 , instrucciones : $9 , fila: this._$.first_line, columna: this._$.first_column};}
;

CONT_FOR: R_Let Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G S_PuntoComa          {var exp;if(Array.isArray($6)){exp = $6;}else{exp = [$6];};var cont = [{tipo : "VARIABLE", identificador : $2, tipoDato: undefined,tipoDDV: $4 , valor : exp , fila: this._$.first_line , columna: this._$.first_column}];$$ = {tipo: "DECLARACION",modificador : $1 , contenido : cont};}                                                                                 
    | Identificador S_PuntoComa                                                                  {$$ = {tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $1, fila: this._$.first_line, columna: this._$.first_column};}                              
    | Identificador S_Igual EXPRESION_G S_PuntoComa                                              {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};$$ = exp;$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $1, fila: this._$.first_line, columna: this._$.first_column}], ope : '=', valor: exp, fila: this._$.first_line, columna: this._$.first_column};}                             
;

FIN_FOR
    : Identificador S_Igual EXPRESION_G                                                          {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};$$ = exp;$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $1, fila: this._$.first_line, columna: this._$.first_column}], ope : '=', valor: exp, fila: this._$.first_line, columna: this._$.first_column};}                                  
    | Identificador OP_Incremento                                                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $1, fila: this._$.first_line, columna: this._$.first_column}] ,ope : '++D' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}
    | OP_Incremento Identificador                                                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $2, fila: this._$.first_line, columna: this._$.first_column}] ,ope : 'A++' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}
    | Identificador OP_Decremento                                                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $1, fila: this._$.first_line, columna: this._$.first_column}] ,ope : '--D' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}   
    | OP_Decremento Identificador                                                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $2, fila: this._$.first_line, columna: this._$.first_column}] ,ope : 'A--' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}                                             
;
/*---------------------------------------------FOR IN---------------------------------------------------------*/

FOR_IN: R_For S_ParentesisAbre CONT_FOR_IN S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra         
;

CONT_FOR_IN : R_Const Identificador R_In Identificador                                              
            | R_Let Identificador R_In Identificador                                                
            | Identificador R_In Identificador                                                      
;


/*---------------------------------------------FOR OF---------------------------------------------------------*/
FOR_OF: R_For S_ParentesisAbre CONT_FOR_OF S_ParentesisCierra S_LlaveAbre EDD S_LlaveCierra         
;

CONT_FOR_OF : R_Const Identificador R_Of Identificador                                              
            | R_Let Identificador R_Of Identificador                                                
            | Identificador R_Of Identificador                                                      
;

/*---------------------------------------------ASIGNACION VARIABLES---------------------------------------------------------*/

ASIGNACION : ATRIBUTOS S_Igual LISTA_DE_ASIGNACIONES COMPLETAR_ASIGNACION S_PuntoComa   {var vector = [{tipo : "ASIGNACION" , identificador : $1 , ope : '=' ,valor : $3}]; vector = vector.concat($4) ;$$ = {tipo : "LISTA_ASIGNACION", contenido : vector };}
           //incrementos 
           | ATRIBUTOS OP_Incremento COMPLETAR_ASIGNACION S_PuntoComa                   {$$ = {tipo : "LISTA_ASIGNACION", contenido : [{tipo : "ASIGNACION" , identificador : $1 , ope : '++D' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column}].concat($3)};}
           | OP_Incremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                   {$$ = {tipo : "LISTA_ASIGNACION", contenido : [{tipo : "ASIGNACION" , identificador : $2 , ope : 'A++' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column}].concat($3)};}
           | ATRIBUTOS OP_Decremento COMPLETAR_ASIGNACION S_PuntoComa                   {$$ = {tipo : "LISTA_ASIGNACION", contenido : [{tipo : "ASIGNACION" , identificador : $1 , ope : '--D' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column}].concat($3)};}
           | OP_Decremento ATRIBUTOS COMPLETAR_ASIGNACION S_PuntoComa                   {$$ = {tipo : "LISTA_ASIGNACION", contenido : [{tipo : "ASIGNACION" , identificador : $2 , ope : 'A--' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column}].concat($3)};}
;

COMPLETAR_ASIGNACION : LISTADO_ASIGNACION
                      |                                                                 {$$ = [];}
;

LISTADO_ASIGNACION: LISTADO_ASIGNACION  CONTENIDO_ASIGNACION                            {$1.push($2);$$ = $1;}
                  | CONTENIDO_ASIGNACION                                                {$$ = [$1];}
;

CONTENIDO_ASIGNACION: S_Coma Identificador S_Igual EXPRESION_G                          {var exp;if(Array.isArray($4)){exp = $4;}else{exp = [$4];};$$ = exp;$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $2, fila: this._$.first_line, columna: this._$.first_column}], ope : '=', valor: exp, fila: this._$.first_line, columna: this._$.first_column};}
                    | S_Coma Identificador OP_Incremento                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $2, fila: this._$.first_line, columna: this._$.first_column}] ,ope : '++D' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}
                    | S_Coma OP_Incremento Identificador                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $3, fila: this._$.first_line, columna: this._$.first_column}] ,ope : 'A++' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}
                    | S_Coma Identificador OP_Decremento                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $2, fila: this._$.first_line, columna: this._$.first_column}] ,ope : '--D' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}
                    | S_Coma OP_Decremento Identificador                                {$$ = {tipo : "ASIGNACION" , identificador : [{tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $3, fila: this._$.first_line, columna: this._$.first_column}] ,ope : 'A--' , valor: undefined , fila: this._$.first_line, columna: this._$.first_column};}
;

LISTA_DE_ASIGNACIONES : EXPRESION_G                                                     {var exp;if(Array.isArray($1)){exp = $1;}else{exp = [$1];};$$ = exp;}
                      | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra                 {$$ = $2;}
                      | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra               {$$ = $2;}
;
/*---------------------------------------------LISTA DE CORCHETES PARA MATRIZ Y ARRAY---------------------------------------------------------*/
///LISTA CORCHETES SIN VALOR
L_CORCHETE : L_C                                                            
;

L_C: L_C LISTA_CORCHETE                                                             
    |LISTA_CORCHETE                                                                 
;

/*LISTA PARA DECLARACIONES*/
LISTA_CORCHETE : S_CorcheteAbre S_CorcheteCierra                                    
;
///LISTA CORCHETES CON VALOR
L_CORCHETE_V : L_C_V
;

L_C_V : L_C_V LISTA_AS_MV                                                           
      | LISTA_AS_MV                                                                 
;

/*LISTA PARA ASIGNACIONES MATRIZ Y VECTOR*/
LISTA_AS_MV: S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra         {$$ = $2;}               
;
/*---------------------------------------------LISTA DE ASIGNACION ARRAY DENTRO DE ARRAY---------------------------------------------------------*/
CONT_ASIG_ARRAY: LISTA_ASIGN_ARRAY
               |                                                            
;

LISTA_ASIGN_ARRAY: LISTA_ASIGN_ARRAY S_Coma CONT_ARRAY_ASIGN_VV             {var v = $1.concat($3);$$ = v;}
                 | CONT_ARRAY_ASIGN_VV                                      {$$ = $1;}
;   

CONT_ARRAY_ASIGN_VV: EXPRESION_G                                            {var exp;if(Array.isArray($1)){exp = $1;}else{exp = [$1];};$$ = exp;}
                   | S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra        {$$ = $2;}
                   | S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra      {$$ = $2;}
;


/*---------------------------------------------VARIABLES---------------------------------------------------------*/

VARIABLES : R_Let LISTADO_VAR S_PuntoComa                                       {$$ = {tipo: "DECLARACION",modificador : $1 , contenido : $2}; }
          | R_Const LISTADO_VAR S_PuntoComa                                     {$$ = {tipo: "DECLARACION",modificador : $1 , contenido : $2}; }
;

/*---------------------------------------------LISTADO VARIABLES---------------------------------------------------------*/

LISTADO_VAR : LISTADO_VAR S_Coma CONT_VAR                                       {$1.push($3); $$ = $1;}  
            | CONT_VAR                                                          {$$ = [$1];}
;
/*--------------------------------------------- DEFINICION DE VARIABLES---------------------------------------------------------*/

CONT_VAR: Identificador S_DosPuntos TIPOS_DE_DATO /*declaracion de variable con tipo de dato*/              { $$ = {tipo : "VARIABLE" , identificador : $1 , tipoDato: undefined ,tipoDDV: $3, valor : undefined , fila: this._$.first_line , columna: this._$.first_column};}                                                                          
        //| Identificador /*declaracion de variable solo id*/                                     
        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual EXPRESION_G/*declaracion de variable con tipo y asignacion de valor*/ {var exp;if(Array.isArray($5)){exp = $5;}else{exp = [$5];};$$ = {tipo : "VARIABLE", identificador : $1, tipoDato: undefined,tipoDDV: $3 , valor : exp , fila: this._$.first_line , columna: this._$.first_column};}
        //| Identificador S_Igual EXPRESION_G /*declaracion de variable con asignacion de valor*/                                     


        | Identificador S_Igual S_CorcheteAbre CONT_ASIG_ARRAY S_CorcheteCierra /*array*/                   {$$ = {tipo : "ARRAY" , identificador : $1 , tipoDato: undefined , valor : $4 , fila: this._$.first_line , columna: this._$.first_column};}                        
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE/*array*/                                       {$$ = {tipo : "ARRAY" , identificador : $1 , tipoDato: $3 , valor : undefined , fila: this._$.first_line , columna: this._$.first_column};}                     
        | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual L_CORCHETE_V /*array*/                 {$$ = {tipo : "ARRAY" , identificador : $1 , tipoDato: $3 , valor : $6 , fila: this._$.first_line , columna: this._$.first_column};}                      


        | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/   {$$ = {tipo : "TYPE" , identificador : $1 , tipoDato: $3 , valor : $6 , fila: this._$.first_line , columna: this._$.first_column};}                               
        | Identificador S_Igual S_LlaveAbre LISTA_DECLARACION_TYPES S_LlaveCierra /*types*/                             {$$ = {tipo : "TYPE" , identificador : $1 , tipoDato: undefined , valor : $4 , fila: this._$.first_line , columna: this._$.first_column};}                               
;

/*---------------------------------------------LLAMADAS A FUNCION---------------------------------------------------------*/

LLAMADA_FUNC
    : Identificador S_ParentesisAbre PARAMETROS_FUNC S_ParentesisCierra S_PuntoComa                  
;

PARAMETROS_FUNC
    : PARAMETROS_FUNC S_Coma EXPRESION_G        {var exp; var arr;if(Array.isArray($3)){arr = $3;}else{arr = [$3];}; exp = $1.concat(arr);$$ = exp;}
    | EXPRESION_G                               {var arr;if(Array.isArray($1)){arr = $1;}else{arr = [$1];};$$ = arr;}                                               
    |                                           {$$ = [];}                           
;
/*---------------------------------------------PARAMETROS---------------------------------------------------------*/
PARAM: LISTA_PARAMETROS
     |                                                  
;

LISTA_PARAMETROS : LISTA_PARAMETROS S_Coma PARAMETROS 
                 | PARAMETROS              
;

PARAMETROS : Identificador S_DosPuntos TIPOS_DE_DATO                                            
           | Identificador S_DosPuntos TIPOS_DE_DATO S_Igual LISTA_DE_ASIGNACIONES              
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE                                 
           | Identificador S_DosPuntos TIPOS_DE_DATO L_CORCHETE S_Igual LISTA_DE_ASIGNACIONES              
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
LISTA_DECLARACION_TYPES: LISTA_DECLARACION_TYPES SEPARADOR_DECLARACION_TYPES CONTENIDO_DECLARACION_TYPES  {$1.push($3);$$ = $1;}      
                        | CONTENIDO_DECLARACION_TYPES                                                     {$$ = [$1];}      
;

CONTENIDO_DECLARACION_TYPES : Identificador S_DosPuntos LISTA_DE_ASIGNACIONES                             {$$ = {tipo : "TYPE" , identificador : [{tipo : "VALOR" , tipoDato: "IDE" , valor : $1, fila: this._$.first_line, columna: this._$.first_column}] , valor : $3};}      
;

SEPARADOR_DECLARACION_TYPES : S_Coma                                                                            
                            | S_PuntoComa                                                                       
;

/*---------------------------------------------TIPOS DE DATO---------------------------------------------------------*/
// ESTO NO SE MODIFICA PARA RETORNAR VALORES PARA FORMAR JSON
TIPOS_DE_DATO : T_Number                                                    {$$ = "NUMERO";}                    
              | T_Boolean                                                   {$$ = "BOOLEAN";}    
              | T_String                                                    {$$ = "CADENA";}    
              | T_Void                                                      {$$ = "VOID";}    
              | Identificador                                                                  
;
//agrega tipos de dato a funciones anonimas
TIPAR_FUNCION : S_DosPuntos TIPOS_DE_DATO                                                       
              |
;
/*---------------------------------------------ACCEDER A ATRIBUTOS---------------------------------------------------------*/

 ATRIBUTOS: ATRIBUTOS S_Punto CONT_ATRIBUTOS                                                {$1.push($3);$$ = $1;}
          | CONT_ATRIBUTOS                                                                  {$$ = [$1];}                                                          
 ;

 CONT_ATRIBUTOS:  Identificador L_CORCHETE_V                                                    
               |  Identificador                                                             {$$ = {tipo : "VALOR" , tipoDato: "IDENTIFICADOR" , identificador : $1, fila: this._$.first_line, columna: this._$.first_column};}
;

/*---------------------------------------------EXPRESIONES---------------------------------------------------------*/
EXPRESION_G 
    : EXPRESION_G LOG_Concatenar EXPRESION_G                                                {$$ = expresionB($1,'&&',$3);}                                            
    | EXPRESION_G LOG_OR EXPRESION_G                                                        {$$ = expresionB($1,'||',$3);}      
    | EXPRESION_G REL_IgualIgual EXPRESION_G                                                {$$ = expresionB($1,'==',$3);}      
    | EXPRESION_G REL_MayorIgualQue EXPRESION_G                                             {$$ = expresionB($1,'>=',$3);}                       
    | EXPRESION_G REL_MayorQue EXPRESION_G                                                  {$$ = expresionB($1,'>',$3);}      
    | EXPRESION_G REL_MenorIgualQue EXPRESION_G                                             {$$ = expresionB($1,'<=',$3);}     
    | EXPRESION_G REL_MenorQue EXPRESION_G                                                  {$$ = expresionB($1,'<',$3);}      
    | EXPRESION_G REL_Distinto EXPRESION_G                                                  {$$ = expresionB($1,'!=',$3);}           
    | EXPRESION_G OP_Mas EXPRESION_G                                                        {$$ = expresionB($1,'+',$3);}     
    | EXPRESION_G OP_Menos EXPRESION_G                                                      {$$ = expresionB($1,'-',$3);}       
    | EXPRESION_G OP_Multiplicacion EXPRESION_G                                             {$$ = expresionB($1,'*',$3);}     
    | EXPRESION_G OP_Division EXPRESION_G                                                   {$$ = expresionB($1,'/',$3);}       
    | EXPRESION_G OP_Exponenciacion EXPRESION_G                                             {$$ = expresionB($1,'**',$3);}      
    | EXPRESION_G OP_Modulo EXPRESION_G                                                     {$$ = expresionB($1,'%',$3);}                                           
    | CONTENIDO_EXPRESION OP_Decremento %prec PRUEBA                                        {$$ = expresionB($1,'--',undefined);}     
    | CONTENIDO_EXPRESION OP_Incremento %prec PRUEBA                                        {$$ = expresionB($1,'++',undefined);}     
    | OP_Decremento CONTENIDO_EXPRESION                                                     {$$ = expresionB(undefined,'--',$2);}      
    | OP_Incremento CONTENIDO_EXPRESION                                                     {$$ = expresionB(undefined,'++',$2);}      
    | OP_Menos  CONTENIDO_EXPRESION     %prec UMINUS                                        {$$ = expresionB(UND("ENTERO"),'-',$2);}      
    | LOG_Not   EXPRESION_G     %prec UMINUS                                                {$$ = expresionB(UND("BOOLEAN"),'!' ,$2);} 
    | CONTENIDO_EXPRESION                                                                   
;

 CONTENIDO_EXPRESION
    : Entero                                                                                {$$ = {tipo:"PRIMITIVO" , tipoDato : "ENTERO" , valor: $1 + ".0",fila: this._$.first_line , columna: this._$.first_column};}                     
    | Decimal                                                                               {$$ = {tipo:"PRIMITIVO" , tipoDato : "DECIMAL", valor: $1,fila: this._$.first_line , columna: this._$.first_column};}    
    | R_True                                                                                {$$ = {tipo:"PRIMITIVO" , tipoDato : "BOOLEAN", valor: $1,fila: this._$.first_line , columna: this._$.first_column};}                                      
    | R_False                                                                               {$$ = {tipo:"PRIMITIVO" , tipoDato : "BOOLEAN", valor: $1,fila: this._$.first_line , columna: this._$.first_column};}                                                                          
    | Cadena                                                                                {$$ = {tipo:"VALOR"     , tipoDato : "CADENA" , valor: $1,fila: this._$.first_line , columna: this._$.first_column};} 
    | R_Null                                                                                {$$ = {tipo:"VALOR"     , tipoDato : "NULL" , valor: $1,fila: this._$.first_line , columna: this._$.first_column};} 
    | Cadena MET_STRING     /*Metodos string*/
    | ATRIBUTOS MET_STRING    /*Metodos string*/                                                                             
    | Identificador S_ParentesisAbre S_ParentesisCierra                                     {$$ = {tipo : "LLAMADA_F" , identificador : $1 , parametros : [] , fila : this._$.first_line, columna: this._$.first_column};}
    | Identificador S_ParentesisAbre S_ParentesisCierra MET_STRING   /*Metodos string*/                                     
    | Identificador S_ParentesisAbre OPCIONAL S_ParentesisCierra                            {$$ = {tipo : "LLAMADA_F" , identificador : $1 , parametros : $3 , fila : this._$.first_line, columna: this._$.first_column};}
    | Identificador S_ParentesisAbre OPCIONAL S_ParentesisCierra MET_STRING  /*Metodos string*/                              
    | S_ParentesisAbre EXPRESION_G S_ParentesisCierra                                       {$$ = $2;}
    | S_ParentesisAbre EXPRESION_G S_ParentesisCierra   MET_STRING    /*Metodos string*/                                                                                                         
    | ATRIBUTOS                                                                             {$$ = $1;}    
    | ATRIBUTOS S_Punto R_Length
                                                                 
; /*ATRIBUTOS CONTIENE ID Y VECTOR */

OPCIONAL 
    : OPCIONAL S_Coma EXPRESION_G                                                           {var exp;if(Array.isArray($3)){exp = $3;}else{exp = [$3];};var v; v = $1.concat(exp);$$=v;}                                                                 
    | EXPRESION_G                                                                           {var exp;if(Array.isArray($1)){exp = $1;}else{exp = [$1];};$$ = exp;}                                                           
; 

/*----------------------------------------------------METODOS STRING----------------------------------------------------*/
MET_STRING :L_MET_STRING
;

L_MET_STRING : L_MET_STRING  CONT_MET_STRING
             | CONT_MET_STRING
;   

CONT_MET_STRING: S_Punto R_CharAt S_ParentesisAbre EXPRESION_G S_ParentesisCierra
               | S_Punto R_Tlower S_ParentesisAbre S_ParentesisCierra
               | S_Punto R_Touppper S_ParentesisAbre S_ParentesisCierra
               | S_Punto R_Concat S_ParentesisAbre OPCIONAL S_ParentesisCierra
;