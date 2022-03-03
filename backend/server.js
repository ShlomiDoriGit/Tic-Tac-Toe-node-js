const server = require('socket.io')({ cors: true });
const BoardGame = require('./board');

// Variables
const port = 3000;
let gameStarted = false;
let gameOver = false;
let players = {
    1: '',
    2: '',
};
// Hold the id of the current active player
let isActivePlayer = 1;

// Add a player to the server with the socket id 
const addPlayerToServer = function (socketId) {
    for (const playerId in players) {
        if (players[playerId] === '') {
            players[playerId] = socketId;
            return playerId;
        }
    }
};

// Gets an object and a value and return the key 
const getObjectKeyByValue = function (object, value) {
    return Object.keys(object).find(key => object[key] === value);
};

// Handle connection event of the socket
server.on('connection', socket => {
    // Only 2 clients can connect to the socket
    if (server.sockets.sockets.size > 2) {
        socket.emit('playerLimitReached');
        socket.disconnect();
    }

    // Join to the server with the socket id
    const socketId = socket.id;
    const playerId = addPlayerToServer(socketId);

    socket.emit('clientId', playerId);

    // Start the game when 2 players are connected to the socket
    if (server.sockets.sockets.size === 2 && !gameStarted) {
        gameStarted = true;
        server.emit('start', isActivePlayer);
    }

    // If the game already started continue it
    if (gameStarted) {
        socket.emit('continue', isActivePlayer, BoardGame.getBoard());
    }

    // Handle the player turn event
    socket.on('turn', turn => {
        if (gameOver) return;

        // Register the player move on the board
        BoardGame.setCell(turn.row, turn.col, playerId);

        // Check if the game is over
        const gameOverResult = BoardGame.checkGameOver(playerId);
        gameOver = gameOverResult.gameOver;
  
        if (gameOver) {
    
            // send gameOver event to the clients
            server.emit('gameOver', {
                ...gameOverResult,
                row: turn.row,
                col: turn.col,
            });

            // Reset the game
            BoardGame.resetBoard();
            gameStarted = false;
            gameOver = false;
            isActivePlayer = 1;
        } else {
            // Switch players
            isActivePlayer = isActivePlayer === 1 ? 2 : 1;
            server.emit('turn', {
                row: turn.row,
                col: turn.col,
                nextPlayer: isActivePlayer,
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
server.listen(port,function(port,error){
    if(error){
        console.log(`erorr in server!`);
    }

    console.log(`Server is listening int http://localhost:`+ port);
});

