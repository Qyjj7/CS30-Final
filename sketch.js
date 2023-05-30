class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.cells = [];
    this.doors = [];
    this.entities = [];
    this.cleared = false;
  }

  display() {
    fill("grey");
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height*CELLSIZE);
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

  spawnStairs() {

    while (this.cells.length > 0) {
      let chosenCell = random(this.cells);
      if (chosenCell.object === "blank") {

        let stairs = new Door(chosenCell.x, chosenCell.y, 1, 1, "staircase");
        this.doors.push(stairs);
        break;
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

    if (rooms[0] !== this) {

      let enemyCount = this.width*this.height/15;
      let tempCells = structuredClone(this.cells);
      for (let i = this.cells.length-1; i >= 0; i--) {
        if (this.cells[i].object !== "blank") {
          tempCells.splice(i, 1);
        }
      }
      for (let i = 0; i < enemyCount; i++) {
        let chosenCell = random(tempCells);
        this.determineEnemyStats(chosenCell);
      }
    }
  }

  determineEnemyStats(cell) {

    let number = random(0, 100);
    let enemyType;
    if (number >= 0 && number < 25) {
      enemyType = "ranged";
    }
    else {
      enemyType = "melee";
    }

    if (enemyType === "melee") {

      let xPos = cell.x + 0.5;
      let yPos = cell.y + 0.5;
      let acc = 0.004;
      let topSpeed = 0.05;
      let hp = 10;
      let size = 1.4;
      let room = this;
      hp += hp*level/5;
      let enemy = new Entity(xPos, yPos, acc, topSpeed, hp, size, room, meleeEnemyImage);
      this.entities.push(enemy);

      let diameter = 0.8;
      let reach = 0.4;
      let dmg = 1;
      let speed = 200;
      let kb = 0.2;
      let owner = enemy;
      dmg += dmg*level/5;
      enemy.weapon = new Longsword(diameter, reach, dmg, speed, kb, owner, swingImage);
    }

    else if (enemyType === "ranged") {

      let xPos = cell.x + 0.5;
      let yPos = cell.y + 0.5;
      let acc = 0.004;
      let topSpeed = 0.05;
      let hp = 4;
      let size = 0.8;
      let room = this;
      let enemy = new Entity(xPos, yPos, acc, topSpeed, hp, size, room, meleeEnemyImage);
      this.entities.push(enemy);

      let diameter = 0.6;
      let reach = 5;
      let dmg = 3;
      let speed = 0.06;
      let kb = 0.2;
      let owner = enemy;
      dmg += dmg*level/5;
      enemy.weapon = new Wand(diameter, reach, dmg, speed, kb, owner, projectileImage);
    }
  }
}

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.object = "blank";
    this.color = color(113, 92, 72);
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

class Entity {
  constructor(x, y, acc, topSpeed, hp, size, room, sprite) {
    this.pos = createVector(x, y);
    this.acceleration = acc;
    this.topSpeed = topSpeed;
    this.hp = hp;
    this.size = size;
    this.currentRoom = room;
    this.sprite = sprite;
    this.vel = createVector(0, 0);
    this.direction = createVector(0, 0);
    this.immunityFrames = 0;
    this.rotation = 0;
    this.knocked = false;
    this.dead = false;
    this.onStairs = false;
    this.weapon;
  }

  display() {
    this.sprite.width = this.size*CELLSIZE;
    this.sprite.height = this.size*CELLSIZE;
    push();
    myRotate(this, this.rotation);
    image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
    pop();
  }

  handleStuff() {

    if (this === player) {
      this.updateMovement();
      this.checkRoom();
      this.checkCollisions();
      this.weapon.handleStuff();
    }
    else {
      this.seekPlayer();
      this.updateMovement();
      this.checkCollisions();
      this.weapon.handleStuff();
    }
  }

  seekPlayer() {
    this.direction.set(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
    this.direction.normalize();
    
    if (player.dead || this.dead || this.weapon.winding || this.weapon.withinRange()) {
      this.direction.set(0, 0);
    }
  }
  
  updateMovement() {

    if (this.direction.x === 0 && this.direction.y === 0) {
      if (this.vel.mag() >= this.acceleration) {
        this.vel.setMag(this.vel.mag() - this.acceleration);
      }
      else {
        this.vel.set(0);
      }
    }

    else {
      this.vel.x += this.acceleration*this.direction.x;
      this.vel.y += this.acceleration*this.direction.y;
      this.vel = this.vel.limit(this.topSpeed);
    }

    if (! this.dead && this.rotation > 0) {
      this.rotation -= PI/16;
    }
    else if (this.rotation > PI) {
      this.rotation -= PI/16;
    }

    this.pos.add(this.vel);
    this.immunityFrames --;
  }


  checkRoom() {
    
    for (let someRoom of rooms) {
      if (this.pos.x >= someRoom.x && this.pos.x <= someRoom.x+someRoom.width) {
        if (this.pos.y >= someRoom.y && this.pos.y <= someRoom.y+someRoom.height) {
          if (this.currentRoom !== someRoom) {
            this.immunityFrames = 25;
            this.currentRoom = someRoom;
            this.currentRoom.cleared = true;
          }
        }
      }
    }
  }


  checkCollisions() {

    let wallHere = true;
    for (let someDoor of this.currentRoom.doors) {
      if (someDoor.playerCollision() && someDoor.type !== "staircase") {
        wallHere = false;
        this.onStairs = false;
      }
      else if (this === player && someDoor.playerCollision()) {
        this.onStairs = true;
      }
      else {
        this.onStairs = false;
      }
    }

    if (wallHere) {
      if (this.pos.x <= player.currentRoom.x + this.size / 2) {
        this.pos.x = player.currentRoom.x + this.size / 2;
        this.vel.x *= -1;
      }
      if (this.pos.x >= player.currentRoom.x + player.currentRoom.width - this.size / 2) {
        this.pos.x = player.currentRoom.x + player.currentRoom.width - this.size / 2;
        this.vel.x *= -1;
      }
      if (this.pos.y <= player.currentRoom.y + player.size / 2) {
        this.pos.y = player.currentRoom.y + player.size / 2;
        this.vel.y *= -1;
      }
      if (this.pos.y >= player.currentRoom.y + player.currentRoom.height - this.size / 2) {
        this.pos.y = player.currentRoom.y + player.currentRoom.height - this.size / 2;
        this.vel.y *= -1;
      }
    }
  }

  getHit(weapon) {

    if (this.immunityFrames <= 0) {

      this.direction.set(weapon.direction.x, weapon.direction.y);
      this.direction.normalize();
      this.vel.set(weapon.knockback * this.direction.x, weapon.knockback * this.direction.y);

      this.knocked = true;
      this.hp -= weapon.damage;
      this.rotation = 2*PI;
      this.immunityFrames = 15;

      if (this.hp <= 0) {
        this.dead = true;
        this.color = "red";
      }

      setTimeout(() => {
        this.knocked = false;
      }, weapon.knockbackTime);
    }
  }
}

class Longsword {
  constructor(diameter, reach, dmg, speed, kb, owner, sprite) {
    this.name = "longsword";
    this.size = diameter;
    this.reach = reach;
    this.maxRange = diameter/2 + reach;
    this.damage = dmg;
    this.speed = speed;
    this.knockback = kb;
    this.owner = owner;
    this.sprite = sprite;
    this.knockbackTime = 300;
    this.windTime = 250;
    this.rotation = 0;
    this.pos = createVector(0, 0);
    this.direction = createVector(0,0);
    this.swinging = false;
    this.winding = false;
  }

  display() {
    if (this.swinging || this.winding) {
      this.sprite.width = this.size*CELLSIZE;
      this.sprite.height = this.size*CELLSIZE;
      push();
      myRotate(this, this.rotation + HALF_PI);
      image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
      pop();
    }
  }

  handleStuff() {

    if(! player.dead) {
      this.updateDirection();
      if (this.owner !== player && ! this.owner.dead && this.withinRange()) {
        this.winding = true;
  
        setTimeout(() => {
          this.winding = false;
          this.attack();
        }, this.windTime);
      }
    }
  }

  withinRange() {
    return ! this.dead && this.owner.pos.dist(player.pos) < this.maxRange + player.size/2;
  }

  updateDirection() {

    if (this === player.weapon) {
      this.direction.set(mouseX - width/2, mouseY - height/2);
    }
    else if (! this.winding) {
      this.direction.set(player.pos.x - this.owner.pos.x, player.pos.y - this.owner.pos.y);
    }

    this.direction.normalize();

    this.rotation = myGetAngle(this.owner, this.direction.x, this.direction.y);
    this.direction.mult(this.reach);
    this.pos.set(this.owner.pos.x + this.direction.x, this.owner.pos.y + this.direction.y);
  }

  attack() {

    if (! this.swinging) {

      if (this === player.weapon) {
        for (let someEntity of player.currentRoom.entities) {
          if (this.pos.dist(someEntity.pos) < this.size/2 + someEntity.size/2) {
            someEntity.getHit(this);
          }
        }
      }
      else {
        if (this.pos.dist(player.pos) < this.size/2 + player.size/2) {
          player.getHit(this);
        }
      }
  
      this.swinging = true;
      setTimeout(() => {
        this.swinging = false;
      }, this.speed);
    }
  }
}

class Wand {
  constructor(diameter, reach, dmg, speed, kb, owner, sprite) {
    this.name = "wand";
    this.size = diameter;
    this.maxRange = reach;
    this.damage = dmg;
    this.speed = speed;
    this.knockback = kb;
    this.owner = owner;
    this.sprite = sprite;
    this.knockbackTime = 300;
    this.windTime = 2000;
    this.rotation = 0;
    this.pos = createVector(owner.pos.x, owner.pos.y);
    this.direction = createVector(0,0);
    this.swinging = false;
    this.winding = false;
  }

  display() {
    if (this.swinging) {
      imageMode(CENTER);
      this.sprite.width = this.size*CELLSIZE;
      this.sprite.height = this.size*CELLSIZE;
      push();
      myRotate(this, this.rotation);
      image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
      pop();
    }
  }

  handleStuff() {

    if (this.withinRange() && ! this.owner.dead && ! player.dead && ! this.swinging && ! this.winding) {

      this.updateDirection();
      this.swinging = true;
    }
    this.checkCollisions();
    this.updateMovement();
  }

  withinRange() {
    return ! this.dead && this.owner.pos.dist(player.pos) < this.maxRange + player.size/2;
  }

  updateDirection() {
    this.direction.set(player.pos.x - this.owner.pos.x, player.pos.y - this.owner.pos.y);
    this.direction.normalize();
  }

  updateMovement() {

    if (this.swinging) {
      this.pos.x += this.speed*this.direction.x;
      this.pos.y += this.speed*this.direction.y;
      this.rotation += PI/16;
    }
    else {
      this.pos.set(this.owner.pos.x, this.owner.pos.y);
    }
  }

  checkCollisions() {

    let collision = false;

    if (this.pos.x <= player.currentRoom.x + this.size / 2) {
      collision = true;
    }
    if (this.pos.x >= player.currentRoom.x + player.currentRoom.width - this.size / 2) {
      collision = true;
    }
    if (this.pos.y <= player.currentRoom.y + player.size / 2) {
      collision = true;
    }
    if (this.pos.y >= player.currentRoom.y + player.currentRoom.height - this.size / 2) {
      collision = true;
    }

    if (this.swinging && this.pos.dist(player.pos) < this.size/2 + player.size/2) {
      collision = true;
      player.getHit(this);
    }

    if (collision) {
      this.winding = true;
      this.swinging = false;
      this.rotation = 0;

      setTimeout(() => {
        this.winding = false;
      }, this.windTime);
    }
  }
}


const MAXROOMSIZE = 13;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 10;
const CELLSIZE = 100;
const DOORSIZE = 1/5;

let rooms = [];
let directions = ["north", "south", "east", "west"];
let player;
let paused = false;
let theseFrames = 0;
let displayedFrames = 0;
let level = 0;

let meleeEnemyImage;
let projectileImage;
let swingImage;


function preload() {
  meleeEnemyImage = loadImage("assets/melee_enemy.png");
  projectileImage = loadImage("assets/tomatobigger.png");
  swingImage = loadImage("assets/swing.png");
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);

  setInterval(() => {
    displayedFrames = theseFrames;
    theseFrames = 0;
  }, 1000);

  createFirstRoom();
  createPlayer();
  generateRooms();
}

function draw() {
  
  background(220);
  theseFrames ++;

  if (!paused) {
    playerInput();
    player.handleStuff();
    for (let someEntity of player.currentRoom.entities) {
      someEntity.handleStuff();
    }
  }

  push();
  translate(-player.pos.x*CELLSIZE + width/2, -player.pos.y*CELLSIZE + height/2);
  display();
  pop();
  displayInterface();
}

function display() {
  for (let someRoom of rooms) {
    if (someRoom.cleared) {
      someRoom.display();
    }
  }
  for (let someCell of player.currentRoom.cells) {
    someCell.display();
  }
  for (let someDoor of player.currentRoom.doors) {
    someDoor.display();
  }
  for (let someEnemy of player.currentRoom.entities) {
    someEnemy.display();
    someEnemy.weapon.display();
  }

  player.display();
  player.weapon.display();
}

function displayInterface() {
  fill("black");

  textSize(30);
  textAlign(LEFT);
  text("FPS: " + displayedFrames, 20, 100);
  text("Level: " + level, 20, 150);

  textSize(50);
  textAlign(LEFT);
  text("Health: " + player.hp.toFixed(1), 20, 50);

  textSize(20);
  textAlign(RIGHT);
  text("Press Space to Pause Game", width-20, 25);

  if (player.onStairs && ! player.dead) {
    textSize(15);
    textAlign(CENTER);
    text("Press F to Descend", width/2, height/2 + CELLSIZE/2);
  }

  if (player.dead) {
    textSize(50);
    textAlign(CENTER);
    text("Game Over", width/2, height/2 - CELLSIZE);
    text("Press F to Restart", width/2, height/2 + CELLSIZE);
  }
}

function createPlayer() {

  let x = floor(MINROOMSIZE/2) + 0.5;
  let y = floor(MINROOMSIZE/2) + 0.5;
  let acc = 0.008;
  let topSpeed = 0.07;
  let hp = 25;
  let size = 1;

  player = new Entity(x, y, acc, topSpeed, hp, size, rooms[0], meleeEnemyImage);

  let diameter = 1;
  let reach = 0.4;
  let dmg = 4;
  let speed = 200;
  let kb = 0.15;
  let owner = player;

  player.weapon = new Longsword(diameter, reach, dmg, speed, kb, owner, swingImage);
}

function createFirstRoom() {

  let someRoom = new Room(0, 0, MINROOMSIZE, MINROOMSIZE);
  rooms.push(someRoom);
  someRoom.addCells();
  someRoom.cleared = true;
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
  rooms[rooms.length-1].spawnStairs();
}

function myRotate(object, radians) {
  translate(object.pos.x*CELLSIZE, object.pos.y*CELLSIZE);
  rotate(radians);
  translate(-object.pos.x*CELLSIZE, -object.pos.y*CELLSIZE);
}

function myGetAngle(object, x, y) {
  translate(object.pos.x*CELLSIZE, object.pos.y*CELLSIZE);
  let angle = atan2(y, x);
  translate(-object.pos.x*CELLSIZE, -object.pos.y*CELLSIZE);
  return angle;
}

function newLevel() {
  level ++;
  rooms.splice(0);

  createFirstRoom();
  generateRooms();

  player.pos.set(floor(MINROOMSIZE/2) + 0.5, floor(MINROOMSIZE/2) + 0.5);
  player.hp += 10;
}

function keyPressed() {
  if (keyCode === 32) {
    paused = abs(int(paused)-1);
  }
  if (!player.dead && player.onStairs && keyCode === 70) {
    console.log("The air gets colder...");
    console.log("The light gets thinner...");
    newLevel();
  }
  if (player.dead && keyCode === 70) {
    level = -1;
    newLevel();
    createPlayer();
  }
}

function playerInput() {

  if (! player.dead && ! player.knocked) {
    player.direction.x = int(keyIsDown(68)) - int(keyIsDown(65));
    player.direction.y = int(keyIsDown(83)) - int(keyIsDown(87));
  
    if (mouseIsPressed) {
      player.weapon.attack();
    }
  }
  else {
    player.direction.set(0, 0);
  }

}