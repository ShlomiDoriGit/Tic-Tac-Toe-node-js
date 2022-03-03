const port = 3000;
const socket = io(`ws://localhost:${port}`);
const token = {
    1: 'x',
    2: 'o',
};
let clientId;
let activePlayerId;

// DOM Elements
const boardEl = document.getElementById('board');
const playerInfoTextEl = document.getElementById('playerInfoText');
const gameInfoTextEl = document.getElementById('gameInfoText');
const gameOverMessageEl = document.getElementById('gameOver-msg');
const gameOverMessageTextEl = document.getElementById('gameOver-msgText');

// Update the game info text
const updateGameInfoText = function () {
    gameInfoTextEl.innerText = `It's ${
        clientId === activePlayerId ? 'your' : 'another player'
    } turn!`;
};
// Add the player token to a given cell
const setCellTokenValue = function (row, col, playerId) {
    const boardCellEl = getCellId(row, col);
    boardCellEl.classList.add(`${token[playerId]}`);
};

// Return the div element of a cell according to the row
const getCellId = function (row, col) {
    return document.getElementById(`x${row}y${col}`);
};



// Refresh the board cells 
const refreshBoardCellsTokenValues = function (boardGame) {
    for (let row = 0; row < boardGame.length; row++) {
        for (let col = 0; col < boardGame[row].length; col++) {
            setCellTokenValue(row, col, boardGame[row][col]);
        }
    }
};

// Restart the game
const restart = function () {
    window.location.reload();
};

// init the clientId 
socket.on('clientId', id => {
    clientId = Number(id);
    playerInfoTextEl.innerText = `You are the ${clientId === 1 ? 'X' : 'O'} player`;
    boardEl.classList.add(token[clientId]);
});

// Handle the start event
socket.on('start', startingPlayerId => {
    activePlayerId = startingPlayerId;
    updateGameInfoText();
});

// Handle the continue event
socket.on('continue', (playerId, boardState) => {
    activePlayerId = playerId;

    // refresh the board cells 
    refreshBoardCellsTokenValues(boardState);
    updateGameInfoText();
});

// Handle the turn event
socket.on('turn', turn => {
    const { row, col, nextPlayer } = turn;
    setCellTokenValue(row, col, activePlayerId);
    activePlayerId = nextPlayer;
    updateGameInfoText();
});

// Send turn event to the server
const turn = function (row, col) {
    if (activePlayerId !== clientId) {
        return;
    }
    // check if the current cell that was pressed is empty
    const boardCellEl = getCellId(row, col);
    if (boardCellEl.classList.contains(token[1]) ||
     boardCellEl.classList.contains(token[2]))
        return;

    socket.emit('turn', {
        row: row,
        col: col,
    });
};

// Handle the gameOver event
socket.on('gameOver', gameOverResult => {
    // register the move
    setCellTokenValue(gameOverResult.row, gameOverResult.col, activePlayerId);
    const winnerId = Number(gameOverResult.playerId);

    // update the winning message
    if (winnerId !== 0) {
        gameOverMessageTextEl.innerText =
         `You ${clientId === winnerId ? 'won!' : 'lost!'}`;
    }
    // else its a draw
    else {
        gameOverMessageTextEl.innerText = 'Its a draw!';
    }

    // show the winning message
    gameOverMessageEl.classList.add('show');
    socket.disconnect();
});

// Handle the playerLimitReached event
socket.on('playerLimitReached', () => {
    playerInfoTextEl.innerText = '';
    gameInfoTextEl.innerText = 'Players limit reached, please try again later';
    boardEl.classList.add('hide');
});
