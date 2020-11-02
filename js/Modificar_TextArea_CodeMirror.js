var Consola = CodeMirror.fromTextArea(document.getElementById("salidaTxt"), {
  theme: "material-palenight",
  lineNumbers: true,
  smartIndent: true,
  matchBrackets: true,
  continueComments: "Enter",
  mode: "javascript",
  hint: true,
});
Consola.setSize("1100", "400");

var TraduccionTP = CodeMirror.fromTextArea(
  document.getElementById("traduccion"),
  {
    theme: "material-palenight",
    lineNumbers: true,
    smartIndent: true,
    matchBrackets: true,
    continueComments: "Enter",
    mode: "javascript",
    hint: true,
  }
);
TraduccionTP.setSize("500", "500");

var Codigo = CodeMirror.fromTextArea(document.getElementById("codigoTXT"), {
  theme: "material-palenight",
  mode: "javascript",
  lineNumbers: true,
  matchBrackets: true,
  continueComments: "Enter",
  hint: true,
});
Codigo.setSize("500", "500");
