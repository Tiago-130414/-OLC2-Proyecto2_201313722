var Consola = CodeMirror.fromTextArea(document.getElementById("salidaTxt"), {
  mode: "javascript",
  styleActiveLine: true,
  theme: "material-palenight",
  lineNumbers: true,
  matchBrackets: true,
  continueComments: "Enter",
  hint: true,
});
Consola.setSize("1100", "400");

var TraduccionTP = CodeMirror.fromTextArea(
  document.getElementById("traduccion"),
  {
    mode: "javascript",
    theme: "material-palenight",
    lineNumbers: true,
    smartIndent: true,
    matchBrackets: true,
    continueComments: "Enter",
    hint: true,
  }
);
TraduccionTP.setSize("500", "500");

var Codigo = CodeMirror.fromTextArea(document.getElementById("codigoTXT"), {
  mode: "javascript",
  theme: "material-palenight",
  lineNumbers: true,
  matchBrackets: true,
  continueComments: "Enter",
  hint: true,
});
Codigo.setSize("500", "500");
