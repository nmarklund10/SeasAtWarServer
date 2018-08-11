/*
supportingClasses.js
---------------------
Contains small classes needed to keep track of game information.

*/

/*
Player class
---------------------
Holds information on player's ships, grids, whether or not it is their turn, etc.

-homeGrid: stores the hit/miss status of own player's ships
-targetGrid: stores hit/miss status of what tiles the player has fired on
-id: the player's playerID, used by the server
-fleet: array of strings, contains what ships the player chose on the Ship Select screen
-hasTurn: whether or not it is currently the player's turn
*/

class Player {
    constructor() {
        this.homeGrid = new Array(9);
		for (var i = 0; i < 9; i++) {
			this.homeGrid[i] = new Array(9);
		}
		this.targetGrid = new Array(9);
		for (var i = 0; i < 9; i++) {
			this.targetGrid[i] = new Array(9);
		}
		this.id = -1;
        this.fleet = ['temp2', 'temp3', 'temp4', 'temp5'];
		this.hasTurn = false;
    }
	
	loadGrid(grid, topLeftCorner, tileSize) {
		var x = topLeftCorner.posX;
		var y = topLeftCorner.posY;
		if (grid == 'home') {
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 9; j++) {
					this.homeGrid[i][j] = new Tile(new orderedPair(i*tileSize + x, j*tileSize + y), new orderedPair(i, j));
				}
			}
		}
		else if (grid == 'target') {
			for (var i = 0; i < 9; i++) {
				for (var j = 0; j < 9; j++) {
					this.targetGrid[i][j] = new Tile(new orderedPair(i*tileSize + x, j*tileSize + y), new orderedPair(i, j));
				}
			}
		}
	}
	
	clearGrids() {
		for (var i = 0; i < 9; i++) {
			this.homeGrid[i] = new Array(9);
			this.targetGrid[i] = new Array(9);
		}
	}
}

/*
Tile class
---------------------
Stores the information for a single Tile in a Grid

*/
class Tile {
	constructor(pair, gridPair) {
		this.coordinate = gridPair	//x and y coordinate in relation to grid
		this.corner = pair;			//top left corner pixel coordinates
		this.hasShip = false; 		//whether or not a ship occupies this tile
		this.shipHit = undefined; 	//true = 'hit', false = 'miss', undefined = 'not shot at'
		this.shipIndex = -1;  		//contains index of ship in client fleet
		this.partialVision = false; //Whether Tile is under the influence of Scanner's special attack.
		this.scrambled = false;
		this.detected = false;
		this.scanCount = -1;
	}
	
	shipPresent() {
		return this.hasShip;
	}
	
	isShotAt() {
		return this.shipHit != undefined;
	}
	
	updateTile() {
		if (!this.isShotAt()) {
			if(this.shipPresent()) {
				this.shipHit = true;
				client.fleet[this.shipIndex].shotCounter++;
			}
			else {
				this.shipHit = false;
			}
		}
	}
}

/*
orderedPair class
---------------------
Representation of a basic (x, y) coordinate pair

*/
class orderedPair{
	constructor(x,y) {
		this.posX = x;
		this.posY = y;
	}
	getX(){
		return this.posX;
	}
	getY(){
		return this.posY;
	}
	move(x,y){
		this.posX = x;
		this.posY = y;
	}
	equals(inputPair){
		if(inputPair.getX() != this.posX){
			return false;
		}
		if(inputPair.getY() != this.posY){
			return false;
		}
		return true;
	}
}