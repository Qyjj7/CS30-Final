class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.cells = [];
    this.interactables = [];
    this.entities = [];
    this.cleared = false;
  }

  display() {
    noFill();
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
        thisRoom.push({x: x, y: y});
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
              options.push([otherCell.x - 0.5, otherCell.y]);
            }
            else if (someCell.x === otherCell.x && someCell.y === otherCell.y - 1) {
              options.push([otherCell.x, otherCell.y - 0.5]);
            }
          }
        }

        if (options.length > 0) {
          let chosenDoor = random(options);
          let x = chosenDoor[0];
          let y = chosenDoor[1];

          let newInteractable = new Interactable(x, y, 1, 1, "door", doorImage);
          this.interactables.push(newInteractable);
          otherRoom.interactables.push(newInteractable);
        }
      }
    }
  }

  spawnStairs() {

    while (this.cells.length > 0) {
      let chosenCell = random(this.cells);
      if (chosenCell.object === "blank") {

        let stairs = new Interactable(chosenCell.x, chosenCell.y, 1, 1, "staircase", stairsImage);
        this.interactables.push(stairs);
        break;
      }
    }
  }

  addCells() {

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        
        let sprite;
        if (backgroundColor === greyBackgroundImage) {
          sprite = random([greyTileImage1, greyTileImage2]);
        }
        else if (backgroundColor === blueBackgroundImage) {
          sprite = random([blueTileImage1, blueTileImage2]);
        }
        else {
          sprite = random([greenTileImage1, greenTileImage2]);
        }

        let newCell = new Cell(x + this.x, y + this.y, sprite);
        this.cells.push(newCell);
      }
    }
  }

  populate() {

    if (rooms[0] !== this) {

      let enemyCount = this.width*this.height/15;

      for (let i = 0; i < enemyCount; i++) {
        let chosenCell = random(this.cells);
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
      
      let angle = random(TWO_PI);
      let destination = createVector(cos(angle), sin(angle));
      destination.mult(enemySwordStats.reach + enemySwordStats.size/2);

      let hp = meleeEnemyStats.hp;
      hp += hp*level/5;

      let enemy = new Entity(xPos, yPos, meleeEnemyStats.acceleration, meleeEnemyStats.topSpeed, hp, meleeEnemyStats.size, this, destination, meleeEnemyImage);
      this.entities.push(enemy);

      let dmg = enemySwordStats.dmg;
      dmg += dmg*level/5;
      enemy.weapon = new Longsword(enemySwordStats.size, enemySwordStats.reach, enemySwordStats.dmg, enemySwordStats.kb, enemySwordStats.maxCharge, enemy, swingImage);
    }

    else if (enemyType === "ranged") {

      let xPos = cell.x + 0.5;
      let yPos = cell.y + 0.5;

      let destination = createVector(0, 0);

      let hp = 4;
      hp += hp*level/5;

      let enemy = new Entity(xPos, yPos, rangedEnemyStats.acceleration, rangedEnemyStats.topSpeed, hp, rangedEnemyStats.size, this, destination, meleeEnemyImage);
      this.entities.push(enemy);

      let dmg = 3;
      dmg += dmg*level/5;
      enemy.weapon = new Wand(enemyWandStats.size, enemyWandStats.reach, dmg, enemyWandStats.vel, enemyWandStats.kb, enemy, projectileImage);
    }
  }
}

class Cell {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.object = "blank";
    this.color = color(113, 92, 72);
  }

  display() {
    this.sprite.width = CELLSIZE+CELLSIZE*0.01;
    this.sprite.height = CELLSIZE+CELLSIZE*0.01;
    push();
    imageMode(CORNER);
    image(this.sprite, this.x*CELLSIZE, this.y*CELLSIZE);
    pop();
  }
}

class Interactable {
  constructor(x, y, w, h, type, sprite) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.type = type;
    this.image = sprite;
    this.color = color(75, 38, 2);
  }

  display() {
    this.image.width = this.width*CELLSIZE;
    this.image.height = this.height*CELLSIZE;
    push();
    imageMode(CORNER);
    image(this.image, this.x*CELLSIZE, this.y*CELLSIZE);
    pop();

  }

  playerCollision() {

    if (player.pos.x >= this.x && player.pos.x < this.x + this.width) {
      if (player.pos.y >= this.y && player.pos.y < this.y + this.height) {
        return true;
      }
    }
    return false;
  }
}

class Entity {
  constructor(x, y, acc, topSpeed, hp, size, room, destination, sprite) {
    this.pos = createVector(x, y);
    this.acceleration = acc;
    this.topSpeed = topSpeed;
    this.hp = hp;
    this.maxHp = hp;
    this.size = size;
    this.currentRoom = room;
    this.destination = destination;
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

    this.immunityFrames --;
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
    this.direction.set(player.pos.x + this.destination.x - this.pos.x, player.pos.y + this.destination.x - this.pos.y);
    this.direction.normalize();
    
    if (this.dead || this.weapon.withinRange()) {
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
      if (this.weapon.currentCharge >= this.weapon.maxCharge) {
        this.vel = this.vel.limit(this.topSpeed*0.6);
      }
      else {
        this.vel = this.vel.limit(this.topSpeed);
      }  
    }

    if (! this.dead && this.rotation > 0) {
      this.rotation -= PI/16;
    }
    else if (this.rotation > PI) {
      this.rotation -= PI/16;
    }

    this.pos.add(this.vel);
  }


  checkRoom() {
    
    for (let someRoom of rooms) {
      if (this.pos.x >= someRoom.x && this.pos.x <= someRoom.x+someRoom.width) {
        if (this.pos.y >= someRoom.y && this.pos.y <= someRoom.y+someRoom.height) {
          if (this.currentRoom !== someRoom) {
            this.immunityFrames = 30;
            this.currentRoom = someRoom;
            this.currentRoom.cleared = true;
          }
        }
      }
    }
  }


  checkCollisions() {

    let wallHere = true;
    for (let someInteractable of this.currentRoom.interactables) {
      if (this === player && someInteractable.playerCollision() && someInteractable.type !== "staircase") {
        wallHere = false;
        this.onStairs = false;
      }
      else if (this === player && someInteractable.playerCollision()) {
        this.onStairs = true;
      }
      else {
        this.onStairs = false;
      }
    }

    if (wallHere) {

      if (this.pos.x < this.currentRoom.x + this.size / 2) {
        this.pos.x = this.currentRoom.x + this.size / 2;
        if (this.knocked || this !== player) {
          this.vel.x = -this.vel.x;
        }
      }
      if (this.pos.x > this.currentRoom.x + this.currentRoom.width - this.size / 2) {
        this.pos.x = this.currentRoom.x + this.currentRoom.width - this.size / 2;
        if (this.knocked || this !== player) {
          this.vel.x = -this.vel.x;
        }
      }
      if (this.pos.y < this.currentRoom.y + this.size / 2) {
        this.pos.y = this.currentRoom.y + this.size / 2;
        if (this.knocked || this !== player) {
          this.vel.y = -this.vel.y;
        }
      }
      if (this.pos.y > this.currentRoom.y + this.currentRoom.height - this.size / 2) {
        this.pos.y = this.currentRoom.y + this.currentRoom.height - this.size / 2;
        if (this.knocked || this !== player) {
          this.vel.y = -this.vel.y;
        }
      }
    }
  }

  getHit(weapon, charge) {

    if (this.immunityFrames <= 0) {

      this.direction.set(weapon.direction.x, weapon.direction.y);
      this.vel.set(weapon.knockback * this.direction.x * charge, weapon.knockback * this.direction.y * charge);

      this.knocked = true;
      this.hp -= weapon.damage*charge;
      this.rotation = 2*PI;
      this.immunityFrames = 15;

      if (this.hp <= 0) {
        this.dead = true;
        this.color = "red";
        this.hp = 0;
      }

      setTimeout(() => {
        this.knocked = false;
      }, weapon.knockbackTime);
    }
  }
}

class Longsword {
  constructor(diameter, reach, dmg, kb, maxCharge, owner, sprite) {
    this.name = "longsword";
    this.size = diameter;
    this.reach = reach;
    this.maxRange = diameter/2 + reach;
    this.damage = dmg;
    this.knockback = kb;
    this.owner = owner;
    this.sprite = sprite;
    this.maxCharge = maxCharge;
    this.minCharge = maxCharge/4;
    this.currentCharge = maxCharge/4;
    this.knockbackTime = kb*1000;
    this.rotation = 0;
    this.animationSpeed = 300;
    this.pos = createVector(0, 0);
    this.direction = createVector(0,0);
    this.swinging = false;
  }

  display() {
    if (this.swinging) {
      this.sprite.width = this.size*CELLSIZE;
      this.sprite.height = this.size*CELLSIZE;
      push();
      myRotate(this, this.rotation + HALF_PI);
      image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
      pop();
    }
    else if (this.currentCharge > this.minCharge && ! this.owner.dead) {
      noFill();
      circle(this.pos.x*CELLSIZE, this.pos.y*CELLSIZE, this.size*CELLSIZE);
    }
  }

  handleStuff() {

    if (! this.owner.dead) {
      this.updateDirection();
      this.windUp();
    }
    
  }

  withinRange() {
    return this.owner.pos.dist(player.pos) < this.maxRange + player.size/2;
  }

  updateDirection() {

    if (this === player.weapon) {
      this.direction.set(mouseX - width/2, mouseY - height/2);
    }
    else {
      this.direction.set(player.pos.x - this.owner.pos.x, player.pos.y - this.owner.pos.y);
    }

    this.direction.normalize();

    this.rotation = myGetAngle(this.owner, this.direction.x, this.direction.y);
    //this.direction.mult(this.reach);
    this.pos.set(this.owner.pos.x + this.direction.x*this.reach, this.owner.pos.y + this.direction.y*this.reach);
  }

  windUp() {

    if (this.owner === player) {
      if (mouseIsPressed && this.currentCharge < this.maxCharge) {
        this.currentCharge ++;
      }
      else if (! mouseIsPressed && this.currentCharge > this.minCharge) {
        this.attack(this.currentCharge/this.maxCharge);
        this.currentCharge = this.minCharge;
      }
    }

    else {
      if (this.withinRange() && this.currentCharge < this.maxCharge) {
        this.currentCharge ++;
      }
      else if (this.currentCharge >= this.maxCharge) {
        this.attack(1);
        this.currentCharge = this.minCharge;
      }
      else {
        this.currentCharge = this.minCharge;
      }
    }
    
  }

  attack(charge) {

    if (this === player.weapon) {
      for (let someEntity of player.currentRoom.entities) {
        if (this.pos.dist(someEntity.pos) < this.size / 2 + someEntity.size / 2) {
          someEntity.getHit(this, charge);
        }
      }
    }
    else {
      if (this.pos.dist(player.pos) < this.size / 2 + player.size / 2) {
        player.getHit(this, charge);
      }
    }

    this.swinging = true;
    setTimeout(() => {
      this.swinging = false;
    }, this.animationSpeed);
  }
}

class Wand {
  constructor(diameter, reach, dmg, vel, kb, owner, sprite) {
    this.name = "wand";
    this.size = diameter;
    this.maxRange = reach;
    this.damage = dmg;
    this.vel = vel;
    this.knockback = kb;
    this.owner = owner;
    this.sprite = sprite;
    this.maxCharge = 120;
    this.minCharge = this.maxCharge/4;
    this.currentCharge = this.maxCharge/4;
    this.knockbackTime = kb*1000;
    this.rotation = 0;
    this.pos = createVector(owner.pos.x, owner.pos.y);
    this.direction = createVector(0,0);
    this.swinging = false;
  }

  display() {
    if (this.swinging) {
      this.sprite.width = this.size*CELLSIZE;
      this.sprite.height = this.size*CELLSIZE;
      push();
      myRotate(this, this.rotation);
      image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
      pop();
    }
  }

  handleStuff() {

    if (this.withinRange() && ! this.owner.dead && ! this.swinging) {
      this.windUp();
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

  windUp() {
    if (this.currentCharge < this.maxCharge) {
      this.currentCharge ++;
    }
    else {
      this.updateDirection();
      this.swinging = true;
      this.currentCharge = this.minCharge;
    }
  }

  updateMovement() {

    if (this.swinging) {
      this.pos.x += this.vel*this.direction.x;
      this.pos.y += this.vel*this.direction.y;
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
      player.getHit(this, 1);
    }

    if (collision) {
      this.swinging = false;
      this.rotation = 0;
    }
  }
}


const MAXROOMSIZE = 13;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 10;
const CELLSIZE = 100;
const DOORSIZE = 1/5;

let directions = ["north", "south", "east", "west"];
let rooms = [];
let backgroundColor;
let player;
let paused = false;
let theseFrames = 0;
let displayedFrames = 0;
let level = 0;

let meleeEnemyImage;
let projectileImage;
let swingImage;
let stairsImage;
let doorImage;

let greyBackgroundImage;
let greyTileImage1;
let greyTileImage2;

let blueBackgroundImage;
let blueTileImage1;
let blueTileImage2;

let greenBackgroundImage;
let greenTileImage1;
let greenTileImage2;


function preload() {

  meleeEnemyImage = loadImage("assets/melee_enemy.png");
  projectileImage = loadImage("assets/tomatobigger.png");
  swingImage = loadImage("assets/swing.png");
  stairsImage = loadImage("assets/stairs.png");
  doorImage = loadImage("assets/door.png");

  greyBackgroundImage = loadImage("assets/grey_background.png");
  greyTileImage1 = loadImage("assets/grey_tile1.png");
  greyTileImage2 = loadImage("assets/grey_tile2.png");

  blueBackgroundImage = loadImage("assets/blue_background.png");
  blueTileImage1 = loadImage("assets/blue_tile1.png");
  blueTileImage2 = loadImage("assets/blue_tile2.png");

  greenBackgroundImage = loadImage("assets/green_background.png");
  greenTileImage1 = loadImage("assets/green_tile1.png");
  greenTileImage2 = loadImage("assets/green_tile2.png");
}

function setup() {

  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  strokeWeight(2);

  greyBackgroundImage.width = width;
  greyBackgroundImage.height = height;
  blueBackgroundImage.width = width;
  blueBackgroundImage.height = height;
  greenBackgroundImage.width = width;
  greenBackgroundImage.height = height;

  backgroundColor = random([greyBackgroundImage, blueBackgroundImage, greenBackgroundImage]);

  setInterval(() => {
    displayedFrames = theseFrames;
    theseFrames = 0;
  }, 1000);

  createFirstRoom();
  createPlayer();
  generateRooms();
}

function draw() {

  image(backgroundColor, width/2, height/2);

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

  if (paused) {
    displayStats();
  }
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
  for (let someInteractable of player.currentRoom.interactables) {
    someInteractable.display();
  }
  for (let someEnemy of player.currentRoom.entities) {
    someEnemy.display();
    someEnemy.weapon.display();
  }

  player.display();
  player.weapon.display();
}

function displayInterface() {

  let w = 500;
  let h = 40;
  let x = 20;
  let y = 15;
  noFill();
  rect(x, y, w, h);
  fill("red");
  w *= player.hp/player.maxHp;
  rect(x, y, w, h);

  fill("white");
  textSize(h);
  textAlign(CENTER);
  text((player.hp/player.maxHp*100).toFixed(0) + "%", 250+x, 50);

  textSize(30);
  textAlign(LEFT);
  text("FPS: " + displayedFrames, 20, 100);
  text("Level: " + level, 20, 150);
  text("Charge: " + (player.weapon.currentCharge/player.weapon.maxCharge*100).toFixed(0) + "%", 20, 200);

  textSize(20);
  textAlign(RIGHT);
  text("Press Space to Pause Game", width-20, 25);

  if (player.onStairs && ! player.dead) {
    textSize(20);
    textAlign(CENTER);
    text("Press F to Descend", width/2, height/2 + CELLSIZE*0.75);
  }

  if (player.dead) {
    textSize(50);
    textAlign(CENTER);
    text("Game Over", width/2, height/2 - CELLSIZE);
    text("Press F to Restart", width/2, height/2 + CELLSIZE);
  }
}

function displayStats() {
  let l = 600;
  let x = width/2;
  let y = height/2;

  fill(80);
  rect(x-l/2, y-l/2, l/2, l); // stats

  fill("white");
  textSize(30);
  textAlign(CENTER);
  text("STATS", x-l/4, y-l/2 + l/12);
  textAlign(LEFT);
  text("Max HP:", x-l/2, y-l/2 + l/6);
  text("Max Speed:", x-l/2, y-l/2 + l/4);
  text("Weapon Size:", x-l/2, y-l/2 + l/3);

}

function createPlayer() {

  let x = floor(MINROOMSIZE/2) + 0.5;
  let y = floor(MINROOMSIZE/2) + 0.5;
  player = new Entity(x, y, playerStats.acceleration, playerStats.topSpeed, playerStats.hp, playerStats.size, rooms[0], null, meleeEnemyImage);
  player.weapon = new Longsword(swordStats.size, swordStats.reach, swordStats.dmg, swordStats.kb, swordStats.maxCharge, player, swingImage);
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
  //rooms[0].spawnStairs();
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
  
  let colorOptions = [greyBackgroundImage, blueBackgroundImage, greenBackgroundImage];
  for (let i = 0; i < colorOptions.length; i++) {
    if (backgroundColor === colorOptions[i]) {
      colorOptions.splice(i, 1);
    }
  }
  backgroundColor = random(colorOptions);

  createFirstRoom();
  generateRooms();

  player.pos.set(floor(MINROOMSIZE/2) + 0.5, floor(MINROOMSIZE/2) + 0.5);
  player.hp += 10;

  if (player.hp > player.maxHp) {
    player.hp = 25;
  }
}

function keyPressed() {
  if (keyCode === 32) {
    paused = !paused;
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
  }
  else {
    player.direction.set(0, 0);
  }

}