/* global document */

var TetrisUI = require('./tetris-ui.js');
document.addEventListener("DOMContentLoaded", function () {
    var game = new TetrisUI();
    game.appendTo(document.body);
});
