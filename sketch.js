// Project Title
// Your Name
// Description


class Room {
  constructor() {
    this.width = 0;
    this.height = 0;
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}


let rows = 10;
let cols = 10; 
let cells = [];
let cellSize;


function setup() {
  createCanvas(windowWidth, windowHeight);

  cellSize = height/rows;
  createGrid(rows, cols);
}

function draw() {
  background(220);
  display();
}

function display() {
  for (let someCell of cells) {
    rect(someCell.x*cellSize, someCell.y*cellSize, cellSize, cellSize);
  }
}

function createGrid(rows, cols) {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x ++) {
      cells.push(new Cell(x, y));
    }
  }
}
