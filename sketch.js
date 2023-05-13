class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.cells = [];
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
              options.push([someCell, otherCell, "horizontal"]);
            }
            else if (someCell.x === otherCell.x && someCell.y === otherCell.y - 1) {
              options.push([someCell, otherCell, "vertical"]);
            }
          }
        }

        if (options.length > 0) {
          let chosenDoor = random(options);
          chosenDoor[0].object = "door";
          chosenDoor[1].object = "door";

          let w;
          let h; 
          let x;
          let y;
          if (chosenDoor[2] === "vertical") {
            w = 1;
            h = DOORSIZE;
            x = chosenDoor[1].x;
            y = chosenDoor[1].y - h/2;
          }
          else {
            w = DOORSIZE;
            h = 1;
            x = chosenDoor[1].x - w/2;
            y = chosenDoor[1].y;
          }

          let newDoor = new Door(x, y, w, h, chosenDoor[2]);
          doors.push(newDoor);
        }
      }
    }
  }


  addCells() {

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        
        let newCell = new Cell(x + this.x, y + this.y);

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
    if (this.object === "wall") {
      this.color = "purple";
    }
  }
}


class Door {
  constructor(x, y, w, h, orientation) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.type = orientation;
    this.color = "purple"
  }

  display() {
    fill(this.color);
    rect(this.x*CELLSIZE + width/2, this.y*CELLSIZE + height/2, this.width*CELLSIZE, this.height*CELLSIZE);
  }
}


class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.hp = 10;
    this.speed = CELLSIZE/550;
    this.size = CELLSIZE/2;
    this.currentRoom;
  }

  display() {
    fill("red");
    circle(this.x*CELLSIZE + width/2, this.y*CELLSIZE + height/2, this.size);
  }

  checkRoom() {
    
    for (let someRoom of rooms) {
      if (this.x >= someRoom.x && this.x <= someRoom.x+someRoom.width) {
        if (this.y >= someRoom.y && this.y <= someRoom.y+someRoom.height) {
          this.currentRoom = someRoom;
        }
      }
    }
  }


  checkCollisions() {

    if (this.x <= this.currentRoom.x + this.size/CELLSIZE/2) {
      this.x = this.currentRoom.x + this.size/CELLSIZE/2;
    }
    if (this.x >= this.currentRoom.x + this.currentRoom.width - this.size/CELLSIZE/2) {
      this.x = this.currentRoom.x + this.currentRoom.width - this.size/CELLSIZE/2;
    }
    if (this.y <= this.currentRoom.y + this.size/CELLSIZE/2) {
      this.y = this.currentRoom.y + this.size/CELLSIZE/2;
    }
    if (this.y >= this.currentRoom.y + this.currentRoom.height - this.size/CELLSIZE/2) {
      this.y = this.currentRoom.y + this.currentRoom.width - this.size/CELLSIZE/2;
    }
    
  }
}


const MAXROOMSIZE = 15;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 15;
const CELLSIZE = 60;
const DOORSIZE = 1/5;

let rooms = [];
let doors = [];
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

  for (let someRoom of rooms) {
    for (let someCell of someRoom.cells) {
      someCell.determineColor(someRoom.color);
      someCell.display();
    }
  }
  for (let someDoor of doors) {
    someDoor.display();
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

  player.checkRoom();
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

}


function mousePressed() {

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

  player.checkRoom();
  //player.checkCollisions();
}