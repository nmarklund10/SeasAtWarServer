/*
setupWindows.js
---------------------
Contains the two setup windows.  The first is the one where the player selects their battleships
and the second is the one where the player can move their battleships around.
*/

/*
buildAFleetWindow class
---------------------
Holds the canvas for the fleet selection window

*/

class buildAFleetWindow {
	constructor(canvas, scale) {
		this.scale = scale;
		this.canvas = canvas;
		this.canvas.width = this.adjust(1920);
		this.canvas.height = this.adjust(1080);
		this.context = canvas.getContext('2d');
		this.background = backgrounds[0];
		this.images = new Array();
		for (var i = 0; i < client.fleet.length; i++) {
			this.images.push(shipImages.get(client.fleet[i]));	
		}
		this.buildButtons = document.getElementsByClassName('buildButton');
		this.divX = this.adjust(shipDesDims[0]);
		this.divY = this.adjust(shipDesDims[1]);
		this.currentShipDes = -1;
		this.firstSelect = [true, true, true, true];
		document.addEventListener('keydown', this.selectShips, false);
	}
	selectShips(e) {
		switch(e.keyCode) {
			case 97:
			case 49:
				shipDetails('Scrambler', 0);
				break;
			case 98:
			case 50:
				shipDetails('Scanner', 0);
				break;
			case 99:
			case 51:
				shipDetails('Submarine', 1);
				break;
			case 100:
			case 52:
				shipDetails('Defender', 1);
				break;
			case 101:
			case 53:
				shipDetails('Cruiser', 2);
				break;
			case 102:
			case 54:
				shipDetails('Carrier', 2);
				break;
			case 103:
			case 55:
				shipDetails('Executioner', 3);
				break;
			case 104:
			case 56:
				shipDetails('Artillery', 3);
				break;
			case 13:
				toPositionSelect();
				break;
		}
	}
	adjust(dimension) {
		return dimension * this.scale;
	}
	drawButtons() {
		document.getElementById('finishShipSelect').style.left = this.adjust(finishShipSelectDims[0])+'px';
		document.getElementById('finishShipSelect').style.top = this.adjust(finishShipSelectDims[1])+'px';
		for (var i = 0; i < this.buildButtons.length; i++) {
			this.buildButtons[i].style.left = this.adjust(buildButtonDims[i][0])+'px';
			this.buildButtons[i].style.top = this.adjust(buildButtonDims[i][1])+'px';
		}
	}
	draw() {
		this.context.drawImage(this.background, 0, 0, this.adjust(this.background.width), this.adjust(this.background.height));
		this.context.shadowColor = 'black';
		this.context.shadowOffsetX = 3;
		this.context.shadowOffsetY = 3;
		this.context.drawImage(this.images[0], this.adjust(390), this.adjust(240), this.adjust(this.images[0].width), this.adjust(this.images[0].height));
		this.context.drawImage(this.images[1], this.adjust(320), this.adjust(240), this.adjust(this.images[1].width), this.adjust(this.images[1].height));
		this.context.drawImage(this.images[2], this.adjust(250), this.adjust(240), this.adjust(this.images[2].width), this.adjust(this.images[2].height));
		this.context.drawImage(this.images[3], this.adjust(180), this.adjust(240), this.adjust(this.images[3].width), this.adjust(this.images[3].height));
		this.context.fillStyle = 'white';
		this.context.font = 'bold 32px Arial';
		this.context.fillText('Build Fleet Menu', this.adjust(850), this.adjust(100));
		this.context.font = 'bold 24px Arial';
		this.context.fillText('Scrambler', this.adjust(850), this.adjust(225));
		this.context.fillText('Scanner', this.adjust(850), this.adjust(315));
		this.context.fillText('Submarine', this.adjust(850), this.adjust(435));
		this.context.fillText('Defender', this.adjust(850), this.adjust(525));
		this.context.fillText('Cruiser', this.adjust(850), this.adjust(645));
		this.context.fillText('Carrier', this.adjust(850), this.adjust(735));
		this.context.fillText('Executioner', this.adjust(850), this.adjust(855));
		this.context.fillText('Artillery', this.adjust(850), this.adjust(945));
		this.context.font = 'bold 28px Arial';
		this.context.fillText('Class 2', this.adjust(750), this.adjust(170));
		this.context.fillText('Class 3', this.adjust(750), this.adjust(380));
		this.context.fillText('Class 4', this.adjust(750), this.adjust(590));
		this.context.fillText('Class 5', this.adjust(750), this.adjust(800));
		this.context.font = 'bold 28px Arial';
		this.context.fillText('Ship Ability', this.adjust(250), this.adjust(740));
		
	}
	
	cleanUp() {
		for (var i = 0; i < this.buildButtons.length; i++) {
			this.buildButtons[i].disabled = false;
		}
		if (this.currentShipDes != -1)
			document.getElementsByClassName('shipDes')[this.currentShipDes].style.display = 'none';
		document.removeEventListener('keydown', this.selectShips);
	}
}

/*
buildAFleetWindow class
---------------------
Holds the canvas for the fleet positioning window

*/

class fleetPositionWindow {
	constructor(canvas, scale) {
		this.scale = scale;
		this.canvas = canvas;
		this.canvas.width = this.adjust(1920);
		this.canvas.height = this.adjust(1080);
		this.context = canvas.getContext('2d');
		this.background = backgrounds[1];
		this.images = new Array();
		this.images.push(shipImages.get(client.fleet[0]));
		this.images.push(shipImages.get(client.fleet[1]));
		this.images.push(shipImages.get(client.fleet[2]));
		this.images.push(shipImages.get(client.fleet[3]));
		this.shipNames = client.fleet.slice(0);

		client.fleet[0] = new moveableShip(client.fleet[0], 2, 5, 3);
		client.fleet[1] = new moveableShip(client.fleet[1], 3, 4, 3);
		client.fleet[2] = new moveableShip(client.fleet[2], 4, 3, 3);
		client.fleet[3] = new moveableShip(client.fleet[3], 5, 2, 3);
		client.loadGrid('home', new orderedPair(this.adjust(40), this.adjust(30)), this.adjust(70));
		this.selectButtons = document.getElementsByClassName('shipSelectButton');
		this.moveButtons = document.getElementsByClassName('shipMoveButton');
		this.selectedShip = -1;	
		this.hoveredShip = -1;
		//monitors keyboard input
		document.addEventListener('keydown', this.moveShips, false);
		//monitors mouse input
		this.canvas.addEventListener('mousemove', this.getMousePos, false);
		this.canvas.addEventListener('click', this.selectShip, false);
	}
	
	waitMessage() {
		this.canvas.removeEventListener('mousemove', this.getMousePos);
		this.canvas.removeEventListener('click', this.selectShip);
		this.context.font = '24px Arial';
		this.context.fillStyle = 'white';
		this.context.shadowColor = 'black';
		this.context.shadowOffsetX = 3;
		this.context.shadowOffsetY = 3;
		this.draw();
		this.context.fillText('Waiting for other player...', this.adjust(177), this.adjust(950));
		for (var i = 0; i < client.fleet.length; i++) {
			client.fleet[i].updateSpecialAttacksLeft();
		}
		var buttons = document.getElementById('positionFleet').querySelectorAll('button');
		[].forEach.call(buttons, function(element) {
			element.disabled = true;
		});
	}
	
	getMousePos(evt) {
		//http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
		var rect = positionWindow.canvas.getBoundingClientRect();
		var mousePos = new orderedPair (
										Math.round((evt.clientX-rect.left)/(rect.right-rect.left)*positionWindow.canvas.width),
										Math.round((evt.clientY-rect.top)/(rect.bottom-rect.top)*positionWindow.canvas.height));
		var result = positionWindow.processMousePos(mousePos);
		var gridName = result.grid;
		var gridCoordinate = result.point;
		var x = gridCoordinate.posX;
		var y = gridCoordinate.posY;
		positionWindow.hoveredShip = -1;
		if (gridName == 'home') {
			var found = false;
			for (var i = 0; i < client.fleet.length; i++) {
				if (client.fleet[i].containsPoint(gridCoordinate)) {
					found = true;
					positionWindow.draw();
					if (i != positionWindow.selectedShip) {
						positionWindow.hoveredShip = i;
						if (positionWindow.hoveredShip != positionWindow.selectedShip) {
							positionWindow.drawSelectShip(i, false);
						}
					}
				}
			}
			if (!found) {
				positionWindow.draw();
			}
			if (positionWindow.selectedShip != -1) {
				positionWindow.drawSelectShip(positionWindow.selectedShip, false);
			}
		}
		else {
			positionWindow.draw();
			if (positionWindow.selectedShip != -1) {
				positionWindow.drawSelectShip(positionWindow.selectedShip, false);	
			}
		}
	}
	
	processMousePos(posPair) {
		var xPair = posPair.posX;
		var yPair = posPair.posY;
		var gridName = 'none';
		if(xPair >= positionWindow.adjust(40) && xPair <= positionWindow.adjust(670) && yPair >= positionWindow.adjust(30) && yPair <= positionWindow.adjust(660)){
			//Handle home grid
			xPair = xPair - positionWindow.adjust(40);
			switch(true){
				case (xPair <= positionWindow.adjust(70)):
					xPair = 0;
					break;
				case (xPair <= positionWindow.adjust(140)):
					xPair = 1;
					break;
				case (xPair <= positionWindow.adjust(210)):
					xPair = 2;
					break;
				case (xPair <= positionWindow.adjust(280)):
					xPair = 3;
					break;
				case (xPair <= positionWindow.adjust(350)):
					xPair = 4;
					break;
				case (xPair <= positionWindow.adjust(420)):
					xPair = 5;
					break;
				case (xPair <= positionWindow.adjust(490)):
					xPair = 6;
					break;
				case (xPair <= positionWindow.adjust(560)):
					xPair = 7;
					break;
				case (xPair <= positionWindow.adjust(630)):
					xPair = 8;
					break;
			}
			yPair = yPair - positionWindow.adjust(30);
			switch(true){
				case (yPair <= positionWindow.adjust(70)):
					yPair = 0;
					break;
				case (yPair <= positionWindow.adjust(140)):
					yPair = 1;
					break;
				case (yPair <= positionWindow.adjust(210)):
					yPair = 2;
					break;
				case (yPair <= positionWindow.adjust(280)):
					yPair = 3;
					break;
				case (yPair <= positionWindow.adjust(350)):
					yPair = 4;
					break;
				case (yPair <= positionWindow.adjust(420)):
					yPair = 5;
					break;
				case (yPair <= positionWindow.adjust(490)):
					yPair = 6;
					break;
				case (yPair <= positionWindow.adjust(560)):
					yPair = 7;
					break;
				case (yPair <= positionWindow.adjust(630)):
					yPair = 8;
					break;
			}
			gridName = 'home';
			//xPair and yPair are now values 0 through 8
		}
		var returnData = {
			grid: gridName,
			point: new orderedPair(xPair, yPair)
		};
		return returnData;
	}
	
	selectShip(evt) {
		var previousShip = positionWindow.selectedShip;
		if (positionWindow.hoveredShip != -1) {	
			if (positionWindow.selectedShip != positionWindow.hoveredShip)
				positionWindow.drawSelectShip(positionWindow.hoveredShip, true);
		}
	}
	
	adjust(dimension) {
		return dimension * this.scale;
	}
	
	drawButtons() {
		document.getElementById('finishFleet').style.left = this.adjust(finishFleetDims[0])+'px';
		document.getElementById('finishFleet').style.top = this.adjust(finishFleetDims[1])+'px';
		for (var i = 0; i < this.selectButtons.length; i++) {
			this.selectButtons[i].style.left = this.adjust(selectButtonDims[i][0])+'px';
			this.selectButtons[i].style.top = this.adjust(selectButtonDims[i][1])+'px';
		}
		for (var i = 0; i < this.moveButtons.length; i++) {
			this.moveButtons[i].style.left = this.adjust(moveButtonDims[i][0])+'px';
			this.moveButtons[i].style.top = this.adjust(moveButtonDims[i][1])+'px';
		}
	}
	
	draw() {
		this.context.drawImage(this.background, 0, 0, this.adjust(this.background.width), this.adjust(this.background.height));
		this.context.font = 'bold 32px Arial';
		this.context.fillStyle = 'white';
		this.context.shadowColor = 'black';
		this.context.shadowOffsetX = 3;
		this.context.shadowOffsetY = 3;
		for (var i = 0; i < client.fleet.length; i++) {
			var x = client.homeGrid[client.fleet[i].mainX][client.fleet[i].mainY].corner.posX;
			var y = client.homeGrid[client.fleet[i].mainX][client.fleet[i].mainY].corner.posY;
			this.context.drawImage(this.images[i], x, y, this.adjust(this.images[i].width), this.adjust(this.images[i].height));
		}
		this.context.fillText('Move Fleet Menu', this.adjust(850), this.adjust(100));
		this.context.font = '28px Arial';
		for (var i = 0; i < this.shipNames.length; i++)
			this.context.fillText(this.shipNames[i], this.adjust(950), this.adjust(225 + (i * 130)));
	}
	
	moveShips(e) {
		switch (e.keyCode) {
			case 98:
			case 50:
				//select class 2 ship
				positionWindow.draw();
				if (positionWindow.hoveredShip != -1)
					positionWindow.drawSelectShip(positionWindow.hoveredShip, false);
				positionWindow.drawSelectShip(0, true);
				break;
			case 99:
			case 51:
				//select class 3 ship
				positionWindow.draw();
				if (positionWindow.hoveredShip != -1)
					positionWindow.drawSelectShip(positionWindow.hoveredShip, false);
				positionWindow.drawSelectShip(1, true);
				break;
			case 100:
			case 52:
				//select class 4 ship
				positionWindow.draw();
				if (positionWindow.hoveredShip != -1)
					positionWindow.drawSelectShip(positionWindow.hoveredShip, false);
				positionWindow.drawSelectShip(2, true);
				break;
			case 101:
			case 53:
				//select class 5 ship
				positionWindow.draw();
				if (positionWindow.hoveredShip != -1)
					positionWindow.drawSelectShip(positionWindow.hoveredShip, false);
				positionWindow.drawSelectShip(3, true);
				break;

			case 37:
				//move selected ship left
				positionWindow.moveAction('Left');
				break;
			case 38:
				//move selected ship up
				positionWindow.moveAction('Up');
				break;
			case 39:
				//move selected ship right
				positionWindow.moveAction('Right');
				break;
			case 40:
				//move selected ship down
				positionWindow.moveAction('Down');
				break;
			case 32:
				//rotate selected ship
				positionWindow.moveAction('Rotate');
				break;
			case 13:
				//finish
				startGameScreen();
				break;
		}
	}
	
	drawSelectShip(shipID, selectBool) {
		if (this.selectedShip != -1) {
			if (selectBool)
				document.getElementsByClassName('shipSelectButton')[this.selectedShip].disabled = false;
		}
		if (selectBool)
			document.getElementsByClassName('shipSelectButton')[shipID].disabled = true;
		if (selectBool)
			this.selectedShip = shipID;
		this.context.lineWidth='3';
		this.context.strokeStyle='red';
		this.context.strokeRect(this.adjust(945), this.adjust(173 + (shipID * 130)), this.adjust(287), this.adjust(76));
		var currentShip = client.fleet[shipID];
		var drawPoint = client.homeGrid[currentShip.mainX][currentShip.mainY].corner;
		var selectorW = this.adjust(this.images[shipID].width);
		var selectorH = this.adjust(this.images[shipID].height);
		this.context.strokeRect(drawPoint.posX, drawPoint.posY, selectorW, selectorH);
	}
	
	//determine if the attempted move in position for the current ship is valid (in the game window and does not overlap with other ships)
	//if valid return true, false otherwise
	checkPosition(desiredMove) {
		this.draw();
		var shipID = this.selectedShip;
		this.drawSelectShip(shipID, true);
		for(var i = 0; i < desiredMove.length; i++) {
			var current = desiredMove[i];
			//out of bounds X check
			if(current.getX() < 0 || current.getX() > 8){
				this.context.fillText('Invalid Move!', this.adjust(240), this.adjust(760));
				return false;
			}
			//out of bounds Y check
			if(current.getY() < 0 || current.getY() > 8){
				this.context.fillText('Invalid Move!', this.adjust(240), this.adjust(760));
				return false;
			}
			//ship collision check
			for(var j = 0; j < client.fleet.length; j++){
				if(j != shipID){
					var compareShip = client.fleet[j].posArray;
					for(var k = 0; k < compareShip.length; k++){
						var comparePos = compareShip[k];
						if(current.equals(comparePos)){
							this.context.fillText('Invalid Move!', this.adjust(240), this.adjust(760));
							return false;
						}
					}//end comparePos
				}
			}//end ship loop
		}//desiredMove loop end; 
		return true;
	}
	
	//attempt to move or rotate the currently selected ship
	//actionString determines whether to move the ship up, down, left, right, or to rotate the ship 90 degrees
	//returns true if successful, false otherwise
	moveAction(actionString){
		var shipID = this.selectedShip;
		if (shipID > -1) { 
			if(actionString == 'Rotate'){
				if(!this.checkPosition(client.fleet[shipID].checkRotate()))
					return false;
				
				client.fleet[shipID].rotate();
				if(client.fleet[shipID].vert)
					this.images[shipID] = shipImages.get(this.shipNames[shipID]);
				else
					this.images[shipID] = shipImages.get(this.shipNames[shipID] + 'Hor');
			}
			else if(actionString == 'Up') {
				if(!this.checkPosition(client.fleet[shipID].checkMove('Up')))
					return false;
				client.fleet[shipID].move('Up');
			}
			else if(actionString == 'Down') {
				if(!this.checkPosition(client.fleet[shipID].checkMove('Down')))
					return false;
				client.fleet[shipID].move('Down');
			}
			else if(actionString == 'Right') {
				if(!this.checkPosition(client.fleet[shipID].checkMove('Right')))
					return false;
				client.fleet[shipID].move('Right');
			}
			else if(actionString == 'Left') {
				if(!this.checkPosition(client.fleet[shipID].checkMove('Left')))
					return false;
				client.fleet[shipID].move('Left');
			}
			this.draw();
			this.drawSelectShip(shipID, true);
			return true;
		}
	}
	
	cleanUp() {
		this.canvas.addEventListener('mousemove', this.getMousePos);
		this.canvas.addEventListener('click', this.selectObject);
		document.removeEventListener('keydown', this.moveShips);
		var buttons = document.getElementById('positionFleet').querySelectorAll('button');
		[].forEach.call(buttons, function(element) {
			element.disabled = false;
		});
	}
}