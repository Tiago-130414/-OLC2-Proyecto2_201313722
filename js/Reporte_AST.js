function reporteAST() {
  var texto = Codigo.getValue();
  var arbol = Reporte_Arbol.parse(texto);
  var texto = Consola.getValue();
  Consola.setValue(
    texto +
      "*---------------------------Reporte AST Generado!---------------------------*\n"
  );
  d3.select("#ArbolAST1")
    .graphviz()
    .renderDot(
      "digraph{" +
        "ordering=out;" +
        "	graph [splines=compound];" +
        "graph [nodesep=1];" +
        'node [shape = record, style="rounded,filled", color="#FF5800",width=0.7,height=0.5,fontcolor = "white",fontname ="helvetica"];' +
        'edge[ color = "#34495e" , penwidth = "2"]' +
        arbol +
        "}"
    );
  alert("Reporte AST Generado!");
}
