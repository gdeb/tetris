
var TetrisUI = require('./ui.js');
document.addEventListener("DOMContentLoaded", function () {
    var game = new TetrisUI();
    game.appendTo(document.body);
});
