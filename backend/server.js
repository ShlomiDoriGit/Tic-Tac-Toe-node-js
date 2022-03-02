const io = require('socket.io')({ cors: true });
const Board = require('./board');

// Variables
const port = 3000;
let gameStarted = false;
let gameOver = false;
// The Players object, there are 2 players, 1,2 and each player will have his socket id stored in this object aswell
let players = {
    1: '',
    2: '',
};
// Hold the id of the current active player
let activePlayer = 1;

// Add a player to the server with the socket id the player got and returns his playerId
const addPlayerToServer = function (socketId) {
    for (const playerId in players) {
        if (players[playerId] === '') {
            players[playerId] = socketId;
            return playerId;
        }
    }
};

// Gets an object and a value and return the key in the objects that holds the given value
const getObjectKeyByValue = function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
};

// Handle connection event of the socket
io.on('connection', socket => {
    // Only 2 clients can connect to the socket
    if (io.sockets.sockets.size > 2) {
        console.log(`Only 2 players are allowed to connect to the game!`);
        socket.emit('playerLimitReached');
        socket.disconnect();
    }

    // Join to the server with the socket id
    const socketId = socket.id;
    const playerId = addPlayerToServer(socketId);

    socket.emit('clientId', playerId);

    // Start the game when 2 players are connected to the socket
    if (io.sockets.sockets.size === 2 && !gameStarted) {
        gameStarted = true;
        io.emit('start', activePlayer);
        console.log('Game started');
    }

    // If the game already started continue it
    if (gameStarted) {
        socket.emit('continue', activePlayer, Board.getBoard());
    }

    // Handle the player turn event
    socket.on('turn', turn => {
        if (gameOver) return;

        // Register the player move on the board
        Board.setCell(turn.row, turn.col, playerId);
        console.log(`Player ${playerId} turn. Move: ${turn.row}, ${turn.col}`);

        // Check if the game is over
        const gameOverResult = Board.checkGameOver(playerId);
        gameOver = gameOverResult.gameOver;
        // if the game is over log it and send a game over event with the gameOverResult object that holds if theres a winner and the winner id
        // And reset the game afterward
        if (gameOver) {
            console.log(
                gameOverResult.playerId === 0
                    ? `Game Over! It's a Draw!`
                    : `Game Over! The winner is ${playerId}!`
            );

            // send gameOver event to the clients
            io.emit('gameOver', {
                ...gameOverResult,
                row: turn.row,
                col: turn.col,
            });

            // Reset the game
            Board.resetBoard();
            gameStarted = false;
            gameOver = false;
            activePlayer = 1;
            // else - if the game is not yet over switch the active player and continue the game
        } else {
            // Switch players
            activePlayer = activePlayer === 1 ? 2 : 1;
            io.emit('turn', {
                row: turn.row,
                col: turn.col,
                nextPlayer: activePlayer,
            });
        }
    });

    // Handle a disconnect event
    socket.on('disconnect', () => {
        const disconnectedPlayerId = getObjectKeyByValue(players, socket.id);
        players[disconnectedPlayerId] = '';
    });
});

// Start the server
io.listen(port);
console.log(`Server is listening on port ${port}!`);
