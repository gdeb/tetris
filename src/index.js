/* global document */

let TetrisGame = require('./tetris-component.js');

document.addEventListener("DOMContentLoaded", function () {
	React.renderComponent(TetrisGame(null), document.body);
});
