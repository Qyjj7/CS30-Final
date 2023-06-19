//Riley Morrissey
//CS-30 Capstone Coding Project
//June 20, 2023
//Character sprites by Wesley Thiessen

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
    this.enemyCount = 0;
  }

  display() {

    //player can see outlines of rooms to help with navigation in dungeon
    noFill();
    rectMode(CORNER);
    rect(this.x*CELLSIZE, this.y*CELLSIZE, this.width*CELLSIZE, this.height*CELLSIZE);
  }

  createNeighbor(x, y, w, h) {

    //spawns new room on top of this room, translates to a potentially valid position
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

    //checks if the new room overlaps with any other existing room
    for (let otherRoom of rooms) {
      if (this.x < otherRoom.x + otherRoom.width && this.x + this.width > otherRoom.x && this.y < otherRoom.y + otherRoom.height && this.height + this.y > otherRoom.y) {
        return false;
      }
    }
    return true;
  }

  spawnDoors() {

    for (let otherRoom of rooms) {
      if (otherRoom !== this) {
        let options = [];

        // compares cells of this room to cells of every other room
        for (let someCell of this.cells) {
          for (let otherCell of otherRoom.cells) {
            
            //cells are valid if the neither are corners and if they are adjacent to one another
            //corners are not valid because corner doors allow travel into unintended rooms
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
        //each room is given their respective door from the randomly picked adjacent pair
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

    //searches room cells and randomly picks a cell that isn't already a door to spawn the stairs 
    let counter = 0;
    while (this.cells.length > counter) {
      let chosenCell = random(this.cells);
      if (! chosenCell.door) {
        chosenCell.stairs = true;
        stairs = chosenCell;
        break;
      }
      counter ++;
    }
  }

  spawnPots() {

    //randomly picks cells to spawn new pots on
    let potCount = this.width*this.height/15;
    for (let i = 0; i <= potCount; i++) {
      let chosenCell = random(this.cells);
      let pot = new Container(chosenCell);
      this.containers.push(pot);  
    }
  }

  addCells() {

    //filling room with cells that can have different properties 
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        
        //assign random sprite to give room textured look
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

        //2d arrays were not used because I find them annoying to type
        let newCell = new Cell(x + this.x, y + this.y, this, sprite);
        if (x % (this.width-1) === 0 && y % (this.height-1) === 0) {
          newCell.corner = true;
        }
        this.cells.push(newCell);
      }
    }
  }

  populate() {

    //add enemies to the room
    if (rooms[0] !== this) {
      this.enemyCount = ceil(this.width*this.height/15);
      let startAngle = random(0, TWO_PI);
      let intervals = TWO_PI/this.enemyCount;

      for (let i = 0; i < this.enemyCount; i++) {
        //each enemy in each room will have evenly spaced out destination points on a circle around player
        //different destinations mean the enemies will move more independently and will not overlap too much
        let angle = startAngle + intervals*i;
        let destination = createVector(cos(angle), sin(angle));

        let chosenCell = random(this.cells);
        this.determineEnemyStats(chosenCell, destination);
      }
    }
  }

  determineEnemyStats(cell, destination) {

    //randomly determine the enemy type
    let number = random(0, 100);
    let enemyType;
    if (number >= 0 && number < 25) {
      enemyType = "ranged";
    }
    else {
      enemyType = "melee";
    }

    //each enemy is given hp that scales with the dungeon level and a weapon with damage that also scales with dungeon level
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
      //ranged enemies do hardly chase player, so it won't look weird if their destination is the center of the player
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
    this.corner = false;
    this.door = false;
    this.stairs = false;
  }

  display() {

    this.sprite.width = CELLSIZE+CELLSIZE*0.01;
    this.sprite.height = CELLSIZE+CELLSIZE*0.01;
    imageMode(CORNER);
    image(this.sprite, this.x*CELLSIZE, this.y*CELLSIZE);

    if (this.door) {
      image(doorImage, this.x*CELLSIZE, this.y*CELLSIZE);
    }

    if (this.stairs) {
      image(stairsImage, this.x*CELLSIZE, this.y*CELLSIZE);
    }

    if (this.door && this.room.enemyCount > 0) {
      imageMode(CENTER);
      image(lockImage, (this.x + 0.5)*CELLSIZE, (this.y + 0.5)*CELLSIZE);
    }
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
    imageMode(CENTER);
    image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
    pop();
  }

  handleStuff() {

    //calls all necessary functions every frame to clean up draw loop
    this.immunityFrames --;
    if (this === player) {
      this.playerInput();
      this.updateMovement();
      this.checkRoom();
    }
    else {
      this.seekPlayer();
      this.updateMovement();  
    }
    this.checkCollisions();
    this.weapon.handleStuff();
  }

  seekPlayer() {

    //enemies seek in a straight line towards player
    this.direction.set(player.pos.x + this.destination.x - this.pos.x, player.pos.y + this.destination.x - this.pos.y);
    this.direction.normalize();
    
    if (this.dead || this.weapon.withinRange()) {
      this.direction.set(0, 0);
    }
  }

  playerInput() {

    //my brilliant one liner to move player instead of using 4 if statements
    if (! player.dead) {
      player.direction.set(int(keyIsDown(68)) - int(keyIsDown(65)), int(keyIsDown(83)) - int(keyIsDown(87)));
    }
    else {
      player.direction.set(0, 0);
    }
  }
  
  updateMovement() {

    //gradually slows movement to a halt create a friction effect
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
      //realistic physics movement in the desired direction
      this.vel.x += this.acceleration*this.direction.x;
      this.vel.y += this.acceleration*this.direction.y;
      this.vel = this.vel.limit(this.topSpeed - this.weapon.slowness*this.weapon.currentCharge/this.weapon.maxCharge);
    }

    if (this.rotation > PI) {
      //creates the flipping over effect that happens upon death
      this.rotation -= PI/14;
    }

    this.pos.add(this.vel);
  }

  checkRoom() {
    
    //determines which room player is in
    for (let someRoom of rooms) {
      if (this.pos.x >= someRoom.x && this.pos.x <= someRoom.x+someRoom.width) {
        if (this.pos.y >= someRoom.y && this.pos.y <= someRoom.y+someRoom.height) {
          if (this.currentRoom !== someRoom) {
            this.immunityFrames = 30;
            this.currentRoom = someRoom;
            doorSound.play();
          }
        }
      }
    }
  }

  checkCollisions() {

    let wallHere = true;
    if (this === player) {

      //don't do wall collision calculations if player is on a door cell
      for (let someDoor of player.currentRoom.doors) {
        if (floor(player.pos.x) === someDoor.x && floor(player.pos.y) === someDoor.y) {
          wallHere = false;
        }
      }

      //checks if player is on the staircase
      if (floor(player.pos.x) === stairs.x && floor(player.pos.y) === stairs.y) {
        player.onStairs = true;
      }
      else {
        player.onStairs = false;
      } 
    }

    //wall collision calculations
    if (wallHere || this.currentRoom.enemyCount > 0) {

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

    //apply consequences of getting hit by a weapon
    if (! this.dead) {
      enemyDamageSound.play();
    }

    if (this.immunityFrames <= 0) {
      //entity is knocked back in direction of weapon attack
      this.direction.set(weapon.direction.x, weapon.direction.y);
      this.vel.set(weapon.knockback * this.direction.x * charge, weapon.knockback * this.direction.y * charge);
      this.knocked = true;
      this.hp -= (weapon.damage+weapon.damageBonus)*charge;
      this.immunityFrames = 15;

      if (this.hp <= 0 && ! this.dead) {
        this.dead = true;
        this.rotation = 2*PI;
        if (this !== player) {
          this.currentRoom.enemyCount --;
        }
      }
      if (this.hp < 0) {
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
    this.damage = someWeapon.dmg;
    this.originalDamage = someWeapon.dmg;
    this.knockback = someWeapon.kb;
    this.maxCharge = someWeapon.maxCharge;
    this.currentCharge = 0;
    this.slowness = someWeapon.slowness;
    this.minimumCharge = someWeapon.minimumCharge;
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
      imageMode(CENTER);
      image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
      pop();
    }
    else if (this.currentCharge > 0 && ! this.owner.dead) {
      noFill();
      circle(this.pos.x*CELLSIZE, this.pos.y*CELLSIZE, this.size*CELLSIZE);
    }
  }

  handleStuff() {

    //calls all necessary functions every frame to clean up draw loop
    if (! this.owner.dead) {
      this.updateDirection();
      this.windUp();
    }
  }

  withinRange() {
    //returns true if owner can hit player with an attack at its distance
    return this.owner.pos.dist(player.pos) < this.size/2 + this.reach + player.size/2;
  }

  updateDirection() {

    if (this === player.weapon) {
      //weapon points towards user's mouse
      this.direction.set(mouseX - width/2, mouseY - height/2);
    }
    else {
      //points enemy weapon towards player
      this.direction.set(player.pos.x - this.owner.pos.x, player.pos.y - this.owner.pos.y);
    }

    this.direction.normalize();
    this.rotation = myGetAngle(this.owner, this.direction.x, this.direction.y);
    this.pos.set(this.owner.pos.x + this.direction.x*this.reach, this.owner.pos.y + this.direction.y*this.reach);
  }

  windUp() {

    if (this.owner === player) {
      //weapon charges while mouse is pressed and attacks when released
      if (mouseIsPressed && this.currentCharge < this.maxCharge) {
        this.currentCharge ++;
      }
      //power of the attack is determined by how many frames mouse was held for
      if (! mouseIsPressed && this.currentCharge > 0) {
        this.attack(0.5 + this.currentCharge/this.maxCharge);
        this.currentCharge = 0;
      }
    }

    else {
      //enemies only attack once weapon is fully charged
      if (this.owner.pos.dist(player.pos) < this.size/2 + this.reach + player.size/2 && this.currentCharge < this.maxCharge) {
        this.currentCharge ++;
      }
      else if (this.currentCharge >= this.maxCharge) {
        this.attack(this.minimumCharge);
        this.currentCharge = 0;
      }
      else {
        //so that enemies don't unfairly store charge for later if player moves out of range
        this.currentCharge = 0;
      }
    }
    
  }

  attack(charge) {

    if (this === player.weapon) {
      for (let someEntity of player.currentRoom.entities) {
        //checks if player hit an enemy
        if (this.pos.dist(someEntity.pos) < this.size / 2 + someEntity.size / 2) {
          someEntity.getHit(this, charge);
        }
      }
    }
    else {
      //checks if enemy hit the player
      if (this.pos.dist(player.pos) < this.size / 2 + player.size / 2) {
        player.getHit(this, charge);
      }
    }

    for (let someContainer of player.currentRoom.containers) {
      someContainer.checkCollisions(this);
    }

    swordSound.stop();
    swordSound.play();

    //displays the swinging image for a certain amount of time
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
    this.currentCharge = 0;
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
      imageMode(CENTER);
      image(this.sprite, this.pos.x*CELLSIZE, this.pos.y*CELLSIZE);
      pop();
    }
  }

  handleStuff() {

    //calls all necessary functions every frame to clean up draw loop
    if (this.withinRange() && ! this.owner.dead && ! this.swinging) {
      this.windUp();
    }
    this.checkCollisions();
    this.updateMovement();
  }

  withinRange() {
    //returns true if owner can hit player with an attack at its distance
    return ! this.dead && this.owner.pos.dist(player.pos) < this.maxRange + player.size/2;
  }

  updateDirection() {
    //sets the projectile's course towards player
    this.direction.set(player.pos.x - this.owner.pos.x, player.pos.y - this.owner.pos.y);
    this.direction.normalize();
  }

  windUp() {

    //charges attack and fires once fully charged
    if (this.currentCharge < this.maxCharge) {
      this.currentCharge ++;
    }
    else {
      this.updateDirection();
      this.swinging = true;
      this.currentCharge = 0;
    }
  }

  updateMovement() {

    //projectile moves towards point where player was when attack was fired
    //swinging means the projectile is flying through the air
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

    //wall collisions
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

    //player collisions
    if (this.swinging && this.pos.dist(player.pos) < this.size/2 + player.size/2) {
      collision = true;
      player.getHit(this, 2);
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

    //checks if weapon swing hitbox overlaps with this hitbox
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

    //determines what item is dropped when container is broken
    let drop = random(0, 100);
    let type = "nothing";
    let name = "tomato";
    let value;
    let sprite;
    let size = 0.4;
    let itemDirections = [someWeapon.direction];

    if (drop <= 3) {
      type = "weapon";
      name = "Longsword";
      value = new Weapon(longswordStats, 0, this, swingImage);
      sprite = longswordImage;
    }
    else if (drop <= 6) {
      type = "weapon";
      name = "Battle Axe";
      value = new Weapon(battleaxeStats, 0, this, swingImage);
      sprite = battleaxeImage;
    }
    else if (drop <= 9) {
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

      //tomatoes scatter evenly spaced out
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
        //giving weapon bonus in one random stat
        let modifierOptions = ["Fast", "Light", "Powerful", "Big"];
        let weaponModifier = random(modifierOptions);

        if (weaponModifier === "Fast") {
          value.maxCharge -= value.maxCharge*0.5;
        }
        if (weaponModifier === "Light") {
          value.slowness -= value.slowness*0.5;
        } 
        if (weaponModifier === "Powerful") {
          value.knockback += value.knockback*0.5;
        }
        if (weaponModifier === "Big") {
          value.size += value.size*0.5;
        }
        //adding descriptive prefix to the weapon's display name
        value.name = weaponModifier + " " + name;
      }

      for (let i = 0; i < itemDirections.length; i++) {
        //spawns the item
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

    //calls all necessary functions every frame to clean up draw loop
    this.gravitate();
    this.checkCollisions();
  }

  gravitate() {

    if (this.gravitating) {
      //item accelerates towards player
      this.direction.set(player.pos.x - this.pos.x, player.pos.y - this.pos.y);
      this.direction.normalize();

      this.vel.x += this.gravityStrength*this.direction.x;
      this.vel.y += this.gravityStrength*this.direction.y;
      this.vel = this.vel.limit(this.topSpeed);
      //gravity needs to increase constantly so that the item won't fly past the player due to slow turning from a low acceleration
      this.gravityStrength += this.gravityPerFrame;
    }

    else {
      //before gravitating towards player, item must come to a complete stop from its initial velocity
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

    //checks if item has reached player
    if (this.gravitating && this.pos.dist(player.pos) < player.size / 2 && ! player.dead) {
      player.currentRoom.items.splice(this.index, 1);

      if (this.type === "weapon") {
        if (! autotrash) {
          //initiates the pop up menu
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

//some constant stats that work better organized this way
let playerStats = {

  acceleration: 0.008,
  topSpeed: 0.07,
  hp: 50,
  size: 1,
};

let longswordStats = {

  name: "longsword",
  size: 0.8,
  reach: 0.4,
  dmg: 4,
  kb: 0.04,
  maxCharge: 30,
  slowness: 0.025,
  minimumCharge: 1,
};

let daggerStats = {

  name: "dagger",
  size: 0.5,
  reach: 0.45,
  dmg: 2.5,
  kb: 0.02,
  maxCharge: 10,
  slowness: 0.001,
  minimumCharge: 1.5,
};

let battleaxeStats = {

  name: "battle axe",
  size: 1.2,
  reach: 0.3,
  dmg: 6,
  kb: 0.08,
  maxCharge: 80,
  slowness: 0.05,
  minimumCharge: 0.5,
};

let meleeEnemyStats = {

  acceleration: 0.004,
  topSpeed: 0.05,
  hp: 10,
  size: 1.4,
};

let enemySwordStats = {

  size: 1,
  reach: 0.3,
  dmg: 1,
  kb: 0.06,
  maxCharge: 20,
  slowness: 0,
  minimumCharge: 2,
};

let rangedEnemyStats = {

  acceleration: 0.004,
  topSpeed: 0.05,
  hp: 5,
  size: 0.8,
};

let enemyWandStats = {

  size: 0.6,
  reach: 5,
  dmg: 1.5,
  vel: 0.08,
  kb: 0.1,
  maxCharge: 100,
  slowness: 0,
};


const MAXROOMSIZE = 10;
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
let framesCounted = 0;
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
let pickupSound;

let meleeEnemyImage;
let rangedEnemyImage;
let playerImage;
let projectileImage;
let swingImage;
let stairsImage;
let doorImage;
let potImage;
let brokenPotImage;
let lockImage;
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

  music = loadSound("assets/music.wav");
  swordSound = loadSound("assets/sword_attack.wav");
  doorSound = loadSound("assets/door_sound.mp3");
  enemyDamageSound = loadSound("assets/enemy_damage.wav");
  pickupSound = loadSound("assets/pickup.wav");

  meleeEnemyImage = loadImage("assets/melee_enemy.png");
  rangedEnemyImage = loadImage("assets/wizard.png");
  playerImage = loadImage("assets/player_sprite.png");
  projectileImage = loadImage("assets/tomatobigger.png");
  swingImage = loadImage("assets/swing.png");
  stairsImage = loadImage("assets/stairs.png");
  doorImage = loadImage("assets/door.png");
  potImage = loadImage("assets/pot.png");
  brokenPotImage = loadImage("assets/broken_pot.png");
  lockImage = loadImage("assets/lock.png");
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
  strokeWeight(2);
  textFont("Georia");

  //adjusting some sprite sizes
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
  let w = lockImage.width/CELLSIZE;
  let h = lockImage.height/CELLSIZE;
  lockImage.width = w*CELLSIZE;
  lockImage.height = h*CELLSIZE;

  backgroundColor = random([greyBackgroundImage, blueBackgroundImage, greenBackgroundImage]);

  //implementing and styling some DOM elements
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
  
  //updates fps every second
  setInterval(() => {
    displayedFrames = framesCounted;
    framesCounted = 0;
  }, 1000);

  //sets up dungeon
  createFirstRoom();
  createPlayer();
  generateRooms();

}

function draw() {

  framesCounted ++;

  //actual game stuff
  if (!paused) {
    player.handleStuff();
    for (let someEntity of player.currentRoom.entities) {
      someEntity.handleStuff();
    }
    for (let someItem of player.currentRoom.items) {
      someItem.handleStuff();
    }
    countTomatoes();

    if (player.hp > player.maxHp) {
      player.hp = player.maxHp;
    }
  }

  //displaying image for background
  imageMode(CORNER);
  image(backgroundColor, 0, 0);
  push();
  //displaying game stuff relative to player position
  translate(-player.pos.x*CELLSIZE + width/2, -player.pos.y*CELLSIZE + height/2);
  display();
  pop();
  //displaying user interface stuff
  displayInterface();

  let val = musicSlider.value();
  music.setVolume(val);
}

function display() {

  //displaying game stuff
  for (let someRoom of rooms) {
    if (someRoom.enemyCount === 0) {
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

  //displaying user interface

  let healthBarWidth = 500;
  let h = 40;
  let x = 20;
  let y = 15;
  rectMode(CORNER);
  noFill();
  rect(x, y, healthBarWidth, 40);
  fill("red");
  healthBarWidth *= player.hp/player.maxHp;
  rect(x, y, healthBarWidth, 40);

  let levelBarWidth = 500;
  noFill();
  rect(width - x - levelBarWidth, y, levelBarWidth, 40);
  fill("blue");
  levelBarWidth *= tomatoes/nextLevelRequirements;
  rect(width - x - levelBarWidth, y, levelBarWidth, 40);

  if (player.weapon.currentCharge > 0) {
    fill("orange");
    rect(width/2-player.size/2*CELLSIZE, height/2 + player.size/2*CELLSIZE + 10, player.size*CELLSIZE*player.weapon.currentCharge/player.weapon.maxCharge, 5);
  }

  fill("white");
  textSize(h);
  textAlign(CENTER);
  text((player.hp/player.maxHp*100).toFixed(0) + "%", 250+x, 50);
  text("Power " + playerLevel, width - 250 - x, 50);

  textSize(30);
  textAlign(LEFT);
  text("FPS: " + displayedFrames, 20, 100);
  text("Level: " + level, 20, 150);
  textAlign(CENTER);
  text(player.weapon.name, width/2, 50);
  text(player.weapon.damage.toFixed(0) + " damage", width/2, 100);

  textAlign(CENTER);
  text("Music", width - 125, height - 75);

  //pop ups can display one at a time and are ordered by priority
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
    imageMode(CENTER);
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
  player.weapon = new Weapon(battleaxeStats, 0, player, swingImage);
}

function createFirstRoom() {

  let firstRoom = new Room(0, 0, MINROOMSIZE, MINROOMSIZE);
  rooms.push(firstRoom);
  firstRoom.addCells();
  firstRoom.cleared = true;
}

function generateRooms() {

  while (rooms.length < ROOMQUANTITY) {
    //continues trying to spawn rooms until room quantity is met 
    let roomsToCheck = randomizeArray(rooms);
    let h = floor(random(MINROOMSIZE, MAXROOMSIZE));
    let w = floor(random(MINROOMSIZE, MAXROOMSIZE));

    //tries to spawn the new room adjacent to every existing room in a random order, until valid position is found
    for (let i = 0; i < roomsToCheck.length; i++) {
      let someRoom = roomsToCheck[i];
      let newRoom = someRoom.createNeighbor(someRoom.x, someRoom.y, w, h);
      if (newRoom.positionValid()) {
        rooms.push(newRoom);
        newRoom.addCells();
        break;
      }
    }
  }

  //adds other necessary parts to the rooms
  for (let someRoom of rooms) {
    someRoom.spawnDoors();
    someRoom.populate();
    someRoom.spawnPots();
  }
  rooms[rooms.length-1].spawnStairs();
}

function myRotate(object, radians) {
  //rotates around object by amount radians rather than around the origin
  translate(object.pos.x*CELLSIZE, object.pos.y*CELLSIZE);
  rotate(radians);
  translate(-object.pos.x*CELLSIZE, -object.pos.y*CELLSIZE);
}

function myGetAngle(object, x, y) {
  //gets the angle between object and the coordinate point rather than the origin
  translate(object.pos.x*CELLSIZE, object.pos.y*CELLSIZE);
  let angle = atan2(y, x);
  translate(-object.pos.x*CELLSIZE, -object.pos.y*CELLSIZE);
  return angle;
}

function randomizeArray(array) {

  //returns a new array that has same elements as old array, but in random order
  //for each element in array, swap its index value with another random element
  let randomizedArray = [...array];
  for (let i = 0; i < array.length; i++) {
    let swapIndex = floor(random(0, array.length));
    let temp = randomizedArray[i];
    randomizedArray[i] = randomizedArray[swapIndex];
    randomizedArray[swapIndex] = temp;
  }
  return randomizedArray;
}

function newLevel() {

  //creates a new level by resetting necessary variables and generating new dungeon
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
  player.hp += player.maxHp/2;
}

function countTomatoes() {

  //rythmically adds tomatoes collected to total tomatoes owned
  if (tomatoesToCount > 0 && frameCount%5 === 0) {
    tomatoesToCount --;
    tomatoes ++;
    pickupSound.play();
  }

  //levels up player
  if (tomatoes >= nextLevelRequirements) {
    playerLevel ++;
    //next level takes more tomatoes to reach as it is calculated by a power function
    nextLevelRequirements = pow(playerLevel + 12, 1.8);
    tomatoes = 0;
    player.hp += player.maxHp/2;
    player.weapon.damage = player.weapon.originalDamage + player.weapon.originalDamage*playerLevel*levelScalingMultiplier;
  }
}

function keyPressed() {

  //press f to descend down staircase
  if (! player.dead && player.onStairs && keyCode === 70) {
    console.log("The air gets colder...");
    console.log("The light gets thinner...");
    newLevel();
  }

  //press f to reset game
  if (player.dead && keyCode === 70) {
    level = 0;
    playerLevel = 1;
    newLevel();
    createPlayer();
    tomatoes = 0;
    tomatoesToCount = 0;
  }

  if (pickedUpWeapon.length > 0) {
    //press 1 to pick up new weapon
    if (keyCode === 49) {
      player.weapon = pickedUpWeapon[0];
      player.weapon.owner = player;
      player.weapon.damage = player.weapon.originalDamage + player.weapon.originalDamage*playerLevel*levelScalingMultiplier;
      pickedUpWeapon = [];
      paused = false;
    }
    //press 2 to discard new weapon
    if (keyCode === 50) {
      pickedUpWeapon = [];
      paused = false;
    }
  }
}