// The game's board
class boardGame {
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
    
    getBoard() {
        return this.board;
    }

    getCell(x, y) {
        return this.board[x][y];
    }

    setCell(x, y, value) {
        this.board[x][y] = value;
    }

    // check if a player won in a given row
    checkWinnerRow(row, playerId) {
        return (
            this.board[row][0] === playerId &&
            this.board[row][1] === playerId &&
            this.board[row][2] === playerId
        );
    }

    // check if a player won in a given col
    checkWinnerCol(col, playerId) {
        return (
            this.board[0][col] === playerId &&
            this.board[1][col] === playerId &&
            this.board[2][col] === playerId
        );
    }

    // check if a player won in a given diagonal
    checkWinnerDiagonal(diagonal, playerId) {
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
            this.checkWinnerRow(0, playerId) ||
            this.checkWinnerRow(1, playerId) ||
            this.checkWinnerRow(2, playerId);

        const colWin =
            this.checkWinnerCol(0, playerId) ||
            this.checkWinnerCol(1, playerId) ||
            this.checkWinnerCol(2, playerId);

        const diagonalWin =
            this.checkWinnerDiagonal(1, playerId) ||
             this.checkWinnerDiagonal(2, playerId);

        return rowWin || colWin || diagonalWin;
    }

    checkGameOver(playerId) {
        // Check if the board is full
        let isBoardGameFull = true;
         for (let row = 0; row < this.board.length; row++) {
            for (let col = 0; col < this.board[row].length; col++) {
                if (this.board[row][col] === 0) {
                    isBoardGameFull = false;
                    break ;
                }
            }
        }

        // Check if a player won
        const playerWon = this.checkWin(playerId);

        return {
            gameOver: isBoardGameFull || playerWon,
            playerId: playerWon ? playerId : 0,
        };
    }
}

// exports the board
const BoardGame = new boardGame();
module.exports = BoardGame;
