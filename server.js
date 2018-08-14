'use strict';
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var path = require('path');
var port = process.env.PORT || 3000;

server.listen(port, function() {
    console.log("Listening on port " + port + "...");
});

app.get('/', function(request, response){
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
	
    var extname = path.extname(filePath);
    var contentType = 'text/html';
	//reading files
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
		case '.svg':
			contentType = 'image/svg+xml';
			break;
    }
    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
});
app.use('/clientCode', express.static(__dirname + '/clientCode'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/sounds', express.static(__dirname + '/sounds'));
app.use('/style.css', express.static(__dirname + '/style.css'));

var io = require('socket.io').listen(server);

//holds a Map of all games being played
var games = new Map();
//holds an array of all players connected to server
var players = new Array();
//holds a queue of players waiting to be put in public game
var publicQueue = new Array();


io.on('connection', function (socket) {
    console.log("something connected");
    var newID = -1;
    var gameID = -1;
    socket.on("new player", function (data) {
        newID = getPlayerID();
        players.push(newID);
        socket.emit('welcome', newID);
        console.log('Player ' + newID + ' connected');
    });
    //on receiving a new game event from a client, create a new game
    //once game has been created, add to map, and set sending client as host
    socket.on('new private game', function (data) {
        gameID = getGameID();
        var hostID = data;
        games.set(gameID, hostID);
        socket.emit('private game created', gameID);
        console.log('Game ' + gameID + ' was created with host ' + hostID);
    });
    socket.on('ping', function (data) {});

    //if the client attempts to connect to a valid game id (and it is not full), add that player to the game
    //set the game to full so others may no longer join
    socket.on('join public game', function (data) {
        var playerID = data;
        if (publicQueue.length % 2 == 0) {
            publicQueue.push(playerID);
            console.log('Player ' + playerID + ' added to public queue');
        }
        else {
            var visitorID = publicQueue.shift();
			if (visitorID == playerID) {
				publicQueue.push(playerID);
				console.log('Player ' + playerID + ' added to public queue');
				return;
			}
            gameID = getGameID();
            games.set(gameID, new Game(playerID, visitorID));
            socket.emit(playerID + ' join success', gameID);
            io.sockets.emit(visitorID + ' join success', gameID);
            console.log('Public Game ' + gameID + ' started with players ' + games.get(gameID).visitor + ' and ' + games.get(gameID).host);
        }
    });

    socket.on("update gameID", function (data) {
        gameID = data;
    });

    socket.on('remove from public queue', function (data) {
        var playerID = data;
        var index = publicQueue.indexOf(playerID);
        if (index > -1) {
            publicQueue.splice(index, 1);
            console.log('Player ' + playerID + ' removed from public queue');
        }
    });

    socket.on('join private game', function (data) {
        var obj = data
        try {
            obj = JSON.parse(obj);
        }
        catch (e) {}
        if (!games.has(obj.gameID)) {
            console.log('Player ' + obj.playerID + ' tried to join Game ' + obj.gameID + ' but had join error');
            socket.emit('join error', {});
        }
        else {
            gameID = obj.gameID;
            if (games.get(gameID).gameFull) {
                console.log('Player ' + obj.playerID + ' tried to join Game ' + obj.gameID + ' but it was full');
                gameID = -1;
                socket.emit('join full', {});
                return;
            }
            else {
                games.set(gameID, new Game(games.get(gameID), obj.playerID));
                socket.emit('join success', gameID);
                io.sockets.emit(games.get(gameID).host + ' join success', {});
                console.log('Game ' + obj.gameID + ' started with players ' + games.get(gameID).visitor + ' and ' + games.get(gameID).host);
            }
        }
    });

    socket.on('quit game', function (data) {
        games.delete(gameID);
        io.sockets.emit(gameID + ' player disconnect');
        console.log('Game ' + gameID + ' deleted from records after player ' + newID + ' quit the game.');
        gameID = -1;
    });

    //when player has finished their fleet selection and positioning, set the player as ready
    //if both players are ready, start the game
    socket.on('fleet finished', function (data) {
        var obj = data
        try {
            obj = JSON.parse(obj);
        }
        catch (e) {}
        if (obj.playerID == games.get(obj.gameID).host) {
            if (games.get(obj.gameID).hostReady != true) {
                console.log('Player ' + obj.playerID + ' (host) ready on game ' + obj.gameID + '.');
                games.get(obj.gameID).hostReady = true;
            }
        }
        if (obj.playerID == games.get(obj.gameID).visitor) {
            if (games.get(obj.gameID).visitorReady != true) {
                console.log('Player ' + obj.playerID + ' (visitor) ready on game ' + obj.gameID + '.');
                games.get(obj.gameID).visitorReady = true;
            }
        }
        if (games.get(obj.gameID).visitorReady && games.get(obj.gameID).hostReady) {
            var firstPlayer = games.get(obj.gameID).host;
			var randomInt = Math.floor(Math.random() * 2);
            if (randomInt == 1) {
                firstPlayer = games.get(obj.gameID).visitor;
            }
            io.sockets.emit(obj.gameID + ' ready', firstPlayer);
            console.log('Game ' + obj.gameID + ' ready with Player ' + firstPlayer + ' going first.');
        }
    });

    //remove the game from Map
    socket.on('delete game', function (data) {
        games.delete(data);
        console.log('Game ' + data + ' deleted from records');
        gameID = -1;
    });

    //records the player's attack, sends an attack event to the other player in the game
    socket.on('turn done', function (data) {
		var attackData = data
        try {
            attackData = JSON.parse(attackData);
        }
        catch (e) {}
        var gameID = attackData.gameID;
        var currentGame = games.get(gameID);
        var recipientID = currentGame.host;
        if (attackData.playerID == currentGame.host) {
            recipientID = currentGame.visitor;
        }
        io.sockets.emit(recipientID + ' attack made', data);
    });

    //sends the updated Tile information from the attack back to the attacking player, so they
    //redraw their screen appropriately
    socket.on('game updated', function (data) {
		var updateData = data
        try {
            updateData = JSON.parse(updateData);
        }
        catch (e) {}
        var gameID = updateData.gameID;
        var currentGame = games.get(gameID);
        var recipientID = currentGame.host;
        if (updateData.playerID == currentGame.host) {
            recipientID = currentGame.visitor;
        }
        console.log(recipientID + ' update made');
        io.sockets.emit(recipientID + ' make update', data);
    });

    //when the game is over, delete it 
    socket.on('game over', function (data) {
		var overData = data
        try {
            overData = JSON.parse(overData);
        }
        catch (e) {}
        var gameID = overData.gameID;
        var currentGame = games.get(gameID);
        var recipientID = currentGame.host;
        if (overData.playerID == currentGame.host) {
            recipientID = currentGame.visitor;
        }
        console.log('Game ' + gameID + ' is over');
        games.delete(gameID);
        io.sockets.emit(recipientID + ' end game', {});
    });

    //ends the game on a player disconnect
    socket.on('disconnect', function () {
        var index = publicQueue.indexOf(newID);
		if (newID > -1) {
			if (index > -1) {
				publicQueue.splice(index, 1);
				console.log('Player ' + newID + ' removed from public queue');
			}
			if (games.delete(gameID)) {
				io.sockets.emit(gameID + ' player disconnect');
				console.log('Game ' + gameID + ' deleted from records');
			}
			var index = players.indexOf(newID);
			players.splice(index, 1);
			console.log('Player ' + newID + ' deleted from records.');
			console.log('Players: ');
			console.log(players);
			console.log('Games: ');
			console.log(games);
			console.log('Public Queue ');
			console.log(publicQueue);
		}
		else {
			console.log('Something disconnected.');
		}
    });
});

//generates a unique player id
function getPlayerID() {
    var clientID = 10000 + players.length;
    while (players.indexOf(clientID) != -1)
        clientID += 1;
    return clientID;
};

//generates a unique game id
function getGameID() {
    var gameID = 1 + games.size;
    while (games.has(gameID))
        gameID += 1;
    return gameID;
};

class Game {
    constructor(hostID, visitorID) {
        this.host = hostID;
        this.hostReady = false;
        this.visitor = visitorID;
        this.visitorReady = false;
        this.gameFull = true;
    }
}
