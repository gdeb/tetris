// let RightMenu = React.createClass({
//     render () {
//         return div({className: "right-menu"},
//             h1(null, "right menu"),
//             p(null, "Score:" + this.props.score));
//     }
// });
//

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
