class Room {
  constructor(x, y, w, h) {
    this.width = w;
    this.height = h;
    this.x = x;
    this.y = y;
    this.color = color(random(255), random(255), random(255));
    this.cells = [];
    this.containers = [];
    this.items = [];
    this.doors = [];
    this.entities = [];
    this.cleared = false;
  }

  display() {
    noFill();
    rectMode(CORNER);
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height*CELLSIZE);
  }

  createNeighbor(x, y, w, h) {

    let newRoom = new Room(x, y, w, h);

    let spawningSide = random(directions);
    
    if (spawningSide === "north") {
      newRoom.y -= newRoom.height;
      newRoom.x += floor(random(-newRoom.width+3, this.width-3));
    }
    if (spawningSide === "south") {
      newRoom.y += this.height;
      newRoom.x += floor(random(-newRoom.width+3, this.width-3));
    }
    if (spawningSide === "east") {
      newRoom.x += this.width;
      newRoom.y += floor(random(-newRoom.height+3, this.height-3));
    }
    if (spawningSide === "west") {
      newRoom.x -= newRoom.width;
      newRoom.y += floor(random(-newRoom.height+3, this.height-3));
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
            
            if (! someCell.corner && ! otherCell.corner) {
              if (someCell.x === otherCell.x - 1 && someCell.y === otherCell.y) {
                options.push([someCell, otherCell]);
              }
              else if (someCell.x === otherCell.x && someCell.y === otherCell.y - 1) {
                options.push([someCell, otherCell]);
              }
            }
          }
        }
        if (options.length > 0) {
          let chosenDoor = random(options);
          chosenDoor[0].door = true;
          chosenDoor[1].door = true;
          this.doors.push(chosenDoor[0]);
          otherRoom.doors.push(chosenDoor[1]);
        }
      }
    }
  }

  spawnStairs() {

    while (this.cells.length > 0) {
      let chosenCell = random(this.cells);
      if (! chosenCell.door) {
        chosenCell.stairs = true;
        stairs = chosenCell;
        break;
      }
    }
  }

  spawnPots() {

    let potCount = this.width*this.height/15;

    for (let i = 0; i <= potCount; i++) {
      while (this.cells.length > 0) {
        let chosenCell = random(this.cells);
        if (! chosenCell.stairs && ! chosenCell.door && ! chosenCell.pot) {
          let pot = new Container(chosenCell);
          chosenCell.pot = true;
          this.containers.push(pot);
          break;
        }
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

        let newCell = new Cell(x + this.x, y + this.y, this, sprite);
        if (x % (this.width-1) === 0 && y % (this.height-1) === 0) {
          newCell.corner = true;
        }
        this.cells.push(newCell);
      }
    }
  }

  populate() {

    if (rooms[0] !== this) {

      let enemyCount = this.width*this.height/15;

      let startAngle = random(0, TWO_PI);
      let intervals = TWO_PI/enemyCount;

      for (let i = 0; i < enemyCount; i++) {

        let angle = startAngle + intervals*i;
        let destination = createVector(cos(angle), sin(angle));

        let chosenCell = random(this.cells);
        this.determineEnemyStats(chosenCell, destination);
      }
    }
  }

  determineEnemyStats(cell, destination) {

    let number = random(0, 100);
    let enemyType;
    if (number >= 0 && number < 25) {
      enemyType = "ranged";
    }
    else {
      enemyType = "melee";
    }

    if (enemyType === "melee") {

      let someEntity = structuredClone(meleeEnemyStats);
      someEntity.hp += someEntity.hp*levelScalingMultiplier;
      let someWeapon = structuredClone(enemySwordStats);
      let damageBonus = someWeapon.dmg*level*levelScalingMultiplier;

      let xPos = cell.x + 0.5;
      let yPos = cell.y + 0.5;
      destination.mult(someWeapon.reach + someWeapon.size/2);

      let enemy = new Entity(xPos, yPos, someEntity, this, destination, meleeEnemyImage);
      this.entities.push(enemy);
      enemy.weapon = new Weapon(someWeapon, damageBonus, enemy, swingImage);
    }

    else if (enemyType === "ranged") {

      let someEntity = structuredClone(rangedEnemyStats);
      someEntity.hp += someEntity.hp*level*levelScalingMultiplier;
      let someWeapon = structuredClone(enemyWandStats);
      let damageBonus = someWeapon.dmg*level*levelScalingMultiplier;

      let xPos = cell.x + 0.5;
      let yPos = cell.y + 0.5;
      destination = createVector(0, 0);

      let enemy = new Entity(xPos, yPos, someEntity, this, destination, rangedEnemyImage);
      this.entities.push(enemy);
      enemy.weapon = new Wand(someWeapon, damageBonus, enemy, projectileImage);
    }
  }
}

class Cell {
  constructor(x, y, room, sprite) {
    this.x = x;
    this.y = y;
    this.room = room;
    this.sprite = sprite;
    this.object = "blank";
    this.corner = false;
    this.door = false;
    this.stairs = false;
    this.pot = false;
  }

  display() {
    this.sprite.width = CELLSIZE+CELLSIZE*0.01;
    this.sprite.height = CELLSIZE+CELLSIZE*0.01;
    push();
    imageMode(CORNER);
    image(this.sprite, this.x*CELLSIZE, this.y*CELLSIZE);

    if (this.door) {
      image(doorImage, this.x*CELLSIZE, this.y*CELLSIZE);
    }

    if (this.stairs) {
      image(stairsImage, this.x*CELLSIZE, this.y*CELLSIZE);
    }
    pop();
  }
}

class Entity {
  constructor(x, y, someEntity, room, destination, sprite) {
    this.pos = createVector(x, y);
    this.acceleration = someEntity.acceleration;
    this.topSpeed = someEntity.topSpeed;
    this.hp = someEntity.hp;
    this.maxHp = someEntity.hp;
    this.size = someEntity.size;
    this.currentRoom = room;
    this.destination = destination;
    this.sprite = sprite;
    this.vel = createVector(0, 0);
    this.direction = createVector(0, 0);
    this.immunityFrames = 0;
    this.rotation = 0;
    this.knocked = false;
    this.dead = false;
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
      this.playerInput();
      this.updateMovement();
      this.checkRoom();
      this.checkCollisions();
    }
    else {
      this.seekPlayer();
      this.updateMovement();
      this.checkCollisions();
      
    }
    if (! this.knocked) {
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

  playerInput() {

    if (! player.dead) {
      player.direction.x = int(keyIsDown(68)) - int(keyIsDown(65));
      player.direction.y = int(keyIsDown(83)) - int(keyIsDown(87));
    }
    else {
      player.direction.set(0, 0);
    }
  }
  
  updateMovement() {

    if (this.direction.x === 0 && this.direction.y === 0 || this.knocked) {
      if (this.vel.mag() >= this.acceleration) {
        this.vel.setMag(this.vel.mag() - this.acceleration);
      }
      else {
        this.vel.set(0);
        this.knocked = false;
      }
    }

    else {
      this.vel.x += this.acceleration*this.direction.x;
      this.vel.y += this.acceleration*this.direction.y;
      this.vel = this.vel.limit(this.topSpeed - this.weapon.slowness*this.weapon.currentCharge/this.weapon.maxCharge);
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
            doorSound.play();
          }
        }
      }
    }
  }


  checkCollisions() {

    let wallHere = true;
    if (this === player) {

      for (let someDoor of player.currentRoom.doors) {
        if (floor(player.pos.x) === someDoor.x && floor(player.pos.y) === someDoor.y) {
          wallHere = false;
        }
      }

      if (floor(player.pos.x) === stairs.x && floor(player.pos.y) === stairs.y) {
        player.onStairs = true;
      }
      else {
        player.onStairs = false;
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

    if (this !== player) {
      enemyDamageSound.play();
    }

    if (this.immunityFrames <= 0) {

      this.direction.set(weapon.direction.x, weapon.direction.y);
      this.vel.set(weapon.knockback * this.direction.x * charge, weapon.knockback * this.direction.y * charge);

      this.knocked = true;
      this.hp -= (weapon.damage+weapon.damageBonus)*charge;
      this.rotation = 2*PI;
      this.immunityFrames = 15;

      if (this.hp <= 0) {
        this.dead = true;
        this.color = "red";
        this.hp = 0;
      }
    }
  }
}

class Weapon {
  constructor(someWeapon, damageBonus, owner, sprite) {
    this.name = "Longsword";
    this.size = someWeapon.size;
    this.reach = someWeapon.reach;
    this.maxRange = someWeapon.size/2 + someWeapon.reach;
    this.damage = someWeapon.dmg;
    this.originalDamage = someWeapon.dmg;
    this.knockback = someWeapon.kb;
    this.maxCharge = someWeapon.maxCharge;
    this.minCharge = someWeapon.minCharge;
    this.currentCharge = someWeapon.minCharge;
    this.slowness = someWeapon.slowness;
    this.damageBonus = damageBonus;
    this.owner = owner;
    this.sprite = sprite;
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
    this.pos.set(this.owner.pos.x + this.direction.x*this.reach, this.owner.pos.y + this.direction.y*this.reach);
  }

  windUp() {

    if (this.owner === player) {
      if (mouseIsPressed && this.currentCharge < this.maxCharge) {
        this.currentCharge ++;
      }
      if (! mouseIsPressed && this.currentCharge > this.minCharge) {
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

    for (let someContainer of player.currentRoom.containers) {
      someContainer.checkCollisions(this);
    }

    swordSound.stop();
    swordSound.play();

    this.swinging = true;
    setTimeout(() => {
      this.swinging = false;
    }, this.animationSpeed);
  }
}

class Wand {
  constructor(someWeapon, damageBonus, owner, sprite) {
    this.size = someWeapon.size;
    this.maxRange = someWeapon.reach;
    this.damage = someWeapon.dmg;
    this.vel = someWeapon.vel;
    this.knockback = someWeapon.kb;
    this.maxCharge = someWeapon.maxCharge;
    this.minCharge = someWeapon.minCharge;
    this.currentCharge = someWeapon.minCharge;
    this.slowness = someWeapon.slowness;
    this.damageBonus = damageBonus;
    this.owner = owner;
    this.sprite = sprite;
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

class Container {
  constructor(cell) {
    this.x = cell.x;
    this.y = cell.y;
    this.width = 0.4;
    this.height = 0.5;
    this.dead = false;
    this.item;
  }

  display() {

    potImage.width = this.width*CELLSIZE;
    potImage.height = this.height*CELLSIZE;

    if (! this.dead) {
      image(potImage, (this.x+this.width/2)*CELLSIZE, (this.y+this.height/2)*CELLSIZE);
    }
    else {
      image(brokenPotImage, (this.x+this.width/2)*CELLSIZE, (this.y+this.height/2)*CELLSIZE);
    }
  }

  checkCollisions(someWeapon) {
    if (! this.dead
      && someWeapon.pos.x + someWeapon.size/2 > this.x
      && someWeapon.pos.x - someWeapon.size/2 < this.x + this.width
      && someWeapon.pos.y + someWeapon.size/2 > this.y
      && someWeapon.pos.y - someWeapon.size/2 < this.y + this.height
    ) {
      this.dead = true;
      this.determineDrop(someWeapon);
    }
  }

  determineDrop(someWeapon) {
    let drop = random(0, 100);
    let type = "nothing";
    let name = "tomato";
    let value;
    let sprite;
    let size = 0.4;
    let itemDirections = [someWeapon.direction];

    if (drop <= 10) {
      type = "weapon";
      name = "Longsword";
      value = new Weapon(longswordStats, 0, this, swingImage);
      sprite = longswordImage;
    }
    else if (drop <= 20) {
      type = "weapon";
      name = "Battle Axe";
      value = new Weapon(battleaxeStats, 0, this, swingImage);
      sprite = battleaxeImage;
    }
    else if (drop <= 30) {
      type = "weapon";
      name = "Dagger";
      value = new Weapon(daggerStats, 0, this, swingImage);
      sprite = daggerImage;
    }
    else if (drop <= 100) {
      type = "tomato";
      value = 0;
      size = 0.2;
      sprite = projectileImage;

      let startAngle = random(0, TWO_PI);
      let intervals = TWO_PI/random(3, 6);
      itemDirections = [];
      for (let angle = startAngle; angle <= TWO_PI + startAngle; angle += intervals) {
        let thisDirection = createVector(cos(angle), sin(angle));
        itemDirections.push(thisDirection);
      }
    }

    if (type !== "nothing") {

      if (type === "weapon") {
        let modifierOptions = ["Light", "Powerful", "Big"];
        let weaponModifier = random(modifierOptions);

        if (weaponModifier === "Light") {
          value.minCharge *= 1.4;
          value.currentCharge *= 1.4;
        }
        if (weaponModifier === "Powerful") {
          value.knockback *= 1.4;
        }
        if (weaponModifier === "Big") {
          value.size *= 1.4;
        }

        value.name = weaponModifier + " " + name;
      }

      for (let i = 0; i < itemDirections.length; i++) {
        let speed = random(0.04, 0.08);
        let newItem = new Item(this.x, this.y, value, sprite, itemDirections[i], player.currentRoom.length, size, speed, type);
        player.currentRoom.items.push(newItem);
      }
    } 
  }
}

class Item {
  constructor(x, y, value, sprite, direction, index, size, speed, type) {
    this.type = type;
    this.pos = createVector(x, y);
    this.width = 0.4;
    this.height = 0.5;
    this.size = size;
    this.value = value;
    this.sprite = sprite;
    this.direction = direction;
    this.arrayIndex = index;
    this.vel = createVector(this.direction.x*speed, this.direction.y*speed);
    this.gravityStrength = 0.0001;
    this.gravityPerFrame = 0.0005;
    this.friction = 0.005;
    this.topSpeed = 0.1;
    this.gravitating = false;
    this.buttons = [];
  }

  display() {
    this.sprite.width = this.size*CELLSIZE;
    this.sprite.height = this.size*CELLSIZE;
    image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
  }

  handleStuff() {
    this.gravitate();
    this.checkCollisions();
  }

  gravitate() {

    if (this.gravitating) {
      this.direction.set(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
      this.direction.normalize();

      this.vel.x += this.gravityStrength*this.direction.x;
      this.vel.y += this.gravityStrength*this.direction.y;
      this.vel = this.vel.limit(this.topSpeed);
      this.gravityStrength += this.gravityPerFrame;
    }

    else {
      if (this.vel.mag() >= this.friction) {
        this.vel.setMag(this.vel.mag() - this.friction);
      }
      else {
        this.vel.set(0);
        this.gravitating = true;
      }
    }

    this.pos.add(this.vel);
  }

  checkCollisions() {
    if (this. gravitating && this.pos.dist(player.pos) < this.size / 2 && ! player.dead) {
      player.currentRoom.items.splice(this.index, 1);

      if (this.type === "weapon") {
        if (! autotrash) {
          pickedUpWeapon = [this.value, this.sprite];
          paused = true;
        }
        tomatoesToCount += 10;
      }
      if (this.type === "tomato") {
        tomatoesToCount += 1;
      }
    } 
  }
}


const MAXROOMSIZE = 13;
const MINROOMSIZE = 5;
const ROOMQUANTITY = 10;
const CELLSIZE = 150;

let directions = ["north", "south", "east", "west"];
let rooms = [];
let pickedUpWeapon = [];
let backgroundColor;
let player;
let stairs;
let paused = false;
let autotrash = false;
let theseFrames = 0;
let displayedFrames = 0;
let level = 1;
let tomatoes = 0;
let tomatoesToCount = 0;
let playerLevel = 0;
let nextLevelRequirements = 0;
let levelScalingMultiplier = 0.1;

let musicSlider;
let autoTrashBox;

let musicLoop;
let music;
let swordSound;
let doorSound;
let enemyDamageSound;

let meleeEnemyImage;
let rangedEnemyImage;
let playerImage;
let projectileImage;
let swingImage;
let stairsImage;
let doorImage;
let potImage;
let brokenPotImage;
let longswordImage;
let daggerImage;
let battleaxeImage;

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

  soundFormats("mp3", "wav");
  music = loadSound("assets/music.wav");
  swordSound = loadSound("assets/sword_attack.wav");
  doorSound = loadSound("assets/door_sound.mp3");
  enemyDamageSound = loadSound("assets/enemy_damage.wav");

  meleeEnemyImage = loadImage("assets/melee_enemy.png");
  rangedEnemyImage = loadImage("assets/wizard.png");
  playerImage = loadImage("assets/player_sprite.png");
  projectileImage = loadImage("assets/tomatobigger.png");
  swingImage = loadImage("assets/swing.png");
  stairsImage = loadImage("assets/stairs.png");
  doorImage = loadImage("assets/door.png");
  potImage = loadImage("assets/pot.png");
  brokenPotImage = loadImage("assets/broken_pot.png");
  longswordImage = loadImage("assets/longsword.png");
  daggerImage = loadImage("assets/dagger.png");
  battleaxeImage = loadImage("assets/battleaxe.png");

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
  textFont("Georia");

  greyBackgroundImage.width = width;
  greyBackgroundImage.height = height;
  blueBackgroundImage.width = width;
  blueBackgroundImage.height = height;
  greenBackgroundImage.width = width;
  greenBackgroundImage.height = height;
  doorImage.width = CELLSIZE;
  doorImage.height = CELLSIZE;
  stairsImage.width = CELLSIZE;
  stairsImage.height = CELLSIZE;

  backgroundColor = random([greyBackgroundImage, blueBackgroundImage, greenBackgroundImage]);

  musicSlider = createSlider(0, 1, 0.2, 0.01);
  musicSlider.position(width - 200, height - 50);
  musicSlider.style("width", "150px");

  autoTrashBox = createCheckbox(" AutoTrash Weapons", false);
  autoTrashBox.position( width - 250, height - 200);
  autoTrashBox.style("font-size", "30px");
  autoTrashBox.style("color", "white");
  autoTrashBox.style("text-align", "center");
  autoTrashBox.changed(() => {
    autotrash = ! autotrash;
  });

  music.loop();
  
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
    player.handleStuff();
    for (let someEntity of player.currentRoom.entities) {
      someEntity.handleStuff();
    }
    for (let someItem of player.currentRoom.items) {
      someItem.handleStuff();
    }
    countTomatoes();
  }

  push();
  translate(-player.pos.x*CELLSIZE + width/2, -player.pos.y*CELLSIZE + height/2);
  display();
  pop();
  displayInterface();

  let val = musicSlider.value();
  music.setVolume(val);

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
  for (let someContainer of player.currentRoom.containers) {
    someContainer.display();
  }
  for (let someItem of player.currentRoom.items) {
    someItem.display();
  }
  for (let someEnemy of player.currentRoom.entities) {
    someEnemy.display();
    someEnemy.weapon.display();
  }

  player.display();
  player.weapon.display();
}

function displayInterface() {

  let healthBarWidth = 500;
  let h = 40;
  let x = 20;
  let y = 15;
  rectMode(CORNER);
  noFill();
  rect(x, y, healthBarWidth, h);
  fill("red");
  healthBarWidth *= player.hp/player.maxHp;
  rect(x, y, healthBarWidth, h);

  let levelBarWidth = 500;
  noFill();
  rect(width - x - levelBarWidth, y, levelBarWidth, h);
  fill("blue");
  levelBarWidth *= tomatoes/nextLevelRequirements;
  rect(width - x - levelBarWidth, y, levelBarWidth, h);

  fill("white");
  textSize(h);
  textAlign(CENTER);
  text((player.hp/player.maxHp*100).toFixed(0) + "%", 250+x, 50);
  text("Power " + playerLevel, width - 250 - x, 50);

  textSize(30);
  textAlign(LEFT);
  text("FPS: " + displayedFrames, 20, 100);
  text("Level: " + level, 20, 150);
  text("Charge: " + (player.weapon.currentCharge/player.weapon.maxCharge*100).toFixed(0) + "%", 20, 200);
  textAlign(CENTER);
  text(player.weapon.name, width/2, 50);
  text(player.weapon.damage + " damage", width/2, 100);

  textAlign(CENTER);
  text("Music", width - 125, height - 75);

  if (player.dead) {
    textSize(50);
    textAlign(CENTER);
    text("Game Over", width/2, height/2 - CELLSIZE);
    text("Press F to Restart", width/2, height/2 + CELLSIZE);
  }

  else if (pickedUpWeapon.length !== 0 ) {
    textAlign(CENTER);
    rectMode(CENTER);
    fill(80);
    rect(width/2, height/2, width/4, height/2);
    fill("white");
    text(pickedUpWeapon[0].name, width/2, height/2 - 150);
    text("Press 1 to Keep", width/2, height/2 + 100);
    text("Press 2 to Discard", width/2, height/2 + 150);

    pickedUpWeapon[1].width = 80;
    pickedUpWeapon[1].height = 80;
    image(pickedUpWeapon[1], width/2, height/2);
  }

  else if (player.onStairs) {
    textSize(20);
    textAlign(CENTER);
    text("Press F to Descend", width/2, height/2 + CELLSIZE*0.75);
  }
}

function createPlayer() {

  let x = floor(MINROOMSIZE/2) + 0.5;
  let y = floor(MINROOMSIZE/2) + 0.5;

  player = new Entity(x, y, playerStats, rooms[0], null, playerImage);
  player.weapon = new Weapon(longswordStats, 0, player, swingImage);
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
    someRoom.spawnPots();
  }

  rooms[rooms.length-1].spawnStairs();
  rooms[0].spawnStairs();
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

function countTomatoes() {
  if (tomatoesToCount > 0 && frameCount%5 === 0) {
    tomatoesToCount --;
    tomatoes ++;
  }

  if (tomatoes >= nextLevelRequirements) {
    playerLevel ++;
    nextLevelRequirements = pow(playerLevel + 15, 1.5);
    tomatoes = 0;
    player.weapon.damage = player.weapon.originalDamage + player.weapon.originalDamage*playerLevel*levelScalingMultiplier;
  }
}

function keyPressed() {

  if (!player.dead && player.onStairs && keyCode === 70) {
    console.log("The air gets colder...");
    console.log("The light gets thinner...");
    newLevel();
  }
  if (player.dead && keyCode === 70) {
    level = 0;
    playerLevel = 1;
    newLevel();
    createPlayer();
    tomatoes = 0;
    tomatoesToCount = 0;
  }

  if (pickedUpWeapon.length > 0) {
    if (keyCode === 49) {
      player.weapon = pickedUpWeapon[0];
      player.weapon.owner = player;
      player.weapon.damage = player.weapon.originalDamage + player.weapon.originalDamage*playerLevel*levelScalingMultiplier;
      pickedUpWeapon = [];
      paused = false;
    }
    if (keyCode === 50) {
      pickedUpWeapon = [];
      paused = false;
    }
  }
}