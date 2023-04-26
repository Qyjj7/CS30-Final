// Project Title
// Your Name
// Description


class Room {
  constructor(x, y, w, h) {
    this.width = w+1;
    this.height = h+1;
    this.x = x;
    this.y = y;
    this.top = y;
    this.bottom = y+h;
    this.left = x;
    this.right = x+w;
  }

  display() {
    fill("black");
    rect(this.x*cellSize, this.y*cellSize, this.width*cellSize, this.height* cellSize);
  }

  includedCells() {
    // returns the array of index values for all cells that makeup this room
    let theseCells = [];

    for (let y = this.y; y <= this.bottom; y++) {
      for (let x = this.x; x <= this.right; x++) {

        for (let someCell of cells) {
          if (someCell.x === x && someCell.y === y) {
            theseCells.push(someCell);
          }
        }
      }
    }
    return theseCells;
  }

  adjustPosition(direction, magnitude) {
    if (direction === "north") {
      this.y -= magnitude;
      this.top -= magnitude;
      this.bottom -= magnitude;
    }
    if (direction === "south") {
      this.y += magnitude;
      this.top += magnitude;
      this.bottom += magnitude;
    }
    if (direction === "east") {
      this.x += magnitude;
      this.left += magnitude;
      this.right += magnitude;
    }
    if (direction === "west") {
      this.x -= magnitude;
      this.left -= magnitude;
      this.right -= magnitude;
    }
  }

  positionValid() {
    // returns false if room spawns overlapping another room
    // only works before this room is pushed to rooms array
    for (let otherRoom of rooms) {
      for (let someCell of this.includedCells()) {
        if (otherRoom.includedCells().includes(someCell)) {
          return false;
        }
      }
    }
    return true;
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


const MAXROOMSIZE = 4;
const MINROOMSIZE = 1;

let rows = 20;
let cols = 20; 
let cells = [];
let rooms = [];
let cellSize;


function setup() {
  createCanvas(windowWidth, windowHeight);

  cellSize = height/rows;
  createGrid();
  createRoom();
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


function createGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x ++) {
      cells.push(new Cell(x, y));
    }
  }
}


function createRoom() {
  let height = floor(random(MINROOMSIZE, MAXROOMSIZE));
  let width = floor(random(MINROOMSIZE, MAXROOMSIZE));

  let someCell = random(cells);
  let x = someCell.x;
  let y = someCell.y;
  
  let someRoom = new Room(x, y, width, height);
  console.log(someRoom.positionValid());

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