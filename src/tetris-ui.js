
var VDOM = require('./vdom.js');

var Component = VDOM.Component,
    div = VDOM.div,
    h1 = VDOM.h1,
    actions = VDOM.createActions('startGame', 'stopGame');

//-----------------------------------------------------------------------------
function TetrisUI () {
    var self = this;
    this.state = new MainMenu ();
    Component.call(this);
    document.body.addEventListener('keypress', function (ev) {
        self.state.onKeyPress(ev);
    });
    document.body.addEventListener('keydown', function (ev) {
        self.state.onKeyDown(ev);
    });
    this.onAction('startGame', function () {
        console.log('action handled');
        // this.state.destroy();
        // this.state
    });
}

TetrisUI.prototype = Object.create(Component.prototype);
TetrisUI.prototype.render = function () {
    return this.state;
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
    return div({className: "main-menu"}, h1(null, "Tetris"));
};
MainMenu.prototype.onKeyPress = function (event) {
    if (event.keyCode === 112) {
        actions.startGame();
        console.log('start');
    }
};
