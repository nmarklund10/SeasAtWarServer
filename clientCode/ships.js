/*
moveableShip class
---------------------
Battleship representation in our game.
Stores important data such as current position, alive status and ship type
Also handles moving and special attacks for each battleship.

*/
class moveableShip {
	constructor(name,shipSize,mainX,mainY) {
		this.shipName = name;
		this.mainX = mainX;
		this.mainY = mainY;
		this.mainPoint = new orderedPair(mainX,mainY);
		this.vert = true;
		this.length = shipSize;
		this.alive = true;
		this.posArray = this.currentPosArray();
		this.shotCounter = 0;  //if counter reaches ship's length, it sank
		this.specialAttacksLeft = 1;		
	}
	
	updateAlive() {
		if (this.alive) {
			if (this.shotCounter == this.length) {
				this.alive = false;
				return true;
			}
		}
		return false;
	}
	
	updateSpecialAttacksLeft() {
		if (this.shipName == 'Scanner' || this.shipName == 'Defender')
			this.specialAttacksLeft = 2;
		else if (this.shipName == 'Submarine' || this.shipName == 'Cruiser') {
			this.specialAttacksLeft = 0;
			if (this.shipName == 'Cruiser' || this.shipName == 'Submarine') {
				this.firstHit = true;
			}
		}
	}

	currentPosArray(){
		var pos = [this.mainPoint];
		for (var i = 0; i < this.length-1; i++){
			if(this.vert){
				pos.push(new orderedPair(this.mainX,this.mainY + 1 + i));
			}
			else{
				pos.push(new orderedPair(this.mainX + 1 + i,this.mainY));
			}
		}
		return pos;
	}
	
	containsPoint(inputPair) {
		for (var i = 0; i < this.posArray.length; i++) {
			if (this.posArray[i].equals(inputPair))
				return true;
		}
		return false;
	}
	
	checkRotate(){
		var pos = [this.mainPoint];
		for (var i = 0; i < this.length-1; i++){
			if(this.vert == true){
				pos.push(new orderedPair(this.mainX + 1 + i,this.mainY));
			}
			else{
				pos.push(new orderedPair(this.mainX,this.mainY + 1 + i));
			}
		}
		return pos;
	}
	rotate(){
		if(this.vert == true){
			this.vert = false;
		}
		else{
			this.vert = true;
		}
	}
	
	checkMove(direction){
		var xChange = 0;
		var yChange = 0;
		if(direction == 'Up'){
			xChange = 0;
			yChange = -1;
		}
		else if(direction == 'Down'){
			xChange = 0;
			yChange = 1;
		}
		else if(direction == 'Right'){
			xChange = 1;
			yChange = 0;
		}
		else if(direction == 'Left'){
			xChange = -1;
			yChange = 0;
		}
		
		var pos = [new orderedPair(this.mainX + xChange,this.mainY + yChange)];
		for (var i = 0; i < this.length-1; i++){
			if(this.vert){
				pos.push(new orderedPair(this.mainX + xChange,this.mainY + 1 + i + yChange));
			}
			else{
				pos.push(new orderedPair(this.mainX + 1 + i + xChange,this.mainY + yChange));
			}
		}
		return pos;
	}
	
	move(direction){
		var xChange = 0;
		var yChange = 0;
		if(direction == 'Up'){
			xChange = 0;
			yChange = -1;
		}
		else if(direction == 'Down'){
			xChange = 0;
			yChange = 1;
		}
		else if(direction == 'Right'){
			xChange = 1;
			yChange = 0;
		}
		else if(direction == 'Left'){
			xChange = -1;
			yChange = 0;
		}
		this.mainX = this.mainX + xChange;
		this.mainY = this.mainY + yChange;
		this.mainPoint.move(this.mainX,this.mainY);
		this.posArray = this.currentPosArray();
	}
	
	specialAttack(attackedCoordinate) {
		var result = new Array();
		if (this.shipName == 'Scrambler') {
			result.push(1); //1 attack code
			this.specialAttacksLeft--;
			playAudio('scramble');
			return result;
		}
		else if (this.shipName == 'Scanner') {
			result.push(2); //2 attack code
			result.push(attackedCoordinate); //center (attack point)
			if (scramble > 0) {
				playAudio('error');
				result.push(0);	//scrambled
			}
			else 
				playAudio('scan');
			this.specialAttacksLeft--;
			return result;
		}
		else if (this.shipName == 'Submarine') {
			result.push(3); //3 error code
			this.firstHit = false
			submarineSpecial()
			return result;
		}
		else if (this.shipName == 'Defender') {
			result.push(4); //4 error code
			this.specialAttacksLeft--;
			result.push(attackedCoordinate); //attack point
			playAudio('fire');
			return result;
		}
		else if (this.shipName == 'Cruiser') {
			this.firstHit = false;
			if (scramble > 0) {
				return undefined;
			}
			else {
				result.push(5); //5 attack code
				result.push(attackedCoordinate); //ship index of attacking ship
				return result;
			}
		}
		else if (this.shipName == 'Carrier') {
			result.push(6); //6 attack code
			if (scramble > 0) {
				playAudio('error');
				result.push(0);	//scrambled
			}
			else 
				playAudio('detect');
			this.specialAttacksLeft--;
			return result;
		}
		else if (this.shipName == 'Executioner') {
			var x = attackedCoordinate.posX;
			var y = attackedCoordinate.posY;
			result.push(7); //7 attack code
			result.push(attackedCoordinate); //attack point
			if (client.targetGrid[x][y].partialVision) {
				result.push(1);		//find smallest ship in scanned area
			}
			else {
				result.push(0);		//if spot has ship, kill whole ship
			}
			if (playWindow.scanData.length > 0) {
				result.push(playWindow.scanData.slice(1));
			}
			playAudio('execute');
			this.specialAttacksLeft--;
			return result;
		}
		else if (this.shipName == 'Artillery') {
			result.push(8) //8 attack code
			result.push(attackedCoordinate);
			playAudio('barrage');
			this.specialAttacksLeft--;
			return result;
		}
	}
}

//executed when player gets attacked, called in main
function processSpecialAttack(name, attackedCoordinate) {
	var result = new Array();
	var x;
	var y;
	if (typeof attackedCoordinate !== 'number') {
		x = attackedCoordinate.posX;
		y = attackedCoordinate.posY;
	}
	if (name == 'Scanner') {
		//this section only selects the location that are in bounds
		if(x-1 > -1 && y-1 > -1){
			result.push(new orderedPair(x-1, y-1)); //top left
		}
		if(y-1 > -1){
			result.push(new orderedPair(x, y-1)); //top mid
		}
		if(x+1 < 9 && y-1 > -1){
			result.push(new orderedPair(x+1, y-1)); //top right
		}
		if(x-1 > -1){
			result.push(new orderedPair(x-1, y)); // mid left
		}
		if(x+1 < 9){
			result.push(new orderedPair(x+1, y)); //mid right
		}
		if(x-1 > -1 && y+1 < 9){
			result.push(new orderedPair(x-1, y+1)); //top left
		}
		if(y+1 < 9){
			result.push(new orderedPair(x, y+1)); //top mid
		}
		if(x+1 < 9 && y+1 < 9){
			result.push(new orderedPair(x+1, y+1)); //top right
		}
		return result;
	}
	else if (name == 'Artillery') {
		result.push(attackedCoordinate);
		if (x+1 < 9) {
			if (!client.homeGrid[x+1][y].isShotAt())
				result.push(new orderedPair(x+1, y));
		}
		if (y+1 < 9) {
			if (!client.homeGrid[x][y+1].isShotAt())
				result.push(new orderedPair(x, y+1));
		}
		if (x-1 > -1) {
			if (!client.homeGrid[x-1][y].isShotAt())
				result.push(new orderedPair(x-1, y));
		}
		if (y-1 > -1) {
			if (!client.homeGrid[x][y-1].isShotAt())
				result.push(new orderedPair(x, y-1));
		}
		return result;
	}
}

function submarineSpecial() {
	var canRelocateHorizontally = false;
	var canRelocateVertically = false;
	//check if possible to relocate vertically
	for(var i=0; i < client.homeGrid.length; i++) {
		var row = client.homeGrid[i];
		for(var j=0; j < row.length-2; j++) {
			var tile0 = client.homeGrid[i][j];
			var tile1 = client.homeGrid[i][j+1];
			var tile2 = client.homeGrid[i][j+2];
			if(tile0.hasShip == false && tile0.shipHit == undefined &&
			   tile1.hasShip == false && tile1.shipHit == undefined &&
			   tile2.hasShip == false && tile2.shipHit == undefined) {
				canRelocateVertically = true;
			}
		}
	}
	//check horizontally
	if(canRelocateHorizontally == false) {
		for(var i=0; i < client.homeGrid.length-2; i++) {
			var row = client.homeGrid[i];
			for(var j=0; j < row.length; j++) {
				var tile0 = client.homeGrid[i][j];
				var tile1 = client.homeGrid[i+1][j];
				var tile2 = client.homeGrid[i+2][j];
				if(tile0.hasShip == false && tile0.shipHit == undefined &&
				   tile1.hasShip == false && tile1.shipHit == undefined &&
				   tile2.hasShip == false && tile2.shipHit == undefined) {
					canRelocateHorizontally = true;
				}
			}
		}
	}
	
	if(canRelocateHorizontally || canRelocateVertically) {
		var relocated = false;
		while(relocated == false) {
			var row = getRandomInt(0,8);
			var column = getRandomInt(0,8);
			//[7,7], [7,8], [8,7], and [8,8] are invalid positions
			if(row == 7 && column == 7)
				continue;
			else if(row == 7 && column == 8)
				continue;
			else if(row == 8 && column == 7)
				continue;
			else if(row == 8 && column == 8)
				continue;
			
			var validHorizontal = false;
			var validVertical = false;
			
			if(canRelocateHorizontally) {
				if (column >= 7)
					continue;
				var tile0h = client.homeGrid[column][row];
				var tile1h = client.homeGrid[column+1][row];
				var tile2h = client.homeGrid[column+2][row];
				if(tile0h.hasShip == false && tile0h.shipHit == undefined &&
				   tile1h.hasShip == false && tile1h.shipHit == undefined &&
				   tile2h.hasShip == false && tile2h.shipHit == undefined) {
					validHorizontal = true;
				}
			}
			if(canRelocateVertically) {
				if (row >= 7)
					continue;
				var tile0v = client.homeGrid[column][row];
				var tile1v = client.homeGrid[column][row+1];
				var tile2v = client.homeGrid[column][row+2];
				if(tile0v.hasShip == false && tile0v.shipHit == undefined &&
				   tile1v.hasShip == false && tile1v.shipHit == undefined &&
				   tile2v.hasShip == false && tile2v.shipHit == undefined) {
					validVertical = true;
				}
			}
			
			if(validVertical && validHorizontal) {
				//choose orientation at random if both are valid
				if(getRandomInt(0,1) == 0){
					//choose vertical
					if (!client.fleet[1].vert) {
						playWindow.images[1] = playWindow.alternateSubmarine;
						client.fleet[1].vert = !client.fleet[1].vert;
					}
					client.fleet[1].mainPoint = new orderedPair(column, row);
					client.fleet[1].mainX = column;
					client.fleet[1].mainY = row;
					client.fleet[1].shotCounter = 0;
					for (var i = 0; i < client.fleet[1].posArray.length; i++) {
						var x = client.fleet[1].posArray[i].posX;
						var y = client.fleet[1].posArray[i].posY;
						client.homeGrid[x][y].hasShip = false;
						client.homeGrid[x][y].shipIndex = -1;
					}
					client.fleet[1].posArray = client.fleet[1].currentPosArray();
					for (var i = 0; i < client.fleet[1].posArray.length; i++) {
						var x = client.fleet[1].posArray[i].posX;
						var y = client.fleet[1].posArray[i].posY;
						client.homeGrid[x][y].hasShip = true;
						client.homeGrid[x][y].shipIndex = 1;
					}
				}
				else {
					//choose horizontal
					if (client.fleet[1].vert) {
						playWindow.images[1] = playWindow.alternateSubmarine;
						client.fleet[1].vert = !client.fleet[1].vert;
					}
					client.fleet[1].mainPoint = new orderedPair(column, row);
					client.fleet[1].mainX = column;
					client.fleet[1].mainY = row;
					client.fleet[1].shotCounter = 0;
					for (var i = 0; i < client.fleet[1].posArray.length; i++) {
						var x = client.fleet[1].posArray[i].posX;
						var y = client.fleet[1].posArray[i].posY;
						client.homeGrid[x][y].hasShip = false;
						client.homeGrid[x][y].shipIndex = -1;
					}
					client.fleet[1].posArray = client.fleet[1].currentPosArray();
					for (var i = 0; i < client.fleet[1].posArray.length; i++) {
						var x = client.fleet[1].posArray[i].posX;
						var y = client.fleet[1].posArray[i].posY;
						client.homeGrid[x][y].hasShip = true;
						client.homeGrid[x][y].shipIndex = 1;
					}
				}
				relocated = true;
			}
			else if(validVertical) {
				//choose vertical
				if (!client.fleet[1].vert) {
					playWindow.images[1] = playWindow.alternateSubmarine;
					client.fleet[1].vert = !client.fleet[1].vert;
				}
				client.fleet[1].mainPoint = new orderedPair(column, row);
				client.fleet[1].mainX = column;
				client.fleet[1].mainY = row;
				client.fleet[1].shotCounter = 0;
				for (var i = 0; i < client.fleet[1].posArray.length; i++) {
					var x = client.fleet[1].posArray[i].posX;
					var y = client.fleet[1].posArray[i].posY;
					client.homeGrid[x][y].hasShip = false;
					client.homeGrid[x][y].shipIndex = -1;
				}
				client.fleet[1].posArray = client.fleet[1].currentPosArray();
				for (var i = 0; i < client.fleet[1].posArray.length; i++) {
					var x = client.fleet[1].posArray[i].posX;
					var y = client.fleet[1].posArray[i].posY;
					client.homeGrid[x][y].hasShip = true;
					client.homeGrid[x][y].shipIndex = 1;
				}
				relocated = true;
				
			}
			else if(validHorizontal) {
				//choose horizontal
				if (client.fleet[1].vert) {
					playWindow.images[1] = playWindow.alternateSubmarine;
					client.fleet[1].vert = !client.fleet[1].vert;
				}
				client.fleet[1].mainPoint = new orderedPair(column, row);
				client.fleet[1].mainX = column;
				client.fleet[1].mainY = row;
				client.fleet[1].shotCounter = 0;
				for (var i = 0; i < client.fleet[1].posArray.length; i++) {
					var x = client.fleet[1].posArray[i].posX;
					var y = client.fleet[1].posArray[i].posY;
					if (client.homeGrid[x][y].isShotAt())
						client.homeGrid[x][y].hasShip = true;
					else
						client.homeGrid[x][y].hasShip = false;
					client.homeGrid[x][y].shipIndex = -1;
				}
				client.fleet[1].posArray = client.fleet[1].currentPosArray();
				for (var i = 0; i < client.fleet[1].posArray.length; i++) {
					var x = client.fleet[1].posArray[i].posX;
					var y = client.fleet[1].posArray[i].posY;
					client.homeGrid[x][y].hasShip = true;
					client.homeGrid[x][y].shipIndex = 1;
				}
				relocated = true;
				
			}
		}
	}
	
}