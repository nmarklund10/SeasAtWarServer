/*
menu.js
--
Handles what should happen when clients interact with the main menu buttons before the game begins

*/

//hide main menu
//display host game menu
function hostGame() {
	document.getElementById('mainMenu').style.display = 'none';
	document.getElementById('hostGame').style.display = 'block';
	newGame();
}

var joinKey = function(e) {
	switch (e.keyCode) {
		case 13:
			//finish
			joinID();
			break;
	}
}

//hide main menu
//display join game menu
function joinGame() {
	document.getElementById('mainMenu').style.display = 'none';
	document.getElementById('joinGame').style.display = 'block';
	document.addEventListener('keydown', joinKey, false);
}

//attempt to join a game being hosted
//if the game id is valid and the game is not full, server will add player to game
//otherwise, server will emit 'join error' or 'join full' and the player will not be added to the game
//if successfully added to the game, hide the join game menu and load in the fleet selection window
function joinID() {
	var input = parseInt(document.getElementById('joinIDVar').value);
	socket.on('join error', function(data) {
		document.getElementById('joinGameError').innerHTML = 'Cannot find session ID';
		return;
	});
	socket.on('join full', function(data) {
		document.getElementById('joinGameError').innerHTML = 'Game is full';
		return;
	});
	socket.on('join success', function(data) {
		document.removeEventListener('keydown', joinKey, false);
		gameID = input;
		document.getElementById('joinGame').style.display = 'none';
		document.getElementById('buildAFleet').style.display = 'block';
		document.getElementById('joinIDVar').value = '';
		document.getElementById('joinGameError').innerHTML = '';
		socket.off('join error');
		socket.off('join full');
		socket.off('join success');
		loadGame();
	});
	socket.emit('join private game', {gameID : input, playerID : client.id});
}

//hide main menu
//display instructions
function instructions() {
	document.getElementById('mainMenu').style.display = 'none';
	document.getElementById('instructions').style.display = 'block';
	document.getElementsByClassName('instructImg')[0].style.display = 'block';
	document.getElementById('nextInstruction').style.display = 'block';
	document.getElementById('previousInstruction').style.display = 'none';
}

//attempt to move to next page of instructions
function nextInstruction(){
	var instructions = document.getElementsByClassName('instructImg');
	for (var i = 0; i < instructions.length - 1; ++i) {
		if (instructions[i].style.display == 'block') {
			instructions[i].style.display = 'none';
			instructions[i+1].style.display = 'block';
			if (i == 0) {
				document.getElementById('previousInstruction').style.display = 'block';
			}
			if (i == 5) {
				document.getElementById('nextInstruction').style.display = 'none';
			}
			break;
		}
	}
}

//attempt to move to previous page of instructions
function prevInstruction() {
	var instructions = document.getElementsByClassName('instructImg');
	for (var i = 1; i < instructions.length; ++i) {
		if (instructions[i].style.display == 'block') {
			instructions[i].style.display = 'none';
			instructions[i-1].style.display = 'block';
			if (i == 1) {
				document.getElementById('previousInstruction').style.display = 'none';
			}
			if (i == 6) {
				document.getElementById('nextInstruction').style.display = 'block';
			}
			break;
		}
	}
}

//hide main menu
//display credits
function credits() {
	document.getElementById('mainMenu').style.display = 'none';
	document.getElementById('credits').style.display = 'block';
}

//hide current menu
//display main menu
//if current menu is main menu, exit game
function backToMain(displayedScreen) {
	if (displayedScreen == 'hostGame') {
		removeGame();
		document.getElementById('sessionID').innerHTML = '';
		socket.off(client.id + ' gameID created');
		socket.off(client.id + ' join success');
	}
	else if (displayedScreen == 'joinGame') {
		document.getElementById('joinIDVar').value = '';
		document.getElementById('joinGameError').innerHTML = '';
		document.removeEventListener('keydown', joinKey, false);
		socket.off(client.id + ' join error');
		socket.off(client.id + ' join full');
		socket.off(client.id + ' join success');
	}
	else if (displayedScreen == 'instructions') {
		var instructions = document.getElementsByClassName('instructImg');
		[].forEach.call(instructions, function(element){
			element.style.display = 'none';
		});
	}
	document.getElementById(displayedScreen).style.display = 'none';
	document.getElementById('mainMenu').style.display = 'block';
}


function resizeGame() {
	//todo
}