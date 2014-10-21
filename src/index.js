/* global document */

let Tetris = require('./ui.js');

document.addEventListener("DOMContentLoaded", function () {
	let tetris = new Tetris();
	tetris.appendTo(document.body);
});
