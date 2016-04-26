(function() {
	if( typeof exports == 'undefined' ) {
		exports = window;
	}

  exports.Vec2 = function(x, y) {
    this.x = x;
    this.y = y;
  }

  exports.Player = function(id, username) {
    //Identification
    this.id = id;
    this.username = username;
    this.width = 40;
    this.height = 40;

    //Position and velocity
    this.vel = new exports.Vec2(0, 0);
    this.maxVel = 0;
    this.pos = new exports.Vec2(0, 0);
    this.accel = 0.002;

		this.dead = false;

    this.input = {};

    this.color = 0xf57200;
    this.fireTimer = 0;
    this.score = 0;

    this.spawn = function(pos, vel) {
      this.pos = pos;
      this.vel = vel;
    }
  };

  exports.updatePlayer = function(player, delta) {
    if (player.input) {
      var moveX = 0;
      var moveY = 0;
      if (player.input.left) moveX -= 1;
      if (player.input.right) moveX += 1;
      if (player.input.up) moveY -= 1;
      if (player.input.down) moveY += 1;

      player.vel.x += moveX * player.accel * delta;
      player.vel.y += moveY * player.accel * delta;

      if (moveX == 0) {
        player.vel.x *= 0.9;
      }
      if (moveY == 0) {
        player.vel.y *= 0.9;
      }
    }

    player.fireTimer++;

    if (player.vel.x >= player.maxVel) player.vel.x = player.maxVel;
    if (player.vel.x <= -player.maxVel) player.vel.x = -player.maxVel;
    if (player.vel.y >= player.maxVel) player.vel.y = player.maxVel;
    if (player.vel.y <= -player.maxVel) player.vel.y = -player.maxVel;

    player.pos.x += player.vel.x * delta;
    player.pos.y += player.vel.y * delta;
  }

  exports.Projectile = function(pos, vel, id) {
    this.pos = pos;
    this.vel = new exports.Vec2(vel.x * 5, vel.y * 5);
    this.lifeTime = 70;
    this.timer = 0
    this.dead = false;
    this.id = id;
  }

	exports.updateProjectile = function(proj, delta) {
		proj.timer++;
		if (proj.timer >= proj.lifeTime) {
			proj.dead = true;
			return;
		}
		proj.vel.x *= 0.98;
		proj.vel.y *= 0.98;

		proj.pos.x += proj.vel.x * delta;
		proj.pos.y += proj.vel.y * delta;
	}

  exports.Wall = function(x, y, width, height, color, opacity) {
    this.x = x;
		this.y = y;
    this.width = width;
		this.height = height;
    this.color = color;
		this.opacity = opacity;
  }

  exports.Room = function() {
    this.data = {
      players: [],
      projectiles: []
    };
    this.map = {
      walls: []
    }
    this.addPlayer = function(id, username) {
      player = new exports.Player(id, username);
      this.data.players.push(player);
      return this.data.players.indexOf(player);
    };
    this.spawnProjectile = function(pos, vel, id) {
      projectile = new exports.Projectile(pos, vel, id);
      this.data.projectiles.push(projectile);
      return this.data.projectiles.indexOf(projectile);
    };
    this.getPlayerById = function(id) {
      for (i = 0; i < this.data.players.length; i++) {
        if (this.data.players[i].id == id) {
          return this.data.players[i];
        }
      }
      return -1;
    };
    this.removePlayerById = function(id) {
      for (i = 0; i < this.data.players.length; i++) {
        if (this.data.players[i].id == id) {
          this.data.players.splice(i, 1);
          return;
        }
      }
      return -1;
    };
    this.getPlayerByIndex = function(index) {
      if (!this.data.players[index]) return -1;
      return this.data.players[index];
    };
    this.removePlayerByIndex = function(index) {
      if (!this.data.players[index]) return -1;
      this.data.players.splice(i, 1);
    };
    this.getProjectileByIndex = function(index) {
      if (!this.data.projectiles[index]) return -1;
      return this.data.projectiles[index];
    }
    this.removeProjectileByIndex = function(index) {
      if (!this.data.projectiles[index]) return -1;
      this.data.projectiles.splice(index, 1);
    };
    this.loadMap = function(map) {
      console.log("Loading map " + map.name);
      for (var wall in map.walls) {
        wall = new exports.Wall(map.walls[wall].x, map.walls[wall].y, map.walls[wall].width, map.walls[wall].height, map.walls[wall].color, map.walls[wall].opacity);
        this.map.walls.push(wall);
      }
      console.log(this.map.walls);
    }
  };
}).call(this);
