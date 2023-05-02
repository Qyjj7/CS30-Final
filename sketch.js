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
  }


  display() {
    fill(this.color);
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height* CELLSIZE);
  }


  createNeighbor(x, y, w, h) {

    let newRoom = new Room(x, y, w, h);

    let spawningSide = random(directions);
    
    if (spawningSide === "north") {
      newRoom.y -= newRoom.height+1;
      newRoom.x += floor(random(-newRoom.width+1, this.width-1));
    }
    if (spawningSide === "south") {
      newRoom.y += this.height+1;
      newRoom.x += floor(random(-newRoom.width+1, this.width-1));
    }
    if (spawningSide === "east") {
      newRoom.x += this.width+1;
      newRoom.y += floor(random(-newRoom.height+1, this.height-1));
    }
    if (spawningSide === "west") {
      newRoom.x -= newRoom.width+1;
      newRoom.y += floor(random(-newRoom.height+1, this.height-1));
    } 
    return newRoom;
  }


  positionValid() {

    let roomA = [];
    for (let y = this.y-1; y < this.y+this.height; y++) {
      for (let x = this.x-1; x < this.x+this.width; x++) {
        roomA.push(new Cell(x, y));
      }
    }

    for (let otherRoom of rooms) {

      let roomB = [];
      for (let y = otherRoom.y-1; y < otherRoom.y+otherRoom.height; y++) {
        for (let x = otherRoom.x-1; x < otherRoom.x+otherRoom.width; x++) {
          roomB.push(new Cell(x, y));
        }
      }

      for (let i = 0; i < roomA.length; i++) {
        for (let j = 0; j < roomB.length; j++) {
          if (roomA[i].x === roomB[j].x && roomA[i].y === roomB[j].y) {
            return false;
          }
        }
      }
    }
    return true;
  }


  spawnDoors() {

    for (let direction of directions) {
      let options = [];

      if (direction === "north") {
        for (let i = this.x; i < this.x+this.width; i++) {
          for (let someCell of cells) {

            if (someCell.x === i && someCell.y === this.y-2 && someCell.object === "blank") {
              let newCell = new Cell(i, this.y-1);
              newCell.object = "door";
              options.push(newCell);
            }
          }
        }
      }
      if (direction === "south") {
        for (let i = this.x; i < this.x+this.width; i++) {
          for (let someCell of cells) {

            if (someCell.x === i && someCell.y === this.y+this.height+1 && someCell.object === "blank") {              
              let newCell = new Cell(i, this.y+this.height);
              newCell.object = "door";
              options.push(newCell);
            }
          }
        }
      }
      if (direction === "east") {
        for (let i = this.y; i < this.y+this.height; i++) {
          for (let someCell of cells) {
    
            if (someCell.y === i && someCell.x === this.x+this.width+1 && someCell.object === "blank") {
              let newCell = new Cell(this.x+this.width, i);
              newCell.object = "door";
              options.push(newCell);
            }
          }
        }
      }
      if (direction === "west") {
        for (let i = this.y; i < this.y+this.height; i++) {
          for (let someCell of cells) {

            if (someCell.y === i && someCell.x === this.x-2 && someCell.object === "blank") {             
              let newCell = new Cell(this.x-1, i);
              newCell.object = "door";
              options.push(newCell);
            }
          }
        }
      }
      if (options.length > 0) {
        let newCell = random(options);
        cells.push(newCell);
      }
    }
  }


  addCells() {

    for (let y = this.y; y < this.y+this.height; y++) {
      for (let x = this.x; x < this.x+this.width; x++) {
        let newCell = new Cell(x, y);
        this.cells.push(newCell);
        cells.push(newCell);
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
    rect((this.x-startX)*CELLSIZE, (this.y-startY)*CELLSIZE, CELLSIZE, CELLSIZE);
  }


  determineColor() {
    if (this.object === "door") {
      this.color = "black";
    }
  }


  adjacentCells() {

    let theseCells = [];
    for (let someCell of cells) {
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
  }

  display() {
    fill("red");
    square((startX-this.x)*CELLSIZE, (startY-this.y)*CELLSIZE, CELLSIZE);
  }
}


const MAXROOMSIZE = 6;
const MINROOMSIZE = 2;
const ROOMQUANTITY = 30;
const CELLSIZE = 20;

let cells = [];
let rooms = [];
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
  translate(player.x*CELLSIZE, player.y*CELLSIZE);
  display();
}


function display() {

  for (let someCell of cells) {
    someCell.determineColor();
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
  player = new Player(x, y);

  let someRoom = new Room(x, y, w, h);
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
  for (let i = cells.length-1; i > 0; i--) {
    let adjacentCells = cells[i].adjacentCells();
    for (let someCell of adjacentCells) {
      if (someCell.object === "door" && cells[i].object === "door") {
        cells.splice(i, 1);
      }
    }
  }
}


function mousePressed() {
  
}


function keyPressed() {

  for (let someCell of cells) {
    if (someCell.x === player.x && someCell.y === player.y) {
      let current = someCell.adjacentCells();
    }
  }

  if (key === "w") {
    for (let someCell of cells) {
      if (someCell.y === player.y+1) {
        player.y ++;
      }
    }
  
  }
  if (key === "s") {
    player.y --;
  }
  if (key === "a") {
    player.x ++;
  }
  if (key === "d") {
    player.x --;
  }
}