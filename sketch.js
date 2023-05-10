class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.cells = [];
    this.doors = [];
  }


  display() {
    fill(this.color);
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height* CELLSIZE);
  }


  createNeighbor(x, y, w, h) {

    let newRoom = new Room(x, y, w, h);

    let spawningSide = random(directions);
    
    if (spawningSide === "north") {
      newRoom.y -= newRoom.height;
      newRoom.x += floor(random(-newRoom.width+1, this.width-1));
    }
    if (spawningSide === "south") {
      newRoom.y += this.height;
      newRoom.x += floor(random(-newRoom.width+1, this.width-1));
    }
    if (spawningSide === "east") {
      newRoom.x += this.width;
      newRoom.y += floor(random(-newRoom.height+1, this.height-1));
    }
    if (spawningSide === "west") {
      newRoom.x -= newRoom.width;
      newRoom.y += floor(random(-newRoom.height+1, this.height-1));
    } 
    return newRoom;
  }


  positionValid() {

    let thisRoom = [];
    for (let x = this.x; x < this.x+this.width; x++) {
      for (let y = this.y; y < this.y+this.height; y++) {
        thisRoom.push(new Cell(x, y));
      }
    }

    for (let otherRoom of rooms) {

      for (let i = 0; i < thisRoom.length; i++) {
        for (let otherCell of otherRoom.cells) {
          if (thisRoom[i].x === otherCell.x && thisRoom[i].y === otherCell.y) {
            return false;
          }
        }
      }
    }
    return true;
  }


  spawnDoors() {

    for (let otherRoom of rooms) {
      if (otherRoom !== this) {
        let options = [];

        for (let someCell of this.cells) {
          for (let otherCell of otherRoom.cells) {

            if (someCell.x === otherCell.x - 1 && someCell.y === otherCell.y) {
              options.push([someCell, otherCell]);
              //someCell.object = "door";
              //otherCell.object = "door";
            }
            if (someCell.x === otherCell.x && someCell.y === otherCell.y - 1) {
              options.push([someCell, otherCell]);
              //someCell.object = "door";
              //otherCell.object = "door";
            }
          }
        }

        if (options.length > 0) {
          let chosenDoor = random(options);
          chosenDoor[0].object = "door";
          chosenDoor[1].object = "door";

        }
      }
    }
  }


  addCells() {

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        
        let xPos = x + this.x;
        let yPos = y + this.y;
        let newCell = new Cell(xPos, yPos);

        cells.push(newCell);
        this.cells.push(newCell);
      }
    }
  }

}


class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.object = "blank";
    this.color = "white";
    this.walls = [false, false, false, false]; // NSEW
  }

  display() {
    fill(this.color);
    rect(this.x*CELLSIZE + width/2, this.y*CELLSIZE + height/2, CELLSIZE, CELLSIZE);
  }


  determineColor(color) {
    this.color = color;
    if (this.object === "door") {
      this.color = "black";
    }
  }


  findWalls() {

    if (this.object !== "door") {
      for (let i = 0; i < this.walls.length; i++) {
        if (this.adjacentCell(directions[i]) === "wall") {
          this.walls[i] = true;
        }
      }
    }
  }


  adjacentCell(direction) {

    let xModifier;
    let yModifier;

    if (direction === "north") {
      xModifier = 0;
      yModifier = 1;
    }
    if (direction === "south") {
      xModifier = 0;
      yModifier = -1;
    }
    if (direction === "east") {
      xModifier = 1;
      yModifier = 0;
    }
    if (direction === "west") {
      xModifier = -1;
      yModifier = 0;
    }

    for (let i = 0; i < rooms[player.currentRoom].cells.length; i++) {
      let someCell = rooms[player.currentRoom].cells[i];
      if (someCell.x + xModifier === this.x) {
        if (someCell.y + yModifier === this.y) {
          return i;
        }
      }
    }
    return "wall";
  }
}


class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = 10;
    this.speed = CELLSIZE/550;
    this.size = CELLSIZE/2;
    this.currentRoom = 0;
    this.currentCell = 0;
  }

  display() {
    fill("red");
    circle(this.x*CELLSIZE + width/2, this.y*CELLSIZE + height/2, this.size);
  }

  checkRoom() {
    
    for (let i = 0; i < rooms.length; i++) {
      if (this.x >= rooms[i].x && this.x <= rooms[i].x+rooms[i].width) {
        if (this.y >= rooms[i].y && this.y <= rooms[i].y+rooms[i].height) {
          this.currentRoom = i;
        }
      }
    }
  }

  checkCell() {

    let roomCells = rooms[this.currentRoom].cells;
    for (let i = 0; i < roomCells.length; i++) {
      if (floor(this.x) === roomCells[i].x && floor(this.y) === roomCells[i].y) {
        this.currentCell = i;
      }
    }
  } 

  checkRoomCollisions(direction) {

    this.checkRoom();
    this.checkCell();
    let thisRoom = rooms[this.currentRoom];
    let thisCell = thisRoom.cells[this.currentCell];

    if (direction === "north") {
      if (thisCell.walls[0] && this.y <= thisCell.y) {
        this.y = thisCell.y;
      }
    }
  }
}


const MAXROOMSIZE = 15;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 15;
const CELLSIZE = 60;

let cells = [];
let rooms = [];
let directions = ["north", "south", "east", "west"];
let player;


function setup() {

  createCanvas(windowWidth, windowHeight);

  createFirstRoom();
  generateRooms();
}


function draw() {

  background(220);

  if (keyIsPressed) {
    updateMovement();
  }

  translate(-player.x*CELLSIZE, -player.y*CELLSIZE);
  display();
}


function display() {

  for (let someCell of rooms[player.currentRoom].cells) {
    someCell.determineColor(rooms[player.currentRoom].color);
    someCell.display();
  }
  player.display();
}


function createFirstRoom() {

  let h = MINROOMSIZE;
  let w = MINROOMSIZE;
  
  player = new Player(floor(h/2) + 0.5, floor(w/2) + 0.5);

  let someRoom = new Room(0, 0, w, h);
  rooms.push(someRoom);
  someRoom.addCells();

  player.checkCell();
}


function generateRooms() {

  while (rooms.length < ROOMQUANTITY) {
    let validRooms = [...rooms];
    let h = floor(random(MINROOMSIZE, MAXROOMSIZE));
    let w = floor(random(MINROOMSIZE, MAXROOMSIZE));
  
    while (validRooms.length > 0) {
      let someRoom = random(validRooms);
      let x = someRoom.x;
      let y = someRoom.y;
      let newRoom = someRoom.createNeighbor(x, y, w, h);
  
      if (! newRoom.positionValid()) {
        for (let i = 0; i < validRooms.length; i++) {
          validRooms.splice(i, 1);
        }
      }
      else {
        rooms.push(newRoom);
        newRoom.addCells();
        break;
      }
    }
  }

  for (let someRoom of rooms) {
    someRoom.spawnDoors();
  }

  for (let someRoom of rooms) {
    for (let someCell of someRoom.cells) {
      someCell.findWalls();
    }
  }
}


function mousePressed() {
  let someCell = rooms[player.currentRoom].cells[player.currentCell];
  someCell.findWalls();
}


function updateMovement() {

  if (keyIsDown(87)) { //w
    player.y -= player.speed;
    player.checkRoomCollisions("north");
  }
  if (keyIsDown(83)) { //s
    player.y += player.speed;
    player.checkRoomCollisions("south");
  }
  if (keyIsDown(65)) { //d
    player.x -= player.speed;
    player.checkRoomCollisions("east");
  }
  if (keyIsDown(68)) { //a
    player.x += player.speed;
    player.checkRoomCollisions("west");
  }
}