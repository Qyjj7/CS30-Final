// Project Title
// Your Name
// Description


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


  adjacentCells() {

    let theseCells = [];
    for (let someCell of this.cells) {
      if (someCell.x === this.x && someCell.y === this.y-1) { //north
        theseCells.push(someCell);
      }
      if (someCell.x === this.x && someCell.y === this.y+1) { //south
        theseCells.push(someCell);
      }
      if (someCell.x === this.x+1 && someCell.y === this.y) { //east
        theseCells.push(someCell);
      }
      if (someCell.x === this.x-1 && someCell.y === this.y) { //west
        theseCells.push(someCell);
      }
    }
    return theseCells;
  }
}


class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = 10;
    this.speed = CELLSIZE/550;
    this.size = CELLSIZE/2;
    this.room = 0;
  }

  display() {
    fill("red");
    circle(this.x*CELLSIZE + width/2, this.y*CELLSIZE + height/2, this.size);
  }

  checkRoom() {
    
    for (let i = 0; i < rooms.length; i++) {
      if (this.x >= rooms[i].x && this.x <= rooms[i].x+rooms[i].width) {
        if (this.y >= rooms[i].y && this.y <= rooms[i].y+rooms[i].height) {
          this.room = i;
        }
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
let doors = [];
let directions = ["north", "south", "east", "west"];
let player;
let startX;
let startY;


function setup() {

  createCanvas(windowWidth, windowHeight);

  createFirstRoom();
  generateRooms();
  generateDoors();
}


function draw() {

  background(220);

  if (keyIsPressed) {
    updateMovement();
    player.checkRoom();
  }

  translate(-player.x*CELLSIZE, -player.y*CELLSIZE);
  display();
}


function display() {

  for (let someCell of rooms[player.room].cells) {
      someCell.determineColor(rooms[player.room].color);
      someCell.display();
  }
  player.display();
  
}


function createFirstRoom() {

  let h = MINROOMSIZE;
  let w = MINROOMSIZE;
  let x = floor(width/CELLSIZE/2 - w/2);
  let y = floor(height/CELLSIZE/2 - h/2);

  startX = x;
  startY = y;
  player = new Player(floor(h/2) + 0.5, floor(w/2) + 0.5);

  let someRoom = new Room(0, 0, w, h);
  rooms.push(someRoom);
  someRoom.addCells();
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
}


function generateDoors() {

  for (let someRoom of rooms) {
    someRoom.spawnDoors();
  }
  
}


function mousePressed() {
  console.log(player.room);
}


function updateMovement() {

  if (keyIsDown(87)) { //w
    player.y -= player.speed;
  }
  if (keyIsDown(83)) { //s
    player.y += player.speed;
  }
  if (keyIsDown(65)) { //d
    player.x -= player.speed;
  }
  if (keyIsDown(68)) { //a
    player.x += player.speed;
  }
}