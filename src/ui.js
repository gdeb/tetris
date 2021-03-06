
var Moebius = require('./moebius.js'),
    Tetris = require('./tetrisGame.js');

var Component = Moebius.Component,
    div = Moebius.div,
    h1 = Moebius.h1,
    p = Moebius.p,
    createClass = Moebius.createClass,
    actions = Moebius.createActions('startGame', 'stopGame', 'backToMainMenu');

//-----------------------------------------------------------------------------
var TetrisUI = createClass(Component, {
    init: function () {
        var self = this;
        this.state = new MainMenu();
        Component.call(this);
        window.addEventListener('keypress', function (ev) {
            self.state.onKeyPress(ev);
        });
        window.addEventListener('keydown', function (ev) {
            if (!self.state.destroyed) self.state.onKeyDown(ev);
        });
        this.onAction('startGame', function () {
            self.updateState(new InGame());
        });
        this.onAction('stopGame', function (score) {
            self.updateState(new GameOver(score || 0));
        });
        this.onAction('backToMainMenu', function () {
            self.updateState(new MainMenu());
        });
    },
    render: function () {
        return this.state;
    },
    updateState: function (state) {
        this.state.destroy();
        this.state = state;
        this.state.appendTo(this.parentNode);
    },
});
module.exports = TetrisUI;

//-----------------------------------------------------------------------------
var GameState = createClass(Component, {
    onKeyPress: function () {},
    onKeyDown: function () {},
});

//-----------------------------------------------------------------------------
var MainMenu = createClass(GameState, {
    render: function () {
        return div({className: "main-menu"},
                h1(null, "Tetris"),
                p(null, "Press 'p' to play"));
    },
    onKeyPress: function () {
        if (event.which === 112) actions.startGame();        
    },
});

//-----------------------------------------------------------------------------
var InGame = createClass(GameState, {
    init: function () {
        GameState.call(this);
        this.game = new Tetris();
        this.paused = false;
        this.cells = [];
        while (this.cells.length < 200) this.cells.push(div({className:"cell"}));
        this.updateBoard();
        this.preview = [];
        while (this.preview.length < 16) this.preview.push(div({className:"preview"}));
        this.updatePreview();
        this.tickInterval = setInterval(this.tick.bind(this), 1000);
        this.scoreNode = p(null, "0");
        this.pauseScreen = div({className: "paused"}, h1(null, "Paused"));
    },
    render: function () {
        return div({className:"in-game"},
                    div({className:"board"}, this.cells, this.pauseScreen),
                    div({className:"right-menu"},
                        h1(null, 'Tetris'),
                        p(null, 'Score:'),
                        this.scoreNode,
                        p(null, 'Next piece:'),
                        div({className:"preview-menu"}, this.preview),
                        p(null, "Press 'p' to pause the game.")
                    ));        
    },
    onKeyDown: function (event) {
        switch (event.keyCode) {
            case 27: actions.stopGame(this.game.score); break;
            case 37: if (!this.paused) this.move('left'); break;
            case 32: if (!this.paused) this.move('drop'); break;
            case 38: if (!this.paused) this.move('rotate'); break;
            case 39: if (!this.paused) this.move('right'); break;
            case 40: if (!this.paused) this.move('down'); break;
        }
    },
    onKeyPress: function (event) {
        if (event.which === 112) this.togglePause();
    },
    updateBoard: function () {
        for (var i = 0, board = this.game.getBoard(); i < 10; i++) {
            for (var j = 0; j < 20; j++) {
                this.cells[i+10*(19-j)].node.className = "cell col" + board[i+10*j];
            }
        }
    },
    togglePause: function () {
        if (this.tickInterval >= 0) {
            clearInterval(this.tickInterval);
            this.tickInterval = -1;
            this.pauseScreen.style({display:'flex'});
        } else {
            this.tickInterval = setInterval(this.tick.bind(this), 1000);
            this.pauseScreen.style({display:'none'});
        }
        this.paused = !this.paused;
    },
    update: function () {
        this.updateBoard();
        this.updatePreview();
        this.updateScore();        
    },
    updatePreview: function () {
        var i, index,
            nextBlocks = this.game.nextPiece[0],
            nextColor = this.game.nextPiece[1] + 1;
        for (i = 0; i < 16; i++) this.preview[i].node.className = "preview";
        for (i = 0, index; i < 4; i++) {
            index = 1 + nextBlocks[i][0] + 4*(3 - 1 - nextBlocks[i][1]);
            this.preview[index].node.className = "preview col" + nextColor;
        }
    },
    updateScore: function () {
        this.scoreNode.node.firstChild.nodeValue = this.game.score;
    },
    destroy: function () {
        clearInterval(this.tickInterval);
        GameState.prototype.destroy.call(this);
    },
    move: function (move) {
        this.game.applyMove(move);
        if ((move === 'down') || (move === 'drop')) {
            this.update();
            if (this.game.gameover) return actions.stopGame(this.game.score);
        }
        this.updateBoard();
    },
    tick: function () {
        this.game.tick();
        if (this.game.gameover) actions.stopGame(this.game.score);
        else this.update();
    },
});

//-----------------------------------------------------------------------------
var GameOver = createClass(GameState, {
    init: function (score) {
        GameState.call(this);
        this.score = score;
    },
    render: function () {
        return div({className: "main-menu"},
                h1(null, "Game Over"),
                p(null, "Score: ", this.score.toString()),
                p(null, "Press 'Esc' to go back to main menu"));
    },
    onKeyDown: function (event) {
        if (event.keyCode === 27) actions.backToMainMenu();
    },
});
