
let TetrisGame = require('./tetris.js'),
    {div, h1, p} = React.DOM;

//-----------------------------------------------------------------------------
let Board = React.createClass({
	render () {
        let cells = [];
		for (let j = 19; j >= 0; j--) {
			for (let i = 0; i < 10; i++) {
				cells.push(this.compute_cell(i,j));
			}
		}
		return div({className: "board"}, cells);
	},
	compute_cell (i, j) {
		let col = this.props.board.get(i,j),
			key = j*10 + i;

		if (col === 0) {
			return div({className: "cell", key});
		}
		return div({className: "cell block col" + col, key});
	},
});
//-----------------------------------------------------------------------------
let RightMenu = React.createClass({
    render () {
        return div({className: "right-menu"},
            h1(null, "right menu"),
            p(null, "Score:" + this.props.score));
    }
});

//-----------------------------------------------------------------------------
let Tetris = React.createClass({
	getInitialState () {
		return {
            mode: "main-menu",
        };
	},
    componentDidMount () {
        let body = document.body;
        this.kp_listener = body.addEventListener('keypress', this.onKeyPress);
        this.kd_listener = body.addEventListener('keydown', this.onKeyDown);
    },
    componentWillUnmount () {
        document.body.removeEventListener('keypress', this.kp_listener);
        document.body.removeEventListener('keydown', this.kd_listener);
    },
    onKeyPress (event) {
        if (event.keyCode === 112) {
            this.startGame();
        }
    },
    onKeyDown (event) {
        if (event.keyCode === 27) {
            this.stopGame();
        }
		let action = {
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
    startGame () {
        this.tetrisGame = new TetrisGame();
		this.interval = setInterval(() => {
            this.setState(this.tetrisGame.tick());
        }, 1000);
        this.setState({
            mode: "in-game",
            board: this.tetrisGame.getBoard(),
            score: 0,
            nextPiece: undefined,
        });
    },
    stopGame () {
        clearInterval(this.interval);
        this.setState({mode:'main-menu'});
    },
    render () {
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