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
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height* CELLSIZE);
  }


  includedCells(radius) {

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
}


class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  display() {
    fill("white");
    rect(this.x*CELLSIZE, this.y*CELLSIZE, CELLSIZE, CELLSIZE);
  }
}


const MAXROOMSIZE = 6;
const MINROOMSIZE = 2;
const ROOMQUANTITY = 30;
const CELLSIZE = 20;

let cells = [];
let rooms = [];
let directions = ["north", "south", "east", "west"];


function setup() {

  createCanvas(windowWidth, windowHeight);

  createFirstRoom();
  generateRooms();
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

  let h = MINROOMSIZE;
  let w = MINROOMSIZE;
  let x = floor(width/CELLSIZE/2 - w/2);
  let y = floor(height/CELLSIZE/2 - h/2);

  let someRoom = new Room(x, y, w, h);
  rooms.push(someRoom);
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
      let newRoom = someRoom.createNeighbor(x, y, w, h)
  
      if (! newRoom.positionValid()) {
        for (let i = 0; i < validRooms.length; i++) {
          validRooms.splice(i, 1);
        }
      }
      else {
        rooms.push(newRoom);
        break;
      }
    }
  }
}


function mousePressed() {
  generateRooms();
}


function keyPressed() {
  console.log(rooms[0].includedCells(1));
}