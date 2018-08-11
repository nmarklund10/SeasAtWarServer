/*
playWindow.js
---------------------
Contains the class that updates the in-game screen as the game progresses.
*/

/*
gameWindow class
---------------------
Holds the player's game canvas, and the visuals/logic to represent the player's graphic interface


canvas- the canvas object, holds the visuals shown to the player on the game window
	scale- scale of canvas
	canvas.width- width of canvas
	canvas.height- height of canvas
	canvas.context- 2d or 3d canvas? 2d for our purposes
	background- background of canvas
	canvas.addEventListener- add function that handles when the user clicks on the game screen
							to determine whether they are clicking on a tile or ship
selectedShip- id of currently selected ship
selectedTile- (x,y) position of currently selected tile
numOfImagesLoaded- number of images currently loaded
-
*/

class gameWindow {
	//constructor needs a player
	constructor(canvas, scale, player) {
		this.scale = scale;
		this.canvas = canvas;
		this.canvas.width = this.adjust(1920);
		this.canvas.height = this.adjust(1080);
		this.context = canvas.getContext('2d');
		this.background = backgrounds[2];
		this.canvas.addEventListener('mousemove', this.getMousePos, false);
		this.canvas.addEventListener('click', this.selectObject, false);
		this.selectedShip = -1;
		this.hoveredShip = -1;
		this.selectedTile = new orderedPair(-1, -1);
		this.hoveredTile = new orderedPair(-1, -1);
		this.targetDetectIcon = new Image();
		this.targetDetectIcon.src = 'images/targetDetectIcon.png';
		this.targetScrambleIcon = new Image();
		this.targetScrambleIcon.src = 'images/targetScrambleIcon.png';
		this.targetHitIcon = new Image();
		this.targetHitIcon.src = 'images/targetHitIcon.png';
		this.targetMissIcon = new Image();
		this.targetMissIcon.src = 'images/targetMissIcon.png';
		this.homeHitIcon = new Image();
		this.homeHitIcon.src = 'images/homeHitIcon.png';
		this.homeMissIcon = new Image();
		this.homeMissIcon.src = 'images/homeMissIcon.png';
		this.partialVisionIcon = new Image();
		this.partialVisionIcon.src = 'images/highlight.png';
		this.attackType = 'normal';
		this.promptNeeded = false;
		this.scanData = new Array();
		this.turnResult = '';
		this.selectedButton = '';
		this.timerFunction;
		this.timerCount = 30;
		this.buttonFunctions = new Array(2);
		this.specialMessage = new Array();
		this.context.textAlign = 'center';
		this.shipDescriptions = new Array(4);
		
		this.images = new Array();
		for (var i = 0; i < client.fleet.length; i++) {
			var imageName = client.fleet[i].shipName;
			if (!client.fleet[i].vert) {
				imageName += 'Hor';
			}
			this.images.push(shipImages.get(imageName));
			if (client.fleet[i].shipName == 'Submarine') {
				if (client.fleet[i].vert) {
					this.alternateSubmarine = shipImages.get('SubmarineHor');
				}
				else {
					this.alternateSubmarine = shipImages.get('Submarine');
				}
			}
		}
		this.loadPage();
	}
	
	//loads the game window, hiding the fleet positioning window
	loadPage() {
		client.loadGrid('target', new orderedPair(this.adjust(710), this.adjust(30)), this.adjust(70));
		initializeGame();
		this.draw();
		document.getElementById('positionFleet').style.display = 'none';
		document.getElementById('gameWindow').style.display = 'block';
		this.drawButtons();
		this.timerFunction = setInterval(this.drawTimer, 1000);
		if (client.fleet[0].shipName == 'Scrambler')
			this.shipDescriptions[0] = document.getElementById('des1');
		else
			this.shipDescriptions[0] = document.getElementById('des2');
		
		if (client.fleet[1].shipName == 'Submarine')
			this.shipDescriptions[1] = document.getElementById('des3');
		else
			this.shipDescriptions[1] = document.getElementById('des4');
		
		if (client.fleet[2].shipName == 'Cruiser')
			this.shipDescriptions[2] = document.getElementById('des5');
		else
			this.shipDescriptions[2] = document.getElementById('des6');
		
		if (client.fleet[3].shipName == 'Executioner')
			this.shipDescriptions[3] = document.getElementById('des7');
		else
			this.shipDescriptions[3] = document.getElementById('des8');
		socket.on(client.id + ' make update', function(data){
			var updatedTiles = data.tiles;
			var currentTiles = new Array();
			for (var i = 0; i < updatedTiles.length; i++) {
				currentTiles.push(updatedTiles[i].coordinate);
			}
			enemyFleet = data.enemyShips;
			for (var i = 0; i < updatedTiles.length; i++) {
				var x = updatedTiles[i].corner.posX;
				var y = updatedTiles[i].corner.posY;
				if(scramble > 0){
					client.targetGrid[currentTiles[i].posX][currentTiles[i].posY].scrambled = true;
					client.targetGrid[currentTiles[i].posX][currentTiles[i].posY].shipHit = false;
				}
				else {
					client.targetGrid[currentTiles[i].posX][currentTiles[i].posY].hasShip = updatedTiles[i].hasShip;
					client.targetGrid[currentTiles[i].posX][currentTiles[i].posY].shipHit = updatedTiles[i].shipHit;
				}
			}
			playWindow.timerCount = 30;
			if (data.result == 'out') {
				playWindow.turnResult = 'You ran out of time to fire!'; 
			}
			else if (scramble > 0 && (data.result == 'hit' || data.result == 'miss')) {
				scramble--;
				if (scramble != 1)
					playWindow.turnResult = 'Radar jammed for ' + scramble + ' more turns.';
				else
					playWindow.turnResult = 'Radar jammed for ' + scramble + ' more turn.';

			}
			else if (data.result == 'hit') {
				playAudio('hit');
				playWindow.turnResult = 'You damaged an enemy ship!';
			}
			else if (data.result == 'miss') {
				playAudio('miss');
				playWindow.turnResult = 'Your shot landed in the ocean.';
			}
			else if (data.result != 'jammed' && data.result != 'detected') {
				playAudio('hit');
				playAudio('sink');
				playWindow.turnResult = 'You sunk the enemy\'s ' + data.result + '!';
			}
			else {
				playWindow.turnResult = '';
			}
			if (playWindow.scanData.length > 0) {
				for (var i = 0; i < playWindow.scanData.length; i++) {
					var x = playWindow.scanData[i].posX;
					var y = playWindow.scanData[i].posY;
					client.targetGrid[x][y].partialVision = false;
				}
				playWindow.scanData = new Array();
			}
			playWindow.specialMessage = new Array();
			if (Object.keys(data.specialData).length > 0) {
				if (data.specialData.scramble != undefined) {
					playWindow.specialMessage.push('You have scrambled the enemy.');
				}
				if (data.specialData.scan != undefined) {
					if (data.specialData.scan == false) {
						playWindow.specialMessage.push('Radar jammed, could not find enemies.')
					}
					else {
						var scanCount = data.specialData.scan[data.specialData.scan.length - 1];
						data.specialData.scan.pop();
						if (scanCount == 0)
							playWindow.specialMessage.push('There are no enemy tiles in the area.');
						else if (scanCount == 1)
							playWindow.specialMessage.push('There is 1 enemy tile in the area.');
						else
							playWindow.specialMessage.push('There are ' + scanCount + ' enemy tiles in the area.');
						client.targetGrid[updatedTiles[0].coordinate.posX][updatedTiles[0].coordinate.posY].scanCount = scanCount;
						playWindow.scanData = new Array();
						var scanArray = data.specialData.scan;
						for (var i = 0; i < scanArray.length; i++) {
							var x = scanArray[i].coordinate.posX;
							var y = scanArray[i].coordinate.posY;
							client.targetGrid[x][y].partialVision = true;
							playWindow.scanData.push(new orderedPair(x, y));
						}
					}
				}
				if (data.specialData.deflect1 != undefined) {
					playWindow.specialMessage.push('The enemy\'s next shot will be deflected.');
					deflect = true;
				}
				if (data.specialData.deflect2 != undefined) {
					playWindow.specialMessage.push('Enemy defender deflected your shot.');
				}
				if (data.specialData.counter != undefined) { //Cruiser Special Attack
					var attackingShip = data.specialData.counter[1];
					var max = client.fleet[attackingShip].length;
					var rand = Math.floor(Math.random() * (max));
					var x = client.fleet[attackingShip].posArray[rand].posX;
					var y = client.fleet[attackingShip].posArray[rand].posY;
					while(client.homeGrid[x][y].isShotAt()) {
						rand = Math.floor(Math.random() * (max));
						x = client.fleet[attackingShip].posArray[rand].posX;
						y = client.fleet[attackingShip].posArray[rand].posY;
					}
					client.homeGrid[x][y].updateTile();
					var sunkShips = new Array(4);
					for (var i = 0; i < client.fleet.length; i++) {
						client.fleet[i].updateAlive();
						if (!client.fleet[i].alive) {
							sunkShips[i] = client.fleet[i];
						}
					}
					playWindow.specialMessage.push('Enemy cruisier counter attacked.');
					var attackData = {
						playerID: client.id,
						coordinates: [5, new orderedPair(x, y)],
						gameID: gameID
					}
					if (!client.fleet[attackingShip].alive) {
						attackData.result = client.fleet[attackingShip].shipName;
						attackData.deadShips = sunkShips;
					}
					if (client.fleet[attackingShip].shipName == 'Submarine') {
						if (client.fleet[attackingShip].firstHit && client.fleet[1].alive) {
							attackData.specialResult = client.fleet[1].specialAttack(attackData.ship); //hits submarine
							client.homeGrid[x][y].hasShip = true;
							client.homeGrid[x][y].shipHit = true;
							client.homeGrid[x][y].shipIndex = -1;
							playWindow.specialMessage.push('Your submarine dived to a new location.')
							playWindow.draw();
						}						
					}
					socket.emit('turn done', attackData);
					if (isGameOver()) {
						client.hasTurn = false;
						playWindow.disableButtons();
						socket.emit('game over', {gID: gameID, playerID: client.id});
						document.getElementById('gameOverMessageLose').innerHTML = 'You Lose!';
						document.getElementById('gameOverLose').style.display = 'block';
						document.getElementById('gameWindow').style.display = 'none';
						playAudio('lose');
					}
				}
				if(data.specialData.detect != undefined) {
					if (data.specialData.detect == false) {
						playWindow.specialMessage.push('Radar jammed, could not detect ship.')
					}
					else {
						playWindow.specialMessage.push('You have detected an enemy ship.');
						client.targetGrid[data.specialData.detect.posX][data.specialData.detect.posY].detected = true;
					}
				}
				if (data.specialData.execute != undefined) {
					playWindow.specialMessage.push('You fired a killing blow.');
				}
				if (data.specialData.barrage != undefined) {
					playWindow.specialMessage.push('You fired a barrage.');
				}
			}
			if (playWindow.selectedShip != -1) {
				playWindow.shipDescriptions[playWindow.selectedShip].style.display = 'none';
			}
			playWindow.disableButtons();
			playWindow.draw();
		});
	}
	
	//adjusts size of window
	adjust(dimension) {
		return dimension * this.scale;
	}
	
	//adds a 'Waiting for other player' message to screen when it is not the player's turn
	drawTurnMessage() {
		this.context.font = 'bold 45px Times New Roman';
		this.context.shadowColor = 'transparent';
		this.context.fillStyle = 'red';
		this.context.textAlign = 'center';
		if (client.hasTurn) {
			this.context.fillText('Your Turn', this.adjust(1625), this.adjust(160));
			this.context.font = '20px Times New Roman';
			this.context.fillStyle = 'white';
			this.context.fillText('Select Ship and Tile to attack', this.adjust(1625), this.adjust(195));
		}
		else {
			this.context.fillText('Enemy Turn', this.adjust(1625), this.adjust(160));
			this.context.font = '22px Times New Roman';
			this.context.fillStyle = 'white';
			this.context.fillText('Waiting for other player...', this.adjust(1625), this.adjust(195));
		}
		this.context.fillStyle = 'white';
		this.context.font = '22px Times New Roman';
		this.context.fillText(this.turnResult, this.adjust(690), this.adjust(850));
		if (this.specialMessage.length > 0) {
			this.context.fillStyle = 'red';
			this.context.font = 'bold 22px Times New Roman';
			var y = 880;
			this.specialMessage.forEach(function(value, key, map) {
				playWindow.context.fillText(value, playWindow.adjust(690), playWindow.adjust(y));
				y += 35;
			});
		}
		this.context.shadowColor = 'black';
	}
	
	drawTimer() {
		if (playWindow.timerCount <= 0) {
			if (client.hasTurn)
				playAudio('turnEnd');
			playWindow.timerCount = 30;
			if (client.hasTurn) {
				playWindow.moveMade('out of time');
			}
		}
		if (playWindow.timerCount <= 10 && client.hasTurn) {
			if (playWindow.timerCount <= 5)
				playAudio('countdown');
			document.getElementById('timer').style.color = 'red';
		}
		else {
			document.getElementById('timer').style.color = 'white';
		}
		document.getElementById('timer').innerHTML = playWindow.timerCount + ' secs'; 
		playWindow.timerCount--;
	}
	
	//adds the buttons to the player window
	drawButtons() {
		var norm = document.getElementById('normalAttack');
		var spec = document.getElementById('specialAttack');
		
		norm.style.left = this.adjust(normalAttackDims[0])+'px';
		norm.style.top = this.adjust(normalAttackDims[1])+'px';
		spec.style.left = this.adjust(specialAttackDims[0])+'px';
		spec.style.top = this.adjust(specialAttackDims[1])+'px';
		this.buttonFunctions[0] = function(data){
			playWindow.enableButton('normal');
			playWindow.draw();
			playWindow.drawShipSelector(playWindow.selectedShip);
		};
		this.buttonFunctions[1] = function(data){
			playWindow.enableButton('special');
			playWindow.draw();
			playWindow.drawShipSelector(playWindow.selectedShip);
		};
		norm.addEventListener('click', this.buttonFunctions[0], false);
		spec.addEventListener('click', this.buttonFunctions[1], false);
		this.disableButtons();
	}
	
	//stores the player's attack, and sends the data to the server
	//afterwards, waits for a server update, then updates the gameWindow with the results of the attack
	moveMade(attackType) {
		//executes turn
		var currentShip = client.fleet[playWindow.selectedShip];
		if (attackType == 'out of time') {
			var currentTiles = ['out'];
			var attackData = {
				playerID: client.id,
				ship: playWindow.selectedShip,
				coordinates: currentTiles,
				gID: gameID
			};
			socket.emit('turn done', attackData);
			client.hasTurn = false;
		}
		else {
			var currentTiles = [playWindow.selectedTile];
			if (attackType == 'special') {
				currentTiles = currentShip.specialAttack(playWindow.selectedTile);
			}
			else {
				playAudio('fire');
			}
			var attackData = {
				playerID: client.id,
				ship: playWindow.selectedShip,
				coordinates: currentTiles,
				gID: gameID
			};
			socket.emit('turn done', attackData);
			client.hasTurn = false;
		}
	}
	
	
	//if the player hovers on a ship on their home grid, draw selector rectangle around that ship
	//if the player hovers on a tile on their target grid, draw selector around that tile
	getMousePos(evt) {
		if (client.hasTurn) {
			//http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
			var rect = playWindow.canvas.getBoundingClientRect();
			var mousePos = new orderedPair (
											Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*playWindow.canvas.width),
											Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*playWindow.canvas.height));
			var result = playWindow.processMousePos(mousePos);
			var gridName = result.grid;
			var gridCoordinate = result.point;
			var x = gridCoordinate.posX;
			var y = gridCoordinate.posY;
			playWindow.hoveredShip = -1;
			playWindow.hoveredTile = new orderedPair(-1, -1);
			if (gridName == 'home') {
				var i = client.homeGrid[x][y].shipIndex;
				if (i == -1) {
					playWindow.draw();
				}
				else if (client.fleet[i].alive) {
					playWindow.draw();
					if (i != playWindow.selectedShip) {
						playWindow.hoveredShip = i;
						if (playWindow.hoveredShip != playWindow.selectedShip) {
							playWindow.drawShipSelector(i);
						}
					}
				}
				if (playWindow.selectedShip != -1) {
					playWindow.drawShipSelector(playWindow.selectedShip);
				}
			}
			else if (gridName == 'target') {
				if (!client.targetGrid[x][y].isShotAt()) {
					playWindow.draw();
					if (playWindow.selectedShip != -1) {
						playWindow.drawShipSelector(playWindow.selectedShip);
					}
					playWindow.hoveredTile = gridCoordinate;
					playWindow.drawTileSelector(gridCoordinate);
				}
			}
			else {
				playWindow.draw();
				if (playWindow.selectedShip != -1) {
					playWindow.drawShipSelector(playWindow.selectedShip);	
				}
			}
			if (playWindow.promptNeeded) {
				playWindow.drawPrompt();
			}
		}
	}
	
	//check what tile the player has hovered over, based on the mouse's pixel position on the canvas
	processMousePos(posPair){
		var xPair = posPair.posX;
		var yPair = posPair.posY;
		var gridName = 'none';
		if(xPair >= playWindow.adjust(40) && xPair <= playWindow.adjust(670) && yPair >= playWindow.adjust(30) && yPair <= playWindow.adjust(660)){
			//Handle home grid
			xPair = xPair - playWindow.adjust(40);
			switch(true){
				case (xPair <= playWindow.adjust(70)):
					xPair = 0;
					break;
				case (xPair <= playWindow.adjust(140)):
					xPair = 1;
					break;
				case (xPair <= playWindow.adjust(210)):
					xPair = 2;
					break;
				case (xPair <= playWindow.adjust(280)):
					xPair = 3;
					break;
				case (xPair <= playWindow.adjust(350)):
					xPair = 4;
					break;
				case (xPair <= playWindow.adjust(420)):
					xPair = 5;
					break;
				case (xPair <= playWindow.adjust(490)):
					xPair = 6;
					break;
				case (xPair <= playWindow.adjust(560)):
					xPair = 7;
					break;
				case (xPair <= playWindow.adjust(630)):
					xPair = 8;
					break;
			}
			yPair = yPair - playWindow.adjust(30);
			switch(true){
				case (yPair <= playWindow.adjust(70)):
					yPair = 0;
					break;
				case (yPair <= playWindow.adjust(140)):
					yPair = 1;
					break;
				case (yPair <= playWindow.adjust(210)):
					yPair = 2;
					break;
				case (yPair <= playWindow.adjust(280)):
					yPair = 3;
					break;
				case (yPair <= playWindow.adjust(350)):
					yPair = 4;
					break;
				case (yPair <= playWindow.adjust(420)):
					yPair = 5;
					break;
				case (yPair <= playWindow.adjust(490)):
					yPair = 6;
					break;
				case (yPair <= playWindow.adjust(560)):
					yPair = 7;
					break;
				case (yPair <= playWindow.adjust(630)):
					yPair = 8;
					break;
			}
			gridName = 'home';
			//xPair and yPair are now values 0 through 8
		}
		else if(xPair >= playWindow.adjust(710) && xPair <= playWindow.adjust(1340) && yPair >= playWindow.adjust(30) && yPair <= playWindow.adjust(660)){
			//Handle enemy grid
			xPair = xPair - playWindow.adjust(710);
			switch(true){
				case (xPair <= playWindow.adjust(70)):
					xPair = 0;
					break;
				case (xPair <= playWindow.adjust(140)):
					xPair = 1;
					break;
				case (xPair <= playWindow.adjust(210)):
					xPair = 2;
					break;
				case (xPair <= playWindow.adjust(280)):
					xPair = 3;
					break;
				case (xPair <= playWindow.adjust(350)):
					xPair = 4;
					break;
				case (xPair <= playWindow.adjust(420)):
					xPair = 5;
					break;
				case (xPair <= playWindow.adjust(490)):
					xPair = 6;
					break;
				case (xPair <= playWindow.adjust(560)):
					xPair = 7;
					break;
				case (xPair <= playWindow.adjust(630)):
					xPair = 8;
					break;
			}
			yPair = yPair - playWindow.adjust(30);
			switch(true){
				case (yPair <= playWindow.adjust(70)):
					yPair = 0;
					break;
				case (yPair <= playWindow.adjust(140)):
					yPair = 1;
					break;
				case (yPair <= playWindow.adjust(210)):
					yPair = 2;
					break;
				case (yPair <= playWindow.adjust(280)):
					yPair = 3;
					break;
				case (yPair <= playWindow.adjust(350)):
					yPair = 4;
					break;
				case (yPair <= playWindow.adjust(420)):
					yPair = 5;
					break;
				case (yPair <= playWindow.adjust(490)):
					yPair = 6;
					break;
				case (yPair <= playWindow.adjust(560)):
					yPair = 7;
					break;
				case (yPair <= playWindow.adjust(630)):
					yPair = 8;
					break;
			}
			//xPair and yPair are now values 0 through 8
			gridName = 'target';
		}
		var returnData = {
			grid: gridName,
			point: new orderedPair(xPair, yPair)
		};
		return returnData;
	}
	
	selectObject(evt) {
		if(client.hasTurn) {
			var previousShip = playWindow.selectedShip;
			if (playWindow.hoveredShip == -1 && playWindow.selectedShip == -1) {
				playWindow.promptNeeded = true;
				playWindow.drawPrompt();
			}
			else if (playWindow.hoveredShip != -1) {	
				playWindow.promptNeeded = false;
				if (playWindow.selectedShip != playWindow.hoveredShip) {
					playWindow.selectedShip = playWindow.hoveredShip;
					playWindow.selectedTile = new orderedPair(-1, -1);
					playWindow.enableButton('normal');
				}
				else
					playWindow.enableButton(playWindow.attackType);
			}
			else if (!playWindow.hoveredTile.equals(new orderedPair(-1, -1))) {
				playWindow.selectedTile = playWindow.hoveredTile;
				playWindow.moveMade(playWindow.attackType);
			}
			//display ship ability
			if(playWindow.selectedShip != -1) {
				if (previousShip != -1)
					playWindow.shipDescriptions[previousShip].style.display = 'none';
				playWindow.shipDescriptions[playWindow.selectedShip].style.display = 'block';
			}
		}
	}
	
	drawPrompt() {
		playWindow.context.strokeStyle = 'white';
		playWindow.context.font = '26px Arial';
		playWindow.context.fillText('Must select Ship first!', playWindow.adjust(235), playWindow.adjust(745));
	}
	
	//prevents player from firing until appropriate conditions have been met
	disableButtons() {
		document.getElementById('normalAttack').disabled = true;
		document.getElementById('specialAttack').disabled = true;
		this.selectedButton = '';
	}
	
	//enable firing
	enableButton(attack) {
		var index = playWindow.selectedShip;
		var hasSpecial = false;
		if (index != -1) {
			if (client.fleet[index].specialAttacksLeft > 0) {
				hasSpecial = true;
			}
		}
		if (attack == 'normal' || !hasSpecial) {
			document.getElementById('normalAttack').disabled = true;
			if (hasSpecial) {
				document.getElementById('specialAttack').disabled = false;
			}
			else {
				document.getElementById('specialAttack').disabled = true;
			}
			playWindow.attackType = 'normal';
			playWindow.selectedButton = 'normalAttack';
		}
		else {
			document.getElementById('normalAttack').disabled = false;
			document.getElementById('specialAttack').disabled = true;
			playWindow.attackType = 'special';
			playWindow.selectedButton = 'specialAttack';
		}
	}
	
	drawButtonSelector(buttonID) {
		if (buttonID != '') {
			var w = playWindow.adjust(document.getElementById(buttonID).offsetWidth + 55);
			var h = playWindow.adjust(document.getElementById(buttonID).offsetHeight + 30);
			playWindow.context.lineWidth='3';
			playWindow.context.strokeStyle='red';
			if (buttonID == 'normalAttack')
				playWindow.context.strokeRect(playWindow.adjust(normalAttackDims[0] - 5), playWindow.adjust(normalAttackDims[1] - 5), w, h);
			else
				playWindow.context.strokeRect(playWindow.adjust(specialAttackDims[0] - 5), playWindow.adjust(specialAttackDims[1] - 5), w, h);
		}
	}
	
	//update the grids with the result of the turn
	drawGrids() {
		var scannedTiles = new Array();
		for(var i = 0; i < client.homeGrid.length; i++) {
			for(var j = 0; j < client.homeGrid[i].length; j++) {
				var homeTile = client.homeGrid[i][j];
				var targetTile = client.targetGrid[i][j];
				if (homeTile.isShotAt()) {
					if (homeTile.shipHit == true) {
						this.context.drawImage(this.homeHitIcon, homeTile.corner.posX, homeTile.corner.posY, this.adjust(70), this.adjust(70));
					}
					else if (homeTile.shipHit == false) {
						this.context.drawImage(this.homeMissIcon, homeTile.corner.posX, homeTile.corner.posY, this.adjust(70), this.adjust(70));
					}
				}
				if (targetTile.isShotAt()) {
					if(targetTile.scrambled) {
						this.context.drawImage(this.targetScrambleIcon, targetTile.corner.posX, targetTile.corner.posY, this.adjust(70), this.adjust(70));
					}
					else if (targetTile.shipHit == true) {
						this.context.drawImage(this.targetHitIcon, targetTile.corner.posX, targetTile.corner.posY, this.adjust(70), this.adjust(70));
					}
					else if (targetTile.shipHit == false) {
						this.context.drawImage(this.targetMissIcon, targetTile.corner.posX, targetTile.corner.posY, this.adjust(70), this.adjust(70));
					}
					if (targetTile.scanCount >= 0) {
						scannedTiles.push(targetTile);
					}
				}
				if (targetTile.partialVision) {
					this.context.drawImage(this.partialVisionIcon, targetTile.corner.posX, targetTile.corner.posY, this.adjust(70), this.adjust(70));
				}
				if (targetTile.detected && targetTile.isShotAt() == false) {
					this.context.drawImage(this.targetDetectIcon, targetTile.corner.posX, targetTile.corner.posY, this.adjust(70), this.adjust(70));
				}
			}
		}
		//Draw lines through your sunk ships on the home grid
		for (var k = 0; k < client.fleet.length; k++) {
			if (!client.fleet[k].alive) {
				this.context.beginPath();
				var point = client.homeGrid[client.fleet[k].mainX][client.fleet[k].mainY];
				var x = point.corner.posX;
				var y = point.corner.posY;
				var length = client.fleet[k].length;
				if (client.fleet[k].vert) {
					this.context.moveTo(x + this.adjust(35), y);
					this.context.lineTo(x + this.adjust(35), y + (this.adjust(70) * length));
				}
				else {
					this.context.moveTo(x, y + this.adjust(35));
					this.context.lineTo(x + (this.adjust(70) * length), y + this.adjust(35));
				}
				this.context.lineWidth = '5';
				this.context.strokeStyle = 'red';
				this.context.stroke();
				this.context.closePath();
			}
		}
		//Draw lines through sunk enemy ships on the target grid to let player know they sunk a ship
		for (var c = 0; c < enemyFleet.length; c++) {
			if (enemyFleet[c] != null) {
				this.context.beginPath();
				var point = client.targetGrid[enemyFleet[c].mainX][enemyFleet[c].mainY];
				var x = point.corner.posX;
				var y = point.corner.posY;
				var length = enemyFleet[c].length;
				if (enemyFleet[c].vert) {
					this.context.moveTo(x + this.adjust(35), y);
					this.context.lineTo(x + this.adjust(35), y + (this.adjust(70) * length));
				}
				else {
					this.context.moveTo(x, y + this.adjust(35));
					this.context.lineTo(x + (this.adjust(70) * length), y + this.adjust(35));
				}
				this.context.lineWidth = '5';
				this.context.strokeStyle = 'lime';
				this.context.stroke();
				this.context.closePath();
			}
		}
		//Draw scan results on appropriate tiles
		for (var d = 0; d < scannedTiles.length; d++) {
			var tile = scannedTiles[d];
			this.context.shadowColor = 'transparent';
			this.context.fillStyle = 'white';
			this.context.strokeStyle = 'black'
			this.context.lineWidth = 1;
			this.context.font = 'bold 40px Arial';
			this.context.fillText(tile.scanCount, tile.corner.posX + this.adjust(35), tile.corner.posY + this.adjust(50));
			this.context.strokeText(tile.scanCount, tile.corner.posX + this.adjust(35), tile.corner.posY + this.adjust(50));
			this.context.shadowColor = 'black';
		}
	}
	
	//draw red rectangle around selected ship
	drawShipSelector(shipIndex) {
		var currentShip = client.fleet[shipIndex];
		var drawPoint = client.homeGrid[currentShip.mainX][currentShip.mainY].corner;
		var selectorW = playWindow.adjust(playWindow.images[shipIndex].width);
		var selectorH = playWindow.adjust(playWindow.images[shipIndex].height);
		playWindow.context.lineWidth='3';
		playWindow.context.strokeStyle='red';
		playWindow.context.strokeRect(drawPoint.posX, drawPoint.posY, selectorW, selectorH);
	}
	
	//draw red rectangle around selected tile
	drawTileSelector(gridCoordinate) {
		var drawPoint = client.targetGrid[gridCoordinate.posX][gridCoordinate.posY].corner;
		var dimension = playWindow.adjust(70);
		playWindow.context.lineWidth='3';
		playWindow.context.strokeStyle='red';
		playWindow.context.strokeRect(drawPoint.posX, drawPoint.posY, dimension, dimension);
	}
	
	draw() {
		this.context.drawImage(this.background, 0, 0, this.adjust(this.background.width), this.adjust(this.background.height));
		this.context.font = 'bold 32px Arial';
		this.context.fillStyle = 'white';
		this.context.shadowColor = 'black';
		this.context.shadowOffsetX = 3;
		this.context.shadowOffsetY = 3;
		for (var i = 0; i < this.images.length; i++) {
			var x = client.homeGrid[client.fleet[i].mainX][client.fleet[i].mainY].corner.posX;
			var y = client.homeGrid[client.fleet[i].mainX][client.fleet[i].mainY].corner.posY;
			this.context.drawImage(this.images[i], x, y, this.adjust(this.images[i].width), this.adjust(this.images[i].height));				
		}
		this.context.fillText('Recent Activity', this.adjust(690), this.adjust(745));
		this.context.fillText('Turn', this.adjust(1625), this.adjust(75));
		this.context.fillText('Timer', this.adjust(1625), this.adjust(435));
		this.context.fillText('Ship Special Ability', this.adjust(1390), this.adjust(750));
		this.drawGrids();
		this.drawTurnMessage();
		this.drawButtonSelector(this.selectedButton);
	}
	
	cleanUp() {
		var norm = document.getElementById('normalAttack');
		var spec = document.getElementById('specialAttack');
		
		this.canvas.removeEventListener('mousemove', this.getMousePos, false);
		this.canvas.removeEventListener('click', this.selectObject, false);
		if (this.selectedShip > -1)
			this.shipDescriptions[this.selectedShip].style.display = 'none';
		norm.removeEventListener('click', this.buttonFunctions[0], false);
		spec.removeEventListener('click', this.buttonFunctions[1], false);
		clearInterval(this.timerFunction);
		socket.off(client.id + ' attack made');
		socket.off(client.id + 'end game');
	}
}