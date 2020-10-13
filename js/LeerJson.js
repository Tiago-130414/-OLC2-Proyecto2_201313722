function leerJsonErroresLS(json) {
  var cadErrores = "<html>\n";
  cadErrores += "\t<head>\n";
  cadErrores += "<style>\n";
  cadErrores += "body{\n";
  cadErrores += "font-family: Arial;\n";
  cadErrores += "margin: 0;\n";
  cadErrores += "text-align: center;\n";
  cadErrores += "}\n";
  cadErrores += ".header{\n";
  cadErrores += "padding: 60px;\n";
  cadErrores += "text-align: center;\n";
  cadErrores += "background: #1abc9c;\n";
  cadErrores += "color: white;\n";
  cadErrores += " font-size: 30px;\n";
  cadErrores += "}";
  cadErrores += "table th{\n";
  cadErrores += "border: 1px solid #ddd;";
  cadErrores += "padding: 8px;\n";
  cadErrores += "}\n";
  cadErrores += "table th {\n";
  cadErrores += "padding-top: 12px;\n";
  cadErrores += "padding-bottom: 12px;\n";
  cadErrores += "text-align: center;\n";
  cadErrores += "background-color: #1abc9c;\n";
  cadErrores += "color: black;\n";
  cadErrores += "}\n";
  cadErrores += "</style>\n";
  cadErrores += "\t\t<title>Lista de errores</title>\n";
  cadErrores += "\t</head>\n";
  cadErrores += "\t<body>\n";
  cadErrores += '<div class="header">\n';
  cadErrores += "\t\t <h2>TABLA DE ERRORES LEXICOS Y SINTACTICOS</h2>\n";
  cadErrores += "</div>\n";
  cadErrores += "<br><br>\n";
  cadErrores +=
    '<table align="center" border = 5 CELLPADDING=10 CELLSPACING=10>\n';
  cadErrores += "<tr>\n";
  cadErrores += '<th scope="row">NUM</th>\n';
  cadErrores += "<th>Tipo Error</th>\n";
  cadErrores += "<th>Error</th>\n";
  cadErrores += "<th>Fila</th>\n";
  cadErrores += "<th>Columna</th>\n";
  cadErrores += "</tr>\n";
  cadErrores += json;
  cadErrores += "\t</body>\n";
  cadErrores += "</table>\n";
  cadErrores += "</BODY>\n";
  cadErrores += "</HTML>\n";

  download("Errores.html", cadErrores);
}

function download(filename, text) {
  var element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}


/*------------------------------------------------  REPORTE CLASE COPIA  ------------------------------------------------*/

/*
Reporte de Clases Copia
Este reporte deberá mostrar un listado de todas las clases que se consideren como copia,
para considerar una clase como clase copia se deberá de verificar que tenga el mismo
nombre y los mismos métodos y/o funciones. Este reporte debe mostrar el nombre de la
clase, cantidad de métodos y/o funciones que contiene.



function reporteClaseCopiaP(json1,json2){
  var txt = document.getElementById("salidaTxt");
  var reporte = "";
  json1.forEach( element =>{
    if(element.Tipo == 'Clase'){
      reporte += "Clase: " + element.Tipo + "Nombre: " + element.Tipo + "\n"
    }else{
      reporte = "kk"
    }
  });
  console.log(reporte);
  txt.innerHTML = reporte;
}

function nombreClase(){

}


*/


