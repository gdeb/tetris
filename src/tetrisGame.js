
function randomElement (array) {
    var index = Math.floor(Math.random() * array.length);
    return [array[index], index];
}

//-----------------------------------------------------------------------------
var tetrominoes = [
    [[0,0], [-1, 0], [1,0], [2,0]],
    [[0,0], [-1,0], [0,1], [1,0]],
    [[0,0], [1,0], [1,1], [0,1]],
    [[0,0], [-1,1], [-1,0], [1,0]],
    [[0,0], [-1,0], [1,0], [1,1]],
    [[0,0], [-1,0], [0,1], [1,1]],
    [[0,0], [-1,1], [0,1], [1,0]],
];

var moves = {
    left: function (p) { return [p[0]-1, p[1]];},
    right: function (p) { return [p[0]+1, p[1]];},
    down: function(p) { return [p[0], p[1]-1];},
    rotateAround: function (center) {
        return function (p) {
            return [center[0] - (p[1]-center[1]), center[1] + (p[0]-center[0])];
        };
    }
};

//-----------------------------------------------------------------------------
function TetrisGame () {
    this.cells = [];
    while (this.cells.length < 220) this.cells.push(0);
    this.nextPiece = randomElement(tetrominoes);
    this.createBlocks();
    this.gameover = false;
    this.score = 0;
}
TetrisGame.prototype.createBlocks = function () {
    this.blocks = this.nextPiece[0].map(function (block) {
        return [block[0] + 4, block[1] + 19];
    });
    this.color = this.nextPiece[1] + 1;
    var tetromino;
    do {
        tetromino = randomElement(tetrominoes);
    } while (tetromino[1] + 1 === this.color);
    this.nextPiece = tetromino;
};
TetrisGame.prototype.getBoard = function () {
    for (var i = 0, board = this.cells.slice(0), index; i < 4; i++) {
        index = this.blocks[i][0] + 10 * this.blocks[i][1];
        board[index] = this.color;
    }
    return board;
};
TetrisGame.prototype.tick = function () {
    this.removeFullLines();
    if (this.isMoveLegal(moves.down)) {
        this.blocks = this.blocks.map(moves.down);
        return;
    }
    for (var i = 0; i < 4; i++) {
        this.cells[this.blocks[i][0] + 10*this.blocks[i][1]] = this.color;
    }
    this.markFullLines();
    this.createBlocks();
    this.checkEndGame();
};
TetrisGame.prototype.applyMove = function (name) {
    if (name === 'drop') {
        while (this.isMoveLegal(moves.down)) this.tick();
        return this.tick();
    }
    if (name === 'down') return this.tick();
    var move = name === 'rotate' ? moves.rotateAround(this.blocks[0]) : moves[name];
    if (this.isMoveLegal(move)) this.blocks = this.blocks.map(move);
};
TetrisGame.prototype.isMoveLegal = function (move) {
    var self = this,
        result = true;
    this.blocks.map(move).forEach(function (block) {
        if ((block[1] < 0) || (block[0] < 0) || (block[0] >= 10)) result = false;
        if (self.cells[block[0] + 10*block[1]]) result = false;
    });
    return result;
};
TetrisGame.prototype.markFullLines = function () {
    var isFull,
        identity = function (i) {return i;};
    for (var i = 0, nbr = 0; i < 20; i++) {
        isFull = this.cells.slice(10*i, 10*(i+1)).every(identity);
        if (isFull) {
            this.markLine(i, -1);
            nbr++;
        }
    }
    this.score += 10*nbr*nbr;
};
TetrisGame.prototype.markLine = function (j, val) {
    for (var i = 0; i < 10; i++) this.cells[i + 10*j] = val;
};
TetrisGame.prototype.removeFullLines = function () {
    this.cells = this.cells.filter(function (i) {return i >= 0; });
    while (this.cells.length < 220) this.cells.push(0);
};
TetrisGame.prototype.checkEndGame = function () {
    for (var i = 0; i < 4; i++) {
        if (this.cells[this.blocks[i][0] + 10*this.blocks[i][1]] !== 0) {
            this.gameover = true;
            return;
        }
    }
};

module.exports = TetrisGame;
