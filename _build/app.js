(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global document */

var TetrisGame = require('./tetris-component.js');

document.addEventListener("DOMContentLoaded", function () {
	React.renderComponent(TetrisGame(null), document.body);
});

},{"./tetris-component.js":2}],2:[function(require,module,exports){

var TetrisGame = require('./tetris.js'),
    div = (p = React.DOM).div, h1 = p.h1, p = p.p;

//-----------------------------------------------------------------------------
var Board = React.createClass({
	render: function () {
        var cells = [];
		for (var j = 19; j >= 0; j--) {
			for (var i = 0; i < 10; i++) {
				cells.push(this.compute_cell(i,j));
			}
		}
		return div({className: "board"}, cells);
	},
	compute_cell: function (i, j) {
		var col = this.props.board.get(i,j),
			key = j*10 + i;

		if (col === 0) {
			return div({className: "cell", key: key});
		}
		return div({className: "cell block col" + col, key: key});
	},
});
//-----------------------------------------------------------------------------
var RightMenu = React.createClass({
    render: function () {
        return div({className: "right-menu"},
            h1(null, "right menu"),
            p(null, "Score:" + this.props.score));
    }
});

//-----------------------------------------------------------------------------
var Tetris = React.createClass({
	getInitialState: function () {
		return {
            mode: "main-menu",
        };
	},
    componentDidMount: function () {
        var body = document.body;
        this.kp_listener = body.addEventListener('keypress', this.onKeyPress);
        this.kd_listener = body.addEventListener('keydown', this.onKeyDown);
    },
    componentWillUnmount: function () {
        document.body.removeEventListener('keypress', this.kp_listener);
        document.body.removeEventListener('keydown', this.kd_listener);
    },
    onKeyPress: function (event) {
        if (event.keyCode === 112) {
            this.startGame();
        }
    },
    onKeyDown: function (event) {
        if (event.keyCode === 27) {
            this.stopGame();
        }
		var action = {
            32: 'drop',
			37: 'left',
			38: 'rotate',
			39: 'right',
			40: 'down',
		}[event.keyCode];
		if (action && (this.state.mode === "in-game")) {
            this.setState(this.tetrisGame.applyMove(action));
        }
    },
    startGame: function () {var this$0 = this;
        this.tetrisGame = new TetrisGame();
		this.interval = setInterval(function()  {
            this$0.setState(this$0.tetrisGame.tick());
        }, 1000);
        this.setState({
            mode: "in-game",
            board: this.tetrisGame.getBoard(),
            score: 0,
            nextPiece: undefined,
        });
    },
    stopGame: function () {
        clearInterval(this.interval);
        this.setState({mode:'main-menu'});
    },
    render: function () {
        if (this.state.mode === "main-menu") {
            return div({className:"main menu"},
                h1(null, "Tetris"),
                p(null, "Press p to play"));
        }
        if (this.state.mode === "in-game") {
            return div({className:"main"},
                Board({board: this.state.board}),
                RightMenu({score:this.state.score}));
        }
    }
});

module.exports = Tetris;

},{"./tetris.js":3}],3:[function(require,module,exports){var PRS$0 = (function(o,t){o["__proto__"]={"a":t};return o["a"]===t})({},{});var DP$0 = Object.defineProperty;var GOPD$0 = Object.getOwnPropertyDescriptor;var MIXIN$0 = function(t,s){for(var p in s){if(s.hasOwnProperty(p)){DP$0(t,p,GOPD$0(s,p));}}return t};
function makeArray(size, val) {
	var array = new Array(size);
	for (var i = 0; i < size; i++) {array[i] = val;}
	return array;
}

var Board = (function(){"use strict";var proto$0={};
	function Board (values) {
		this._values = values || makeArray(200,0);
	}DP$0(Board,"prototype",{"configurable":false,"enumerable":false,"writable":false});
	proto$0.get = function (m, n) {
		return this._values[m  + n * 10] || 0;
	};
	proto$0.set = function (m, n, val) {
		if ((m < 0) || (m >= 10)) return;
		if ((n < 0) || (n >= 20)) return;
		this._values[m  + n * 10] = val;
	};
	proto$0.isLineFull = function (index) {
		var values = this._values.slice(10*index, 10*index + 10);
 		var result = values.every(function(i ) {return (i !== undefined) && (i !== 0)});
		return result;
	};
	proto$0.removeLines = function () {
		this._values = this._values.filter(function(v ) {return v > -1});
		var nbr_of_lines = (200 - this._values.length)/10;
		this._values = this._values.concat(makeArray(200 - this._values.length, 0));
		return nbr_of_lines;
	};
MIXIN$0(Board.prototype,proto$0);proto$0=void 0;return Board;})();

Board.from = function (board) {
	var values = board._values.slice(0),
		m = new Board (values);
	return m;
};

//-----------------------------------------------------------------------------
function randomElement (array) {
	var index = Math.floor(Math.random() * array.length);
	return [array[index], index];
}

//-----------------------------------------------------------------------------
var tetrominoes = [
	[[0,0], [-1, 0], [1,0], [2,0]],
	[[0,0], [-1,0], [0,1], [1,0]],
	[[0,0], [-1,0], [-1,1], [0,1]],
	[[0,0], [-1,-1], [-1,0], [1,0]],
	[[0,0], [-1,0], [1,0], [1,1]],
	[[0,0], [-1,0], [0,1], [1,1]],
	[[0,0], [-1,1], [0,1], [1,0]],
];

//-----------------------------------------------------------------------------
var moves = {
	left: function (y) {var x = y[0], y = y[1]; return [x-1, y];},
	right: function (y) {var x = y[0], y = y[1]; return [x+1, y];},
	down: function(y) {var x = y[0], y = y[1]; return [x, y-1];},
	rotateAround: function (cy) {var cx = cy[0], cy = cy[1];
		return function (y) {var x = y[0], y = y[1]; return [cx - (y -cy), cy + (x - cx)];};
	},
};

//-----------------------------------------------------------------------------
var Tetris = (function(){"use strict";var proto$0={};var S_ITER$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol.iterator||'@@iterator';var S_MARK$0 = typeof Symbol!=='undefined'&&Symbol&&Symbol["__setObjectSetter__"];function GET_ITER$0(v){if(v){if(Array.isArray(v))return 0;var f;if(S_MARK$0)S_MARK$0(v);if(typeof v==='object'&&typeof (f=v[S_ITER$0])==='function'){if(S_MARK$0)S_MARK$0(void 0);return f.call(v);}if(S_MARK$0)S_MARK$0(void 0);if((v+'')==='[object Generator]')return v;}throw new Error(v+' is not iterable')};
	function Tetris () {
		this.board = new Board();
		this.score = 0;
		var blocks = (index = randomElement(tetrominoes))[0], index = index[1];
		this.nextPiece = blocks;
		this.nextColor = index + 1;
		this.createBlocks();
	}DP$0(Tetris,"prototype",{"configurable":false,"enumerable":false,"writable":false});
	proto$0.isMoveLegal = function(move) {var $D$0;var $D$1;var $D$2;var $D$3;
		var blocks = (board = this).blocks, board = board.board;
		var x=void 0, y=void 0;$D$3 = (blocks.map(move));$D$0 = GET_ITER$0($D$3);$D$2 = $D$0 === 0;$D$1 = ($D$2 ? $D$3.length : void 0);for ( ;$D$2 ? ($D$0 < $D$1) : !($D$1 = $D$0["next"]())["done"];){x = (y = ($D$2 ? $D$3[$D$0++] : $D$1["value"]))[0], y = y[1];
			if ((y  < 0) || (x < 0) || (x >= 10))  return false;
			if (board.get(x, y) !== 0) return false;
		};$D$0 = $D$1 = $D$2 = $D$3 = void 0;x=void 0;y=void 0;
		return true;
	};
	proto$0.createBlocks = function () {
		this.blocks = this.nextPiece.map(function (y) {var x = y[0], y = y[1]; return [x+4,y+19];});
		this.color = this.nextColor;
		var blocks = (index = randomElement(tetrominoes))[0], index = index[1];
		this.nextPiece = blocks;
		this.nextColor = index + 1;
	};
	proto$0.tick = function () {
		var removedLines = this.board.removeLines();
		this.score += removedLines*removedLines;
		if (this.isMoveLegal(moves.down)) {
			this.blocks = this.blocks.map(moves.down);
		} else {
			this.addBlocksToBoard(this.board);
			this.handleFullLines();
			this.createBlocks();
		}
		return {
			board: this.getBoard(),
			score: this.score,
		};
	};
	proto$0.applyMove = function (moveName) {
		var move;
		if (moveName === 'down') return this.tick();
		if (moveName === 'drop') {
			while (this.isMoveLegal(moves.down)) this.tick();
			return this.tick();
		}
		if (moveName !== 'rotate') move = moves[moveName];
		else move = moves.rotateAround(this.blocks[0]);
		if (this.isMoveLegal(move)) {
			this.blocks = this.blocks.map(move);
		}
		return {board: this.getBoard()};
	};
	proto$0.getBoard = function () {
		return this.addBlocksToBoard(Board.from(this.board));
	};
	proto$0.addBlocksToBoard = function (board) {var $D$4;var $D$5;var $D$6;var $D$7;
		var x=void 0, y=void 0;$D$7 = (this.blocks);$D$4 = GET_ITER$0($D$7);$D$6 = $D$4 === 0;$D$5 = ($D$6 ? $D$7.length : void 0);for ( ;$D$6 ? ($D$4 < $D$5) : !($D$5 = $D$4["next"]())["done"];){x = (y = ($D$6 ? $D$7[$D$4++] : $D$5["value"]))[0], y = y[1];
			board.set(x, y, this.color);
		};$D$4 = $D$5 = $D$6 = $D$7 = void 0;x=void 0;y=void 0;
		return board;
	};
	proto$0.handleFullLines = function () {var $D$8;var $D$9;var $D$10;
		var full_lines = [];
		for (var i = 0; i < 20; i++) {
			if (this.board.isLineFull(i)) {full_lines.push(i);}
		}
		$D$8 = GET_ITER$0(full_lines);$D$10 = $D$8 === 0;$D$9 = ($D$10 ? full_lines.length : void 0);for (var j ;$D$10 ? ($D$8 < $D$9) : !($D$9 = $D$8["next"]())["done"];){j = ($D$10 ? full_lines[$D$8++] : $D$9["value"]);
			for (var i$0=0; i$0 < 10; i$0++) {
				this.board.set(i$0,j, -1);
			}
		};$D$8 = $D$9 = $D$10 = void 0;
	};
MIXIN$0(Tetris.prototype,proto$0);proto$0=void 0;return Tetris;})();

module.exports = Tetris;

},{}]},{},[1])