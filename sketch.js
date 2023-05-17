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
          this.doors.push(newDoor);
          otherRoom.doors.push(newDoor);
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


  populate() {

    let enemyCount = this.width*this.height/8;

    for (let i = 0; i < enemyCount; i++) {
      console.log("spawn enemy");
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
    rect(this.x*CELLSIZE, this.y*CELLSIZE, CELLSIZE, CELLSIZE);
  }

  determineColor(color) {
    this.color = color;
  }
}


class Door {
  constructor(x, y, w, h, orientation) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.type = orientation;
    this.color = "purple";
  }

  display() {
    fill(this.color);
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height*CELLSIZE);
  }

  playerCollision() {

    if (player.x + player.size/CELLSIZE/2 >= this.x && player.x - player.size/CELLSIZE/2 < this.x+this.width) {
      if (player.y + player.size/CELLSIZE/2 >= this.y && player.y - player.size/CELLSIZE/2 < this.y+this.height) {
        return true;
      }
    }
    return false;
  }
}


class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.dx = 0;
    this.dy = 0;
    this.acceleration = 0.015;
    this.topSpeed = 0.05;
    this.notMoving = true;
    this.hp = 10;
    this.size = CELLSIZE/2;
    this.currentRoom;
    this.weapon;
  }

  display() {
    fill("red");
    circle(this.x*CELLSIZE, this.y*CELLSIZE, this.size);
  }

  updateMovement() {
    if (abs(this.dy) < this.acceleration) {
      this.dy = 0;
    }
    if (abs(this.dx) < this.acceleration) {
      this.dx = 0;
    }
    this.y += this.dy;
    this.x += this.dx;
  }

  stopMoving(axis) {

    if (axis === "y") {
      if (this.dy > 0) {
        this.dy -= this.acceleration;
      }
      if (this.dy < 0) {
        this.dy += this.acceleration;
      }
    }

    if (axis === "x") {
      if (this.dx > 0) {
        this.dx -= this.acceleration;
      }
      if (this.dx < 0) {
        this.dx += this.acceleration;
      }
    }
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


  checkWallCollisions() {

    let walls = true;
    for (let someDoor of this.currentRoom.doors) {
      if (someDoor.playerCollision()) {
        walls = false;
      }
    }

    if (walls) {
      if (this.x <= this.currentRoom.x + this.size / CELLSIZE / 2) {
        this.x = this.currentRoom.x + this.size / CELLSIZE / 2;
      }
      if (this.x >= this.currentRoom.x + this.currentRoom.width - this.size / CELLSIZE / 2) {
        this.x = this.currentRoom.x + this.currentRoom.width - this.size / CELLSIZE / 2;
      }
      if (this.y <= this.currentRoom.y + this.size / CELLSIZE / 2) {
        this.y = this.currentRoom.y + this.size / CELLSIZE / 2;
      }
      if (this.y >= this.currentRoom.y + this.currentRoom.height - this.size / CELLSIZE / 2) {
        this.y = this.currentRoom.y + this.currentRoom.height - this.size / CELLSIZE / 2;
      }
    }
  }
}


class Longsword {
  constructor() {
    this.width = 1.2;
    this.height = 0.8;
    this.swingX;
    this.swingY;
    this.swinging = false;
  }

  display() {
    noFill();
    if (this.swinging) {
      rect(this.swingX*CELLSIZE, this.swingY*CELLSIZE, this.swingWidth*CELLSIZE, this.swingHeight*CELLSIZE);
    }
  }

  attack(direction) {

    console.log("SWING!");
    if (direction === "north") {
      this.swingX = player.x - this.width/2;
      this.swingY = player.y - this.height;
      this.swingWidth = this.width;
      this.swingHeight = this.height;
    }

    if (direction === "south") {
      this.swingX = player.x - this.width/2;
      this.swingY = player.y;
      this.swingWidth = this.width;
      this.swingHeight = this.height;
    }

    if (direction === "east") {
      this.swingX = player.x;
      this.swingY = player.y - this.width/2;
      this.swingWidth = this.height;
      this.swingHeight = this.width;
    }

    if (direction === "west") {
      this.swingX = player.x - this.height;
      this.swingY = player.y - this.width/2;
      this.swingWidth = this.height;
      this.swingHeight = this.width;
    }

    this.swinging = true;
    setTimeout(() => {
      this.swinging = false;
    }, 600);
  }
}


class Enemy {
  constructor(x, y, room) {
    this.x = x;
    this.y = y;
    this.room = room;
  }

  display() {
    fill("black");
    circle(this.x*CELLSIZE, this.y*CELLSIZE, this.size);
  }
}


const MAXROOMSIZE = 13;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 15;
const CELLSIZE = 60;
const DOORSIZE = 1/5;

let rooms = [];
let doors = [];
let directions = ["north", "south", "east", "west"];
let player;
let deltaMillis = 0;


function setup() {

  createCanvas(windowWidth, windowHeight);

  createFirstRoom();
  generateRooms();
}


function draw() {

  background(220);

  playerInput();

  player.updateMovement();

  player.checkRoom();
  player.checkWallCollisions();

  translate(-player.x*CELLSIZE + width/2, -player.y*CELLSIZE + height/2);
  display();
}


function display() {
  //player.currentRoom
  for (let someCell of player.currentRoom.cells) {
    //someCell.determineColor(player.currentRoom.color);
    someCell.display();
  }
  for (let someDoor of player.currentRoom.doors) {
    someDoor.display();
  }

  player.display();
  player.weapon.display();
}


function createFirstRoom() {

  let h = MINROOMSIZE;
  let w = MINROOMSIZE;
  
  player = new Player(floor(h/2) + 0.5, floor(w/2) + 0.5);

  let someRoom = new Room(0, 0, w, h);
  rooms.push(someRoom);
  someRoom.addCells();

  player.checkRoom();
  player.weapon = new Longsword();
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
    someRoom.populate();
  }
}


function mousePressed() {

  if (keyIsDown(49)) {
    player.y -= 2;
  }
  if (keyIsDown(50)) {
    player.y += 2;
  }
  if (keyIsDown(51)) {
    player.x += 2;
  }
  if (keyIsDown(52)) {
    player.x -= 2;
  }

  player.weapon.attack("south");
}


function playerInput() {

  if (keyIsDown(87) || keyIsDown(83)) {
    if (keyIsDown(87) && player.dy > -player.topSpeed) { //w
      player.dy -= player.acceleration;
    }
    if (keyIsDown(83) && player.dy < player.topSpeed) { //s
      player.dy += player.acceleration;
    }
  }
  else {
    player.stopMoving("y");
  }

  if (keyIsDown(65) || keyIsDown(68)) {
    if (keyIsDown(65) && player.dx > -player.topSpeed) { //d
      player.dx -= player.acceleration;
    }
    if (keyIsDown(68) && player.dx < player.topSpeed) { //a
      player.dx += player.acceleration;
    }
  }
  else {
    player.stopMoving("x");
  }
  

  if (! player.weapon.swinging) {

    if (keyIsDown(38)) { //up
      player.weapon.attack("north");
    }
    else if (keyIsDown(40)) { //down
      player.weapon.attack("south");
    }
    else if (keyIsDown(37)) { //left
      player.weapon.attack("west");
    }
    else if (keyIsDown(39)) { //right
      player.weapon.attack("east");
    }
  }
}