// The game's board
class board {
    // 0 = empty, 1 = player 1, 2 = player 2
    board = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
    ];


    // Reset the game's board
    resetBoard() {
        this.board = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
    }

    // Return the game's board
    getBoard() {
        return this.board;
    }

    // Return a specific cell value
    getCell(x, y) {
        return this.board[x][y];
    }

    // Set a value of a cell
    setCell(x, y, value) {
        this.board[x][y] = value;
    }

    // check if a player won in a given row
    checkWinRow(row, playerId) {
        return (
            this.board[row][0] === playerId &&
            this.board[row][1] === playerId &&
            this.board[row][2] === playerId
        );
    }

    // check if a player won in a given col
    checkWinCol(col, playerId) {
        return (
            this.board[0][col] === playerId &&
            this.board[1][col] === playerId &&
            this.board[2][col] === playerId
        );
    }

    // check if a player won in a given diagonal (1 = \ , 2 = /)
    checkWinDiagonal(diagonal, playerId) {
        let row = 0;
        let col = diagonal === 1 ? 0 : 2;
        const diagonalPrefix = diagonal === 1 ? 1 : -1;

        return (
            this.board[row][col] === playerId &&
            this.board[row + 1][col + 1 * diagonalPrefix] === playerId &&
            this.board[row + 2][col + 2 * diagonalPrefix] === playerId
        );
    }

    // check if a given player won the game
    checkWin(playerId) {
        const rowWin =
            this.checkWinRow(0, playerId) ||
            this.checkWinRow(1, playerId) ||
            this.checkWinRow(2, playerId);

        const colWin =
            this.checkWinCol(0, playerId) ||
            this.checkWinCol(1, playerId) ||
            this.checkWinCol(2, playerId);

        const diagonalWin =
            this.checkWinDiagonal(1, playerId) || this.checkWinDiagonal(2, playerId);

        return rowWin || colWin || diagonalWin;
    }

    checkGameOver(playerId) {
        // Check if the board is full
        let isBoardFull = true;
        checkFullBoard: for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                if (this.board[row][col] === 0) {
                    isBoardFull = false;
                    break checkFullBoard;
                }
            }
        }

        // Check if a player won
        const playerWon = this.checkWin(playerId);

        return {
            gameOver: isBoardFull || playerWon,
            playerId: playerWon ? playerId : 0,
        };
    }
}

// exports the board
const Board = new board();
module.exports = Board;
