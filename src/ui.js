
var VDOM = require('./vdom.js'),
    Tetris = require('./tetrisGame.js');

var Component = VDOM.Component,
    div = VDOM.div,
    h1 = VDOM.h1,
    p = VDOM.p,
    actions = VDOM.createActions('startGame', 'stopGame');

//-----------------------------------------------------------------------------
function TetrisUI () {
    var self = this;
    this.state = new MainMenu();
    Component.call(this);
    window.addEventListener('keypress', function (ev) {
        self.state.onKeyPress(ev);
    });
    window.addEventListener('keydown', function (ev) {
        self.state.onKeyDown(ev);
    });
    this.onAction('startGame', function () {
        self.updateState(new InGame());
    });
    this.onAction('stopGame', function () {
        self.updateState(new MainMenu());
    });
}
TetrisUI.prototype = Object.create(Component.prototype);
TetrisUI.prototype.render = function () {
    return this.state;
};
TetrisUI.prototype.updateState = function (state) {
    this.state.destroy();
    this.state = state;
    this.state.appendTo(this.parentNode);
};
module.exports = TetrisUI;

//-----------------------------------------------------------------------------
function GameState () {
    Component.call(this);
}
GameState.prototype = Object.create(Component.prototype);
GameState.prototype.onKeyPress = function () {};
GameState.prototype.onKeyDown = function () {};

//-----------------------------------------------------------------------------
function MainMenu () {
    GameState.call(this);
}
MainMenu.prototype = Object.create(GameState.prototype);
MainMenu.prototype.render = function () {
    return div({className: "main-menu"},
            h1(null, "Tetris"),
            p(null, "Press 'p' to play"));
};
MainMenu.prototype.onKeyPress = function (event) {
    if (event.which === 112) actions.startGame();
};

//-----------------------------------------------------------------------------
function InGame () {
    GameState.call(this);
    this.game = new Tetris();
    this.cells = [];
    while (this.cells.length < 200) this.cells.push(div({className:"cell"}));
    this.updateBoard();
    var self = this;
    this.tick = setInterval(function () {
        self.game.tick();
        self.updateBoard();
    }, 1000);
}
InGame.prototype = Object.create(GameState.prototype);
InGame.prototype.render = function () {
    return div({className:"in-game"},
                div({className:"board"}, this.cells),
                div({className:"right-menu"}, p(null, 'right menu')));
};
InGame.prototype.onKeyDown = function (event) {
    switch (event.keyCode) {
        case 27: actions.stopGame(); break;
        case 37: this.move('left'); break;
        case 32: this.move('drop'); break;
        case 38: this.move('rotate'); break;
        case 39: this.move('right'); break;
        case 40: this.move('down'); break;
    }
};
InGame.prototype.updateBoard = function () {
    for (var i = 0, board = this.game.getBoard(); i < 10; i++) {
        for (var j = 0; j < 20; j++) {
            this.cells[i+10*(19-j)].node.className = "cell col" + board[i+10*j];
        }
    }
};
InGame.prototype.destroy = function () {
    clearInterval(this.tick);
    GameState.prototype.destroy.call(this);
};
InGame.prototype.move = function (move) {
    this.game.applyMove(move);
    this.updateBoard();
};
