// Variables
const port = 3000;
// the socket will connect to local host on the given port
const socket = io(`ws://localhost:${port}`);
// the token for eachg player, will be use for adding the player token to the cell div element
const token = {
    1: 'x',
    2: 'circle',
};
let clientId;
let activePlayerId;

// DOM Elements
const boardEl = document.getElementById('board');
const playerInfoTextEl = document.getElementById('playerInfoText');
const gameInfoTextEl = document.getElementById('gameInfoText');
const winningMessageEl = document.getElementById('winningMessage');
const winningMessageTextEl = document.getElementById('winningMessageText');

// Update the game info text
const updateGameInfoText = function () {
    gameInfoTextEl.innerText = `It's ${
        clientId === activePlayerId ? 'your' : 'your opponent'
    } turn!`;
};

// Return the div element of a cell according to the row, col we get as params
const getCellId = function (row, col) {
    return document.getElementById(`x${row}y${col}`);
};

// Add the player token to a given cell
const setCellTokenValue = function (row, col, playerId) {
    const boardCellEl = getCellId(row, col);
    boardCellEl.classList.add(`${token[playerId]}`);
};

// Refresh the board cells token according to the board state we get as param
const refreshBoardCellsTokenValues = function (board) {
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            setCellTokenValue(row, col, board[row][col]);
        }
    }
};

// Send turn event to the server
const turn = function (row, col) {
    // check if the active player is the one whos making the move, if no - return
    if (activePlayerId !== clientId) return;

    // check if the current cell that was pressed is empty, if no - return
    const boardCellEl = getCellId(row, col);
    if (boardCellEl.classList.contains(token[1]) || boardCellEl.classList.contains(token[2]))
        return;

    // send the turn event to the server with the row,col values
    socket.emit('turn', {
        row: row,
        col: col,
    });
};

// Restart the game
const restart = function () {
    window.location.reload();
};

// Handle clientId event - init the clientId according to the id we get from the event
socket.on('clientId', id => {
    clientId = Number(id);
    playerInfoTextEl.innerText = `You are the ${clientId === 1 ? 'X' : 'O'} player`;
    boardEl.classList.add(token[clientId]);
});

// Handle the start event
socket.on('start', startingPlayerId => {
    activePlayerId = startingPlayerId;

    // update the current turn text
    updateGameInfoText();
});

// Handle the continue event
socket.on('continue', (playerId, boardState) => {
    activePlayerId = playerId;

    // refresh the board cells token according to the board state we get as param
    refreshBoardCellsTokenValues(boardState);

    // update the current turn text
    updateGameInfoText();
});

// Handle the turn event
socket.on('turn', turn => {
    const { row, col, nextPlayer } = turn;

    // register the move
    setCellTokenValue(row, col, activePlayerId);

    // switch players
    activePlayerId = nextPlayer;

    // update the current turn text
    updateGameInfoText();
});

// Handle the gameOver event
socket.on('gameOver', gameOverResult => {
    // register the move
    setCellTokenValue(gameOverResult.row, gameOverResult.col, activePlayerId);

    // get the winner id (0 if its a draw)
    const winnerId = Number(gameOverResult.playerId);

    // update the winning message
    // if the winner id is not 0 then we have a winner
    if (winnerId !== 0) {
        winningMessageTextEl.innerText = `You ${clientId === winnerId ? 'won!' : 'lost!'}`;
    }
    // else its a draw
    else {
        winningMessageTextEl.innerText = 'Its a draw!';
    }

    // show the winning message
    winningMessageEl.classList.add('show');

    // disconnect the connection
    socket.disconnect();
});

// Handle the playerLimitReached event
socket.on('playerLimitReached', () => {
    playerInfoTextEl.innerText = '';
    gameInfoTextEl.innerText = 'Players limit reached, please try again later';
    boardEl.classList.add('hide');
});
