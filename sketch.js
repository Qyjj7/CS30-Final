// Project Title
// Your Name
// Description


class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.top = y;
    this.bottom = y-h;
    this.left = x;
    this.right = x+w;
  }

  display() {
    fill("black");
    rect(this.x*cellSize, this.y*cellSize, this.width*cellSize, this.height* cellSize);
  }

  includedCells() {
    let theseCells = [];
    // Doesn't yet work
    for (let i = this.y; i <= this.bottom; i++) {
      for (let j = this.x; j <= this.right; j++) {
        theseCells[i].push(j); 
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


let rows = 30;
let cols = 30; 
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
  let height = int(random(3, 7));
  let width = int(random(3, 7));
  let someCell = random(cells);
  let x = someCell.x;
  let y = someCell.y;
  let someRoom = new Room(x, y, width, height);
  rooms.push(someRoom);
  console.log(someRoom.includedCells());
}


function mousePressed() {
  createRoom();
}