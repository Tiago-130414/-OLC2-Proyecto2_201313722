function createJSTree(jsondata) { 
    var divArbol = document.getElementById('JSTree'); 
    $(divArbol).jstree("destroy").empty(); 
    $(divArbol).jstree({ 'core' : {
        'data' : jsondata
    } });
}
