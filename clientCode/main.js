/*
main.js
---------------------
Responsible for creating client's game, receiving events from the server

*/

var client = new Player();
var enemyFleet = new Array(4);
var gameID = -1;
var prepWindow = -1;
var positionWindow = -1;
var playWindow = -1;
var socket = io.connect();
socket.emit('new player');
var scaling = .8;
var backgrounds;
var sounds = new Map();
var shipImages = new Map();
var shipDesDims;
var finishFleetDims;
var finishShipSelectDims;
var normalAttackDims;
var specialAttackDims;
var buildButtonDims;
var selectButtonDims;
var moveButtonDims;
var deflect;
var scramble;

//creates the game interface, and initializes client-side data
function initialize() {
	//scale instruction images
	var instructImages = document.getElementsByClassName('instructImg');
	var instructImgDims = [instructImages[0].width * 0.9, instructImages[0].height * 0.9];
	for (var i = 0; i < instructImages.length; i++) {
		instructImages[i].style.width = instructImgDims[0] + 'px';
		instructImages[i].style.height = instructImgDims[1] + 'px';
	}
	
	//load in background images
	backgrounds = [new Image(), new Image(), new Image()];
	backgrounds[0].src = 'images/shipSelect.png';
	backgrounds[1].src = 'images/shipSelect.png';
	backgrounds[2].src = 'images/gameBoard.png';
	
	//load in Temporary Ship Images
	shipImages.set('temp2', new Image());
	shipImages.get('temp2').src = 'images/Ships/ship2temp.png';
	shipImages.set('temp3', new Image());
	shipImages.get('temp3').src = 'images/Ships/ship3temp.png';
	shipImages.set('temp4', new Image());
	shipImages.get('temp4').src = 'images/Ships/ship4temp.png';
	shipImages.set('temp5', new Image());
	shipImages.get('temp5').src = 'images/Ships/ship5temp.png';
	
	//load in verical Ship Images
	shipImages.set('Scrambler', new Image());
	shipImages.get('Scrambler').src = 'images/Ships/ship2Scrambler.png';
	shipImages.set('Scanner', new Image());
	shipImages.get('Scanner').src = 'images/Ships/ship2Scanner.png';
	shipImages.set('Submarine', new Image());
	shipImages.get('Submarine').src = 'images/Ships/ship3Submarine.png';
	shipImages.set('Defender', new Image());
	shipImages.get('Defender').src = 'images/Ships/ship3Defender.png';
	shipImages.set('Cruiser', new Image());
	shipImages.get('Cruiser').src = 'images/Ships/ship4Cruiser.png';
	shipImages.set('Carrier', new Image());
	shipImages.get('Carrier').src = 'images/Ships/ship4Carrier.png';
	shipImages.set('Executioner', new Image());
	shipImages.get('Executioner').src = 'images/Ships/ship5Executioner.png';
	shipImages.set('Artillery', new Image());
	shipImages.get('Artillery').src = 'images/Ships/ship5Artillery.png';
	
	//load in horizontal Ship Images
	shipImages.set('ScramblerHor', new Image());
	shipImages.get('ScramblerHor').src = 'images/Ships/ship2ScramblerHor.png';
	shipImages.set('ScannerHor', new Image());
	shipImages.get('ScannerHor').src = 'images/Ships/ship2ScannerHor.png';
	shipImages.set('SubmarineHor', new Image());
	shipImages.get('SubmarineHor').src = 'images/Ships/ship3SubmarineHor.png';
	shipImages.set('DefenderHor', new Image());
	shipImages.get('DefenderHor').src = 'images/Ships/ship3DefenderHor.png';
	shipImages.set('CruiserHor', new Image());
	shipImages.get('CruiserHor').src = 'images/Ships/ship4CruiserHor.png';
	shipImages.set('CarrierHor', new Image());
	shipImages.get('CarrierHor').src = 'images/Ships/ship4CarrierHor.png';
	shipImages.set('ExecutionerHor', new Image());
	shipImages.get('ExecutionerHor').src = 'images/Ships/ship5ExecutionerHor.png';
	shipImages.set('ArtilleryHor', new Image());
	shipImages.get('ArtilleryHor').src = 'images/Ships/ship5ArtilleryHor.png';
	
	//get initial placement of buttons and save positions, so they can be scaled later
	finishFleetDims = [document.getElementById('finishFleet').offsetLeft, document.getElementById('finishFleet').offsetTop];
	finishShipSelectDims = [document.getElementById('finishShipSelect').offsetLeft, document.getElementById('finishShipSelect').offsetTop];
	normalAttackDims = [document.getElementById('normalAttack').offsetLeft, document.getElementById('normalAttack').offsetTop];
	specialAttackDims = [document.getElementById('specialAttack').offsetLeft, document.getElementById('specialAttack').offsetTop];
	var tempBuildBut = document.getElementsByClassName('buildButton');
	buildButtonDims = new Array(tempBuildBut.length);
	for (var i = 0; i < tempBuildBut.length; i++) {
		buildButtonDims[i] = new Array(2);
		buildButtonDims[i][0] = tempBuildBut[i].offsetLeft;
		buildButtonDims[i][1] = tempBuildBut[i].offsetTop;
	}
	var tempSelectBut = document.getElementsByClassName('shipSelectButton');
	selectButtonDims = new Array(tempSelectBut.length);
	for (var i = 0; i < tempSelectBut.length; i++) {
		selectButtonDims[i] = new Array(2);
		selectButtonDims[i][0] = tempSelectBut[i].offsetLeft;
		selectButtonDims[i][1] = tempSelectBut[i].offsetTop;
	}
	var tempMoveBut = document.getElementsByClassName('shipMoveButton');
	moveButtonDims = new Array(tempMoveBut.length);
	for (var i = 0; i < tempMoveBut.length; i++) {
		moveButtonDims[i] = new Array(2);
		moveButtonDims[i][0] = tempMoveBut[i].offsetLeft;
		moveButtonDims[i][1] = tempMoveBut[i].offsetTop;
	}
	
	//get initial placement of ship descriptions, so they can be moved later
	shipDesDims = new Array(2);
	document.getElementsByClassName('shipDes')[0].style.display = 'block';
	shipDesDims[0] = document.getElementsByClassName('shipDes')[0].offsetLeft
	shipDesDims[1] = document.getElementsByClassName('shipDes')[0].offsetTop
	document.getElementsByClassName('shipDes')[0].style.display = 'none';
	
	//Hide all screens except main menu screen
	var divs = document.getElementsByTagName('div');
	for(var i = 0; i < divs.length; i++) {
		divs[i].style.display = 'none';
	}
	document.getElementById('mainMenu').style.display = 'block';
	
	//show all buttons again
	var buttons = document.getElementsByTagName('button');
	for (var i = 0; i < buttons.length; i++) {
		buttons[i].style.visibility = 'visible';
	}
	
	//load in sounds
	sounds.set('miss', document.createElement('audio'));
	sounds.get('miss').src = 'sounds/miss.wav';
	sounds.set('hit', document.createElement('audio'));
	sounds.get('hit').src = 'sounds/hit.wav';
	sounds.set('miss', document.createElement('audio'));
	sounds.get('miss').src = 'sounds/miss.wav';
	sounds.set('fire', document.createElement('audio'));
	sounds.get('fire').src = 'sounds/fire.wav';
	sounds.set('scramble', document.createElement('audio'));
	sounds.get('scramble').src = 'sounds/scramble.wav';
	sounds.set('sink', document.createElement('audio'));
	sounds.get('sink').src = 'sounds/sink.wav';
	sounds.set('scan', document.createElement('audio'));
	sounds.get('scan').src = 'sounds/scan.wav';
	sounds.set('defend', document.createElement('audio'));
	sounds.get('defend').src = 'sounds/defend.wav';
	sounds.set('barrage', document.createElement('audio'));
	sounds.get('barrage').src = 'sounds/barrage.wav';
	sounds.set('execute', document.createElement('audio'));
	sounds.get('execute').src = 'sounds/execute.wav';
	sounds.set('detect', document.createElement('audio'));
	sounds.get('detect').src = 'sounds/detect.wav';
	sounds.set('error', document.createElement('audio'));
	sounds.get('error').src = 'sounds/error.wav';
	sounds.set('win', document.createElement('audio'));
	sounds.get('win').src = 'sounds/win.wav';
	sounds.set('lose', document.createElement('audio'));
	sounds.get('lose').src = 'sounds/lose.wav';
	sounds.set('aww', document.createElement('audio'));
	sounds.get('aww').src = 'sounds/aww.wav';
	sounds.set('countdown', document.createElement('audio'));
	sounds.get('countdown').src = 'sounds/countdown.wav';
	sounds.set('turnEnd', document.createElement('audio'));
	sounds.get('turnEnd').src = 'sounds/turnEnd.wav';
}

function playAudio(name) {
	sounds.get(name).currentTime = 0;
	sounds.get(name).play();
}

//on receiving a welcome event from server, get playerid from server
//send confirmation back to server
socket.on('welcome', function(data) {
	console.log('Your player ID is ' + data);
	client.id = data;
});

//on receiving a disconnect event from server, hide all gameplay windows and display a disconnection message
socket.on('disconnect', function(data) {
	//todo:  add formal message telling client server disconnected
	var divs = document.getElementsByTagName('div');
	for(var i = 0; i < divs.length; i++) {
		divs[i].style.display = 'none';
	}
	document.getElementById('serverDisconnectMessage').style.display = 'block';
	playAudio('aww');
	clearInterval(playWindow.timerFunction);
});

//send a new game event to the server
//once the server sends back the appropriate game creation event, create the game
function newGame() {
	socket.emit('new private game', client.id);
	socket.on('private game created', function(data) {
		gameID = data;
		document.getElementById('sessionID').innerHTML = 'Your session ID: ' + gameID;
		document.getElementById('sessionID').innerHTML += '<p font-size=\'16px\'> Waiting for player to join... </p>';
		socket.off('private game created');
	});
	socket.on(client.id + ' join success', function(data) {
		document.getElementById('sessionID').innerHTML = '';
		document.getElementById('hostGame').style.display = 'none';
		document.getElementById('buildAFleet').style.display = 'block';
		socket.off(client.id + ' join success');
		loadGame();
	});
}

//inform the server that the game should be deleted, and disable all gameplay windows
function removeGame() {
	//todo:  add formal message telling client other player disconnected
	socket.emit('delete game', gameID);
	client.fleet = ['temp2', 'temp3', 'temp4', 'temp5'];
	enemyFleet = new Array(4);
	client.clearGrids();
	socket.off(gameID + ' player disconnect');	
	gameID = -1;
	prepWindow = -1;
	positionWindow = -1;
	playWindow = -1;
}

//create a new gameplay window
function loadGame() {
	console.log('Your game ID is ' + gameID);
	prepWindow = new buildAFleetWindow(document.getElementById('buildCanvas'), scaling); //todo: fix scaling of buttons
	socket.on(gameID + ' player disconnect', function(data){
		//todo:  add formal message telling client other player disconnected
		var divs = document.getElementsByTagName('div');
		for(var i = 0; i < divs.length; i++) {
			divs[i].style.display = 'none';
		}
		document.getElementById('playerDisconnectMessage').style.display = 'block';
		playAudio('aww');
		prepWindow.cleanUp();
		removeGame();
	});
	prepWindow.draw();
	prepWindow.drawButtons();
}

//gets the data associated with a ship
//data includes a description of ship's ability, as well as images
function shipDetails(shipName, shipIndex) {
	var index = -1;
	var descriptions = document.getElementsByClassName('shipDes');
	var ships = ['Scrambler', 'Scanner', 'Submarine', 'Defender', 'Cruiser', 'Carrier', 'Executioner', 'Artillery'];
	
	if (client.fleet[shipIndex] != shipName || prepWindow.firstSelect[shipIndex]) {
		prepWindow.images[shipIndex] = shipImages.get(shipName);
		prepWindow.draw();
		index = ships.indexOf(shipName);
		client.fleet[shipIndex] = shipName
		var altShipName;
		if (index % 2 == 0)
			altShipName = ships[index+1].toLowerCase() + 'Des';
		else
			altShipName = ships[index-1].toLowerCase() + 'Des';
		
		document.getElementById(shipName.toLowerCase() + 'Des').disabled = true;
		document.getElementById(altShipName).disabled = false;
		
		if (prepWindow.currentShipDes != -1)
			descriptions[prepWindow.currentShipDes].style.display = 'none';
		prepWindow.currentShipDes = index;
		descriptions[index].style.display = 'block';
		descriptions[index].style.left = prepWindow.divX + 'px';
		descriptions[index].style.top = prepWindow.divY + 'px';
		prepWindow.firstSelect[shipIndex] = false;
	}
}

function loadPositionSelect() {
	positionWindow.drawButtons();
	positionWindow.draw();
}

//transition from fleet selection to fleet positioning window
function toPositionSelect() {
	for (var i = 0; i < client.fleet.length; i++) {
		if (client.fleet[i].substring(0, 4) == 'temp') {
			switch(i) {
				case 0:
					client.fleet[i] = 'Scrambler';
					break;
				case 1:
					client.fleet[i] = 'Submarine';
					break;
				case 2:
					client.fleet[i] = 'Cruiser';
					break;
				case 3:
					client.fleet[i] = 'Executioner';
					break;
			}
		}
	}
	document.getElementById('buildAFleet').style.display = 'none';
	document.getElementById('positionFleet').style.display = 'block';
	prepWindow.cleanUp();
	prepWindow = -1;
	positionWindow = new fleetPositionWindow(document.getElementById('positionCanvas'), scaling)
	socket.off(gameID + ' player disconnect');
	socket.on(gameID + ' player disconnect', function(data){
		//todo:  add formal message telling client other player disconnected
		var divs = document.getElementsByTagName('div');
		for(var i = 0; i < divs.length; i++) {
			divs[i].style.display = 'none';
		}
		document.getElementById('playerDisconnectMessage').style.display = 'block';
		playAudio('aww');
		positionWindow.cleanUp();
		removeGame();
	});
	loadPositionSelect();
}

//inform server that this client has completed ship positioning, and is ready to begin game
//once server emits a ready event (i.e. both players are ready), begins game
//server randomly assigns a player to go first
function startGameScreen() {
	socket.emit('fleet finished', {gameID: gameID, playerID: client.id});
	positionWindow.waitMessage();
	document.removeEventListener('keydown', positionWindow.moveShips);
	socket.on(gameID + ' ready', function(data) {
		if (data == client.id) {
			client.hasTurn = true;
		}
		playWindow = new gameWindow(document.getElementById('gameCanvas'), scaling, client);
		socket.off(gameID + ' ready');
		positionWindow.cleanUp();
		positionWindow = -1;
	});
}

//checks if all of the player's ships have been sunk, returning a boolean value
function isGameOver() {
	for (var i = 0; i < client.fleet.length; i++) {
		if (client.fleet[i].alive) {
			return false;
		}
	}
	return true;
}

function getRandomInt(min, max) {  
	//http://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function repositionAttack(){
	var defX = getRandomInt(0,8);
	var defY = getRandomInt(0,8);
	while(client.homeGrid[defX][defY].shipPresent()){
		var defX = getRandomInt(0,8);
		var defY = getRandomInt(0,8);
	}
	return new orderedPair(defX, defY);
}

function findRandomEnemy(){
	var shipPositions = new Array();
	for (var i = 0; i < client.fleet.length; i++) {
		for (var j = 0; j < client.fleet[i].posArray.length; j++) {
			var x = client.fleet[i].posArray[j].posX;  
			var y = client.fleet[i].posArray[j].posY;
			if (!client.homeGrid[x][y].isShotAt())
				shipPositions.push(new orderedPair(x, y));
		}
	}
	return shipPositions[getRandomInt(0,shipPositions.length-1)];
}

//loads graphics for playing the game, and listens for game updates (such as a tile being attacked or the game ending)
function initializeGame() {
	for (var i = 0; i < client.fleet.length; i++) {
		var posArray = client.fleet[i].currentPosArray();
		for (var j = 0; j < posArray.length; j++) {
			var xCor = posArray[j].posX;
			var yCor = posArray[j].posY;
			client.homeGrid[xCor][yCor].hasShip = true;
			client.homeGrid[xCor][yCor].shipIndex = i;
		}
	}
	deflect = false;
	scramble = 0;
	socket.on(client.id + ' attack made', function(attackData){
		if (attackData.coordinates[0] != 5)
			playWindow.specialMessage = new Array();
		var str = '';
		var returnData;
		var specialResult = {};
		var attackCoordinate;
		//Timer ran out
		if (attackData.coordinates[0] == 'out') {
			str = 'out';
			playWindow.turnResult = '';
			attackData.coordinates = [];
		}
		if (deflect == true && attackData.coordinates[0] != 1) {
			var tempPlace = repositionAttack();
			if (typeof attackData.coordinates[0] === 'number'){
				attackData.coordinates[1] = tempPlace;
			}
			else{
				attackData.coordinates[0] = tempPlace;
			}
			playWindow.specialMessage.push('Enemy shot deflected.');
			playAudio('defend');
			specialResult.deflect2 = 0;
			deflect = false;
		}
		if (typeof attackData.coordinates[0] === 'number')
			attackCoordinate = attackData.coordinates[1];
		else
			attackCoordinate = attackData.coordinates[0];
		//Scrambler Special 
		if (attackData.coordinates[0] == 1){
			scramble = 3;
			attackData.coordinates = new Array();
			playWindow.turnResult = '';
			specialResult.scramble = 0;
			str = 'jammed';
		}
		
		//Scanner Special
		else if (attackData.coordinates[0] == 2) {
			if (attackData.coordinates.length == 3) {
				specialResult.scan = false;
			}
			else {
				var scanArray = processSpecialAttack('Scanner', attackCoordinate);
				var scanResult = new Array();
				specialResult.scan = scanResult;
				var scanCount = 0;
				for (var i = 0; i < scanArray.length; i++) {
					var x = scanArray[i].posX;
					var y = scanArray[i].posY;
					if (client.homeGrid[x][y].shipPresent()) {
						scanCount++;
					}
					scanResult.push(client.homeGrid[x][y]);
				}
				playWindow.specialMessage.push('Enemy Scanner launched tracer rounds.');
				specialResult.scan.push(scanCount);
			}
			attackData.coordinates = [attackCoordinate];
		}
		
		//Defender Special 
		else if (attackData.coordinates[0] == 4){ 
			specialResult.deflect1 = 0;
			attackData.coordinates = [attackCoordinate];
		}
		
		//Cruiser Special 
		else if (attackData.coordinates[0] == 5) { 
			client.targetGrid[attackCoordinate.posX][attackCoordinate.posY].hasShip = true;
			client.targetGrid[attackCoordinate.posX][attackCoordinate.posY].shipHit = true;
			playWindow.specialMessage.push('Your Cruiser counter attacked.');
			if (attackData.deadShips != undefined) {
				enemyFleet = attackData.deadShips;
				playWindow.turnResult = 'You sunk the enemy\'s ' + attackData.result + '!';
			}
			playWindow.draw();
			return;
		}
		
		//Carrier Special 
		else if (attackData.coordinates[0] == 6){ 
			str = 'detected';
			if (attackData.coordinates.length == 1) {
				specialResult.detect = findRandomEnemy();
				playWindow.specialMessage.push('Enemy Carrier has detected a ship.')
			}
			else {
				specialResult.detect = false;
			}
			attackData.coordinates = new Array();
		}
		
		//Executioner Special
		else if (attackData.coordinates[0] == 7){ 
			var attackInPartial = false;
			var smallestLength = 6;
			var smallestShip = -1;
			if (attackData.coordinates.length == 4) {
				var partialTiles = attackData.coordinates[3];
				for (var i = 0; i < partialTiles.length; i++) {
					var x = partialTiles[i].posX;
					var y = partialTiles[i].posY;
					var selectedShip = client.homeGrid[x][y].shipIndex;
					if (selectedShip != -1) {
						if (client.fleet[selectedShip].length < smallestLength) {
							smallestLength = client.fleet[selectedShip].length;
							smallestShip = selectedShip 
						}
					}
					if (attackCoordinate.posX == x && attackCoordinate.posY == y) {
						attackInPartial = true;
					}
				}
			}
			if (smallestShip == -1 || !attackInPartial) {
				var x = attackCoordinate.posX;
				var y = attackCoordinate.posY;
				if (client.homeGrid[x][y].shipIndex != -1) {	//Destroy entire ship at the single point
					smallestShip = client.homeGrid[x][y].shipIndex;
					attackData.coordinates = client.fleet[smallestShip].posArray
				}
				else {
					attackData.coordinates = [attackCoordinate]; //Missed shot
				}
			}
			else if (attackInPartial) { //Destroy smallest ship in scanned area
				attackData.coordinates = client.fleet[smallestShip].posArray;
			}
			specialResult.execute = 0;
			playWindow.specialMessage.push('Enemy Executioner fired killing blow.');
		}
		
		// Artillery Special 
		else if (attackData.coordinates[0] == 8) { 
			specialResult.barrage = 0;
			attackData.coordinates = processSpecialAttack('Artillery', attackCoordinate);
			playWindow.specialMessage.push('Enemy Artillery fired barrage.');
		}
		var updatedTiles = new Array(attackData.coordinates.length);
		var cruiserSpecial = false;
		var subSpecial = false;
		for (var i = 0; i < updatedTiles.length; i++) {
			var x = attackData.coordinates[i].posX;
			var y = attackData.coordinates[i].posY;
			client.homeGrid[x][y].updateTile();
			updatedTiles[i] = client.homeGrid[x][y];
			if (updatedTiles[i].shipHit) {
				str = 'hit';
				playWindow.turnResult = 'Enemy has damaged your ship.'
				if (updatedTiles[i].shipIndex == 2) {
					if (client.fleet[2].firstHit) {
						 cruiserSpecial = true;
					}
				}
				else if(updatedTiles[i].shipIndex == 1) {
					if(client.fleet[1].firstHit){
						subSpecial = true;
					}
				}
			}
			else if (str != 'hit') {
				str = 'miss';
				playWindow.turnResult = 'Enemy shot missed.'
			}
		}
		var sunkShips = new Array(4);
		for (var i = 0; i < client.fleet.length; i++) {
			if (client.fleet[i].updateAlive()) {
				str = client.fleet[i].shipName;
				playWindow.turnResult = 'The enemy has sunk your ' + str + '!';
			}
			if (!client.fleet[i].alive) {
				sunkShips[i] = client.fleet[i];
			}
		}
		if (str == 'hit') {
			playAudio('hit');
		}
		else if (str == 'miss') {
			playAudio('miss');
		}
		else if (str.substring(0,9) == 'The enemy') {
			playAudio('hit');
			playAudio('sink');
		}
		if (cruiserSpecial && client.fleet[2].alive) {
			specialResult.counter = client.fleet[2].specialAttack(attackData.ship); //hits cruiser
			if (specialResult.counter == undefined)
				playWindow.specialMessage.push('Radar jammed, cruiser could not counter.');
		}
		if (subSpecial && client.fleet[1].alive) {
			specialResult.dive = client.fleet[1].specialAttack(attackData.ship); //hits submarine
			playWindow.specialMessage.push('Your Submarine dived to a new location.');
			playWindow.draw();
		}
		returnData = {
			tiles: updatedTiles,
			enemyShips: sunkShips,
			gID: gameID,
			playerID: client.id,
			result: str,
			specialData: specialResult
		};
		socket.emit('game updated', returnData);
		client.hasTurn = true;
		playWindow.draw();
		playWindow.hoveredTile = new orderedPair(-1, -1);
		if (isGameOver()) {
			client.hasTurn = false;
			playWindow.disableButtons();
			socket.emit('game over', {gID: gameID, playerID: client.id});
			document.getElementById('gameOverMessageLose').innerHTML = 'You Lose!';
			document.getElementById('gameOverLose').style.display = 'block';
			document.getElementById('gameWindow').style.display = 'none';
			playAudio('lose');
			playWindow.cleanUp();
			removeGame();
		}
		else {
			if (playWindow.selectedShip != -1) {
				if (client.fleet[playWindow.selectedShip].alive) {
					playWindow.shipDescriptions[playWindow.selectedShip].style.display = 'block';
					playWindow.enableButton('normal');
					playWindow.drawButtonSelector(playWindow.selectedButton);
					playWindow.drawShipSelector(playWindow.selectedShip);
				}
				else {
					playWindow.selectedShip = -1;
				}
			}
			playWindow.timerCount = 30;
		}
	});
	socket.on(client.id + 'end game', function(data){
		client.hasTurn = false;
		playWindow.disableButtons();
		document.getElementById('gameOverMessageWin').innerHTML = 'You Win!';
		document.getElementById('gameOverWin').style.display = 'block';
		document.getElementById('gameWindow').style.display = 'none';
		playAudio('win');
		playWindow.cleanUp();
		removeGame();
	});
	socket.off(gameID + ' player disconnect');
	socket.on(gameID + ' player disconnect', function(data){
		//todo:  add formal message telling client other player disconnected
		var divs = document.getElementsByTagName('div');
		for(var i = 0; i < divs.length; i++) {
			divs[i].style.display = 'none';
		}
		document.getElementById('playerDisconnectMessage').style.display = 'block';
		playAudio('aww');
		playWindow.cleanUp();
		removeGame();
	});
}
