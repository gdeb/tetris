let VDOM = require('./vdom.js'),
    TetrisGame = require('./tetris.js');

let {div, h1, p, canvas, Component} = VDOM;

//-----------------------------------------------------------------------------
let actions = VDOM.createActions('startGame', 'stopGame');

//-----------------------------------------------------------------------------
class Tetris extends Component {
    constructor () {
        super();
        this.state = new MainMenu();
        this.onAction('startGame', () => this.setGameState(InGame));
        this.onAction('stopGame', () => this.setGameState(MainMenu));
    }
    componentDidMount () {
        let body = document.body;
        body.addEventListener('keypress', ev => this.state.onKeyPress(ev));
        body.addEventListener('keydown', ev => this.state.onKeyDown(ev));
    }
    render () {
        return this.state;
    }
    setGameState(GameState) {
        this.state = new GameState();
        this.update();
    }
}
module.exports = Tetris;

class GameState extends Component {
    onKeyPress () {}
    onKeyDown () {}
}

//-----------------------------------------------------------------------------
class MainMenu extends GameState {
    onKeyPress (event) {
        if (event.keyCode === 112) actions.startGame();
    }
    render () {
        return div({className:"main-menu"},
                    h1(null, "Tetris"),
                    p(null, "Press 'p' to play"));
    }
}

//-----------------------------------------------------------------------------
class InGame extends GameState {
    constructor (...args) {
        super(...args);
        this.canvas = canvas({className:'board', width:"1000", "height": "2000"});
        this.tetrisGame = new TetrisGame();
        this.draw_board();
    }
    render () {
        return div({className:"in-game"},
                    this.canvas,
                    div({className:"right-menu"}, 'right menu'));
    }
    onKeyDown (event) {
        if (event.keyCode === 27) actions.stopGame();
    }
    draw_board () {
        let context = this.canvas.node.getContext('2d'),
            board = this.tetrisGame.getBoard();
        // debugger;
        context.beginPath();
        for (let i = 0; i < 10; i++) {
            context.lineWidth =0.1;
            context.moveTo(100*i,0);
            context.lineTo(100*i, 2000);
        }
        context.strokeStyle = "#fff";
        context.stroke();
        // context.fillRect(20,20,100,100);
        context.font = "bold 30px sans-serif";
        context.fillText("x", 248, 43);
        context.fillText("y", 58, 165);
    }
}

// <div class="main-menu">
//     <h1>Tetris</h1>
//     <p>Press 'p' to play</p>
// </div>
// <div class="game-board">
//     <canvas class="top-canvas"/>
//     <canvas class="bottom-canvas"/>
// </div>
// <div class="right-menu">
//     <h2>Right Menu</h2>
//     <p>Score</p>
// </div>

//
// let TetrisGame = require('./tetris.js'),
//     {div, h1, p} = React.DOM;
//
// let Board = React.createClass({
// 	render () {
//         let cells = [];
// 		for (let j = 19; j >= 0; j--) {
// 			for (let i = 0; i < 10; i++) {
// 				cells.push(this.compute_cell(i,j));
// 			}
// 		}
// 		return div({className: "board"}, cells);
// 	},
// 	compute_cell (i, j) {
// 		let col = this.props.board.get(i,j),
// 			key = j*10 + i;
//
// 		if (col === 0) {
// 			return div({className: "cell", key});
// 		}
// 		return div({className: "cell block col" + col, key});
// 	},
// });
// //-----------------------------------------------------------------------------
// let RightMenu = React.createClass({
//     render () {
//         return div({className: "right-menu"},
//             h1(null, "right menu"),
//             p(null, "Score:" + this.props.score));
//     }
// });
//
// //-----------------------------------------------------------------------------
// let Tetris = React.createClass({
// 	getInitialState () {
// 		return {
//             mode: "main-menu",
//         };
// 	},
//     componentDidMount () {
//         let body = document.body;
//         this.kp_listener = body.addEventListener('keypress', this.onKeyPress);
//         this.kd_listener = body.addEventListener('keydown', this.onKeyDown);
//     },
//     componentWillUnmount () {
//         document.body.removeEventListener('keypress', this.kp_listener);
//         document.body.removeEventListener('keydown', this.kd_listener);
//     },
//     onKeyPress (event) {
//         if (event.keyCode === 112) {
//             this.startGame();
//         }
//     },
//     onKeyDown (event) {
//         if (event.keyCode === 27) {
//             this.stopGame();
//         }
// 		let action = {
//             32: 'drop',
// 			37: 'left',
// 			38: 'rotate',
// 			39: 'right',
// 			40: 'down',
// 		}[event.keyCode];
// 		if (action && (this.state.mode === "in-game")) {
//             this.setState(this.tetrisGame.applyMove(action));
//         }
//     },
//     startGame () {
//         this.tetrisGame = new TetrisGame();
// 		this.interval = setInterval(() => {
//             this.setState(this.tetrisGame.tick());
//         }, 1000);
//         this.setState({
//             mode: "in-game",
//             board: this.tetrisGame.getBoard(),
//             score: 0,
//             nextPiece: undefined,
//         });
//     },
//     stopGame () {
//         clearInterval(this.interval);
//         this.setState({mode:'main-menu'});
//     },
//     render () {
//         if (this.state.mode === "main-menu") {
//             return div({className:"main menu"},
//                 h1(null, "Tetris"),
//                 p(null, "Press p to play"));
//         }
//         if (this.state.mode === "in-game") {
//             return div({className:"main"},
//                 Board({board: this.state.board}),
//                 RightMenu({score:this.state.score}));
//         }
//     }
// });
//
// module.exports = Tetris;

function makeArray(size, val) {
    let array = new Array(size);
    for (let i = 0; i < size; i++) {array[i] = val;}
    return array;
}

class Board {
    constructor (values) {
        this._values = values || makeArray(200,0);
    }
    get (m, n) {
        return this._values[m  + n * 10] || 0;
    }
    set (m, n, val) {
        if ((m < 0) || (m >= 10)) return;
        if ((n < 0) || (n >= 20)) return;
        this._values[m  + n * 10] = val;
    }
    isLineFull (index) {
        let values = this._values.slice(10*index, 10*index + 10);
         let result = values.every(i => (i !== undefined) && (i !== 0));
        return result;
    }
    removeLines () {
        this._values = this._values.filter(v => v > -1);
        let nbr_of_lines = (200 - this._values.length)/10;
        this._values = this._values.concat(makeArray(200 - this._values.length, 0));
        return nbr_of_lines;
    }
}

Board.from = function (board) {
    let values = board._values.slice(0),
        m = new Board (values);
    return m;
};

//-----------------------------------------------------------------------------
function randomElement (array) {
    let index = Math.floor(Math.random() * array.length);
    return [array[index], index];
}

//-----------------------------------------------------------------------------
let tetrominoes = [
    [[0,0], [-1, 0], [1,0], [2,0]],
    [[0,0], [-1,0], [0,1], [1,0]],
    [[0,0], [-1,0], [-1,1], [0,1]],
    [[0,0], [-1,-1], [-1,0], [1,0]],
    [[0,0], [-1,0], [1,0], [1,1]],
    [[0,0], [-1,0], [0,1], [1,1]],
    [[0,0], [-1,1], [0,1], [1,0]],
];

//-----------------------------------------------------------------------------
let moves = {
    left: function ([x,y]) { return [x-1, y];},
    right: function ([x,y]) { return [x+1, y];},
    down: function([x,y]) { return [x, y-1];},
    rotateAround: function ([cx,cy]) {
        return function ([x, y]) { return [cx - (y -cy), cy + (x - cx)];};
    },
};

//-----------------------------------------------------------------------------
class Tetris {
    constructor () {
        this.board = new Board();
        this.score = 0;
        let [blocks, index] = randomElement(tetrominoes);
        this.nextPiece = blocks;
        this.nextColor = index + 1;
        this.createBlocks();
    }
    isMoveLegal(move) {
        let {blocks, board} = this;
        for (let [x,y] of blocks.map(move)) {
            if ((y  < 0) || (x < 0) || (x >= 10))  return false;
            if (board.get(x, y) !== 0) return false;
        }
        return true;
    }
    createBlocks () {
        this.blocks = this.nextPiece.map(function ([x,y]) { return [x+4,y+19];});
        this.color = this.nextColor;
        let [blocks, index] = randomElement(tetrominoes);
        this.nextPiece = blocks;
        this.nextColor = index + 1;
    }
    tick () {
        let removedLines = this.board.removeLines();
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
    }
    applyMove (moveName) {
        let move;
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
    }
    getBoard () {
        return this.addBlocksToBoard(Board.from(this.board));
    }
    addBlocksToBoard (board) {
        for (let [x, y] of this.blocks) {
            board.set(x, y, this.color);
        }
        return board;
    }
    handleFullLines () {
        let full_lines = [];
        for (let i = 0; i < 20; i++) {
            if (this.board.isLineFull(i)) full_lines.push(i);
        }
        for (let j of full_lines) {
            for (let i=0; i < 10; i++) {
                this.board.set(i,j, -1);
            }
        }
    }
}

module.exports = Tetris;


let handlers = {};

function createAction (name) {
    return function (...args) {
        handlers[name].forEach(handler => handler(...args));
    };
}
function createActions(...names) {
    let result = {};
    for (let name of names) {
        if (!(name in handlers)) handlers[name] = [];
        result[name] = createAction (name);
    }
    return result;
}
module.exports.createActions = createActions;

//-----------------------------------------------------------------------------
class Component {
    constructor (props , ...children) {
        this.props = props || {};
        this.children = children;
    }
    appendTo (parent) {
        this.parent = parent;
        this.node = this.render();
        if (this.node) {
            this.node.appendTo(parent);
        }
        this.componentDidMount();
    }
    componentDidMount () {}
    componentWillUnmount () {}
    render () {}
    onAction(name, handler) {
        if (name in handlers) {
            handlers[name].push(handler);
        } else {
            handlers[name] = [handler];
        }
    }
    update () {
        if (this.node) this.node.componentWillUnmount();
        while (this.parent.firstChild) {
          this.parent.removeChild(this.parent.firstChild);
        }
        this.appendTo(this.parent);
    }
}
module.exports.Component = Component;

//-----------------------------------------------------------------------------
class VNode extends Component {
    constructor (tagName, props, ...children) {
        super(props, ...children);
        this.tagName = tagName;
        this.node = document.createElement(this.tagName);
        for (let prop of Object.keys(this.props)) {
            if (prop === 'className') {
                if (this.props.className instanceof Array) {
                    for (let c of this.props.className) {
                        this.node.classList.add(c);
                    }
                } else {
                    this.node.classList.add(this.props.className);
                }
            } else if (prop === 'onClick') {
                this.node.addEventListener('click', this.props.onClick);
            } else {
                this.node.setAttribute(prop, this.props[prop]);
            }
        }
        for (let child of this.children) {
            if (typeof child === 'string') {
                this.node.appendChild(document.createTextNode(child));
            }
            if (child instanceof Component) {
                child.appendTo(this.node);
            }
        }
    }
    appendTo (parent) {
        parent.appendChild(this.node);
    }
    style (css) {
        for (let prop of Object.keys(css)) {
            this.node.style[prop] = css[prop];
        }
        return this;
    }
}

//-----------------------------------------------------------------------------
function makeTagNode (tagName) {
    return function (...args) {return new VNode (tagName, ...args);};
}

let tags = ['div', 'h1', 'p', 'canvas'];

for (let tag of tags) {
    module.exports[tag] = makeTagNode(tag);
}
