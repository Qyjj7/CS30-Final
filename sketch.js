class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.cells = [];
    this.doors = [];
    this.enemies = [];
    this.cleared = false;
  }

  display() {
    fill("grey");
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height*CELLSIZE)
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

    if (player.currentRoom !== this) {

      let enemyCount = this.width*this.height/15;
      let tempCells = structuredClone(this.cells);
      for (let i = this.cells.length-1; i >= 0; i--) {
        if (this.cells[i].object !== "blank") {
          tempCells.splice(i, 1);
        }
      }
      for (let i = 0; i < enemyCount; i++) {
        let chosenCell = random(tempCells);
        let enemy = new Enemy(chosenCell.x + 0.5, chosenCell.y + 0.5);
        this.enemies.push(enemy);
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

    if (player.pos.x + player.size/2 >= this.x && player.pos.x - player.size/2 < this.x+this.width) {
      if (player.pos.y + player.size/2 >= this.y && player.pos.y - player.size/2 < this.y+this.height) {
        return true;
      }
    }
    return false;
  }
}


class Player {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.input = createVector(0, 0);
    this.knockbackDirection = createVector(0, 0);
    this.knockbackInput = 0;
    this.acceleration = 0.008;
    this.topSpeed = 0.07;
    this.hp = 50;
    this.size = 0.5;
    this.immunityFrames = 0;
    this.currentRoom;
    this.weapon;
  }

  display() {
    fill("red");
    circle(this.pos.x*CELLSIZE, this.pos.y*CELLSIZE, this.size*CELLSIZE);
  }


  updateMovement() {

    if (this.knockbackInput > 0) {
      this.vel.x -= this.knockbackInput*this.knockbackDirection.x;
      this.vel.y -= this.knockbackInput*this.knockbackDirection.y;
      this.knockbackInput -= this.acceleration;
    }

    else if (this.input.x === 0 && this.input.y === 0) {

      if (this.vel.mag() >= this.acceleration) {
        this.vel.setMag(this.vel.mag() - this.acceleration);
      }
      else {
        this.vel.set(0);
      }
    }

    else {
      this.vel.x += this.acceleration*this.input.x;
      this.vel.y += this.acceleration*this.input.y;
      this.vel = this.vel.limit(this.topSpeed);
    }

    this.pos.add(this.vel);
    this.immunityFrames --;
  }


  checkRoom() {
    
    for (let someRoom of rooms) {
      if (this.pos.x >= someRoom.x && this.pos.x <= someRoom.x+someRoom.width) {
        if (this.pos.y >= someRoom.y && this.pos.y <= someRoom.y+someRoom.height) {
          this.currentRoom = someRoom;
          this.currentRoom.cleared = true;
        }
      }
    }
  }


  checkWallCollisions() {

    let wallHere = true;
    for (let someDoor of this.currentRoom.doors) {
      if (someDoor.playerCollision()) {
        wallHere = false;
      }
    }

    if (wallHere) {
      if (this.pos.x <= this.currentRoom.x + this.size / 2) {
        this.pos.x = this.currentRoom.x + this.size / 2;
      }
      if (this.pos.x >= this.currentRoom.x + this.currentRoom.width - this.size / 2) {
        this.pos.x = this.currentRoom.x + this.currentRoom.width - this.size / 2;
      }
      if (this.pos.y <= this.currentRoom.y + this.size / 2) {
        this.pos.y = this.currentRoom.y + this.size / 2;
      }
      if (this.pos.y >= this.currentRoom.y + this.currentRoom.height - this.size / 2) {
        this.pos.y = this.currentRoom.y + this.currentRoom.height - this.size / 2;
      }
    }
  }

  checkEnemyCollisions() {

    for (let someEnemy of this.currentRoom.enemies) {
      if (! someEnemy.dead && this.pos.dist(someEnemy.pos) < this.size/2 + someEnemy.size/2) {

        this.knockbackDirection.x = someEnemy.pos.x - this.pos.x;
        this.knockbackDirection.y = someEnemy.pos.y - this.pos.y;
        this.knockbackDirection.normalize();
        round(this.knockbackDirection.x);
        round(this.knockbackDirection.y);
    
        if (this.immunityFrames <= 0) {
          this.knockbackInput = someEnemy.knockbackOutput;
          this.hp -= someEnemy.damage;
          this.immunityFrames = 10;
        }
      }
    }
  }
}


class Longsword {
  constructor() {
    this.size = 0.8;
    this.reach = 0.4;
    this.damage = 4;
    this.speed = 200;
    this.knockbackOutput = 0.03;
    this.angle = 0;
    this.pos = createVector(0, 0);
    this.input = createVector(0,0);
    this.swinging = false;
  }

  display() {
    noFill();
    if (this.swinging) {
      circle(this.pos.x*CELLSIZE, this.pos.y*CELLSIZE, this.size*CELLSIZE);
    }
    else {
      line(player.pos.x*CELLSIZE, player.pos.y*CELLSIZE, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
    }
    
  }

  updateDirection() {

    this.input.x = (mouseX - width/2);
    this.input.y = (mouseY - height/2);
    this.input.normalize();
    this.angle = atan(this.input.y/this.input.x);

    this.input.mult(this.reach);
    this.pos.x = player.pos.x + this.input.x;
    this.pos.y = player.pos.y + this.input.y;
  }

  attack() {

    for (let someEnemy of player.currentRoom.enemies) {
      if (this.pos.dist(someEnemy.pos) < this.size/2 + someEnemy.size/2) {
        someEnemy.hit(this.pos, this.knockbackOutput, this.damage);
      }
    }

    this.swinging = true;
    setTimeout(() => {
      this.swinging = false;
    }, this.speed);
  }
}


class Enemy {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.direction = createVector(0, 0);
    this.acceleration = 0.004;
    this.knockbackInput = 0;
    this.topSpeed = 0.05;
    this.knockbackOutput = 0.04;
    this.damage = 1;
    this.hp = 10;
    this.size = 0.75;
    this.dead = false;
    this.color = "black";
  }

  display() {
    fill(this.color);
    circle(this.pos.x*CELLSIZE, this.pos.y*CELLSIZE, this.size*CELLSIZE);
  }

  hit(weaponPos, strength, damage) {

    this.direction.x = weaponPos.x - this.pos.x;
    this.direction.y = weaponPos.y - this.pos.y;
    this.direction.normalize();
    round(this.direction.x);
    round(this.direction.y);

    this.knockbackInput = strength;
    this.hp -= damage;

    if (this.hp <= 0) {
      this.dead = true;
      this.color = "red";
    }
  }

  updateMovement() {
    
    if (this.knockbackInput < 0 && ! this.dead) {

      this.direction.x = player.pos.x - this.pos.x;
      this.direction.y = player.pos.y - this.pos.y;
      this.direction.normalize();
      round(this.direction.x);
      round(this.direction.y);
  
      this.vel.x += this.acceleration*this.direction.x;
      this.vel.y += this.acceleration*this.direction.y;
      this.vel.limit(this.topSpeed);
    }

    else if (this.knockbackInput < 0) {
      if (this.vel.mag() >= this.acceleration) {
        this.vel.setMag(this.vel.mag() - this.acceleration);
      }
      else {
        this.vel.set(0);
      }
    }

    else {
      this.vel.x -= this.knockbackInput*this.direction.x;
      this.vel.y -= this.knockbackInput*this.direction.y;
      this.knockbackInput -= this.acceleration;
    }

    this.pos.add(this.vel);
  }

  checkWallCollisions() {

    if (this.pos.x <= player.currentRoom.x + this.size / 2) {
      this.pos.x = player.currentRoom.x + this.size / 2;
      this.vel.x *= -1
    }
    if (this.pos.x >= player.currentRoom.x + player.currentRoom.width - this.size / 2) {
      this.pos.x = player.currentRoom.x + player.currentRoom.width - this.size / 2;
      this.vel.x *= -1
    }
    if (this.pos.y <= player.currentRoom.y + this.size / 2) {
      this.pos.y = player.currentRoom.y + this.size / 2;
      this.vel.y *= -1
    }
    if (this.pos.y >= player.currentRoom.y + player.currentRoom.height - this.size / 2) {
      this.pos.y = player.currentRoom.y + player.currentRoom.height - this.size / 2;
      this.vel.y *= -1
    }
  }

  checkEnemyCollisions() {

    for (let someEnemy of player.currentRoom.enemies) {
      if (someEnemy === this) {
        return false;
      }
      else if (this.pos.dist(someEnemy.pos) < this.size/2 + someEnemy.size/2) {
        return true;
      }
    }
  }
}


const MAXROOMSIZE = 13;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 10;
const CELLSIZE = 60;
const DOORSIZE = 1/5;

let rooms = [];
let doors = [];
let directions = ["north", "south", "east", "west"];
let player;
let totalFrames = 0;
let frames = 0;

let swingImage;


function preload() {
  swingImage = loadImage("sword_swing.png");
}

function setup() {

  createCanvas(windowWidth, windowHeight);

  createFirstRoom();
  setInterval(showFrames, 1000);
  generateRooms();
}


function draw() {

  background(220);
  translate(-player.pos.x*CELLSIZE + width/2, -player.pos.y*CELLSIZE + height/2);

  playerInput();

  player.updateMovement();
  player.checkRoom();
  player.checkEnemyCollisions();
  player.checkWallCollisions();
  player.weapon.updateDirection();

  for (let someEnemy of player.currentRoom.enemies) {
    someEnemy.updateMovement();
    someEnemy.checkWallCollisions();
  }
  display();
}


function display() {

  for (let someRoom of rooms) {
    if (someRoom.cleared) {
      someRoom.display();
      for (let someDoor of someRoom.doors) {
        someDoor.display();
      }
    }
  }

  for (let someCell of player.currentRoom.cells) {
    someCell.display();
  }
  for (let someDoor of player.currentRoom.doors) {
    someDoor.display();
  }
  for (let someEnemy of player.currentRoom.enemies) {
    someEnemy.display();
  }

  player.display();
  player.weapon.display();

  push();
  //translate(player.pos.x*CELLSIZE - width/2, player.pos.y*CELLSIZE - height/2);
  fill("black");

  textSize(30);
  text("FPS: " + frames, 20, 100)

  textSize(50);
  text("Health: " + player.hp, 20, 50)
  pop();
}


function showFrames() {

  frames = frameCount;
  frames -= totalFrames;
  totalFrames = frameCount;
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

}


function playerInput() {

  player.input.x = int(keyIsDown(68)) - int(keyIsDown(65))
  player.input.y = int(keyIsDown(83)) - int(keyIsDown(87)) 

  if (mouseIsPressed && ! player.weapon.swinging) {
    player.weapon.attack();
  }
}