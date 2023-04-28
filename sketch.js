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
  }


  display() {
    fill(this.color);
    rect(this.x*cellSize, this.y*cellSize, this.width*cellSize, this.height* cellSize);
  }


  includedCells(radius) {
    // returns the array of index values for all cells that makeup this room
    let theseCells = [];

    for (let y = this.y-radius; y <= this.y+this.height+radius-1; y++) {
      for (let x = this.x-radius; x <= this.x+this.width+radius-1; x++) {

        for (let someCell of cells) {
          if (someCell.x === x && someCell.y === y) {
            theseCells.push(someCell);
          }
        }
      }
    }
    return theseCells;
  }


  adjustPosition(otherRoom) {
    let directionsTried = [];
    let spawningSide = random(directions);
    
    if (spawningSide === "north") {
      this.y -= (this.height+1);
    }
    if (spawningSide === "south") {
      this.y += (otherRoom.height+1);
    }
    if (spawningSide === "east") {
      this.x += (otherRoom.width+1);
    }
    if (spawningSide === "west") {
      this.x -= (this.width+1);
    }
  }


  positionValid() {
    // returns false if room spawns overlapping another room
    // or room spawns outside of grid
    // only works before this room is pushed to rooms array
    for (let otherRoom of rooms) {
      for (let someCell of this.includedCells(0)) {
        if (otherRoom.includedCells(1).includes(someCell)) {
          return false;
        }
      }
    }
    return this.includedCells(0).length === this.width*this.height;
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill("white");
    rect(this.x*cellSize, this.y*cellSize, cellSize, cellSize);
  }
}


const MAXROOMSIZE = 5;
const MINROOMSIZE = 2;

let rows = 20;
let cols = 20; 
let cells = [];
let rooms = [];
let directions = ["north", "south", "east", "west"];
let cellSize;


function setup() {
  createCanvas(windowWidth, windowHeight);

  cellSize = height/rows;

  createFirstRoom();
}


function draw() {
  background(220);
  display();
}


function display() {
  for (let someCell of cells) {
    someCell.display();
  }
  for (let someRoom of rooms) {
    someRoom.display();
  }
}


function createFirstRoom() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x ++) {
      cells.push(new Cell(x, y));
    }
  }

  let h = MINROOMSIZE;
  let w = MINROOMSIZE;
  let x = floor(cols/2 - w/2);
  let y = floor(rows/2 - h/2);

  let someRoom = new Room(x, y, w, h);
  rooms.push(someRoom);
}


function createRoom() {
  let otherRoom = random(rooms);
  let h = floor(random(MINROOMSIZE, MAXROOMSIZE));
  let w = floor(random(MINROOMSIZE, MAXROOMSIZE));
  let x = otherRoom.x;
  let y = otherRoom.y;

  let someRoom = new Room(x, y, w, h);
  someRoom.adjustPosition(otherRoom);

   if (someRoom.positionValid()) {
    rooms.push(someRoom);
  }
  else {
    createRoom();
  }
  
}


function mousePressed() {
  createRoom();
}


function keyPressed() {
  console.log(rooms[0].includedCells(1))
}