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
            theseCells.push(someCell)
          }
        }
      }
    }
    return theseCells;
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


let rows = 10;
let cols = 10; 
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
  let height = floor(random(0, 2));
  let width = floor(random(0, 2));

  let someCell = random(cells);
  let x = someCell.x;
  let y = someCell.y;
  
  let someRoom = new Room(x, y, width, height);
  rooms.push(someRoom);
}


function mousePressed() {
  createRoom();
}