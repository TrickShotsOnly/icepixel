(function(exports) {

  exports.Vec2 = function(x, y) {
    this.x = x;
    this.y = y;
  }

  exports.Shape = function(vertices) {
    this.vertices = vertices;
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

		this.input = {};

    this.color = "orange";
    this.fireTimer = 0;
    this.dead = false;
    this.score = 0;

    this.update = function() {
      this.fireTimer++;

      if (this.vel.x >= this.maxVel) this.vel.x = this.maxVel;
      if (this.vel.x <= -this.maxVel) this.vel.x = -this.maxVel;
      if (this.vel.y >= this.maxVel) this.vel.y = this.maxVel;
      if (this.vel.y <= -this.maxVel) this.vel.y = -this.maxVel;

      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
    }

    this.spawn = function(pos, vel) {
      this.pos = pos;
      this.vel = vel;
    }
  };

  exports.Projectile = function(pos, vel, id) {
    this.pos = pos;
    this.vel = new exports.Vec2(vel.x * 30, vel.y * 30);
    this.lifeTime = 70;
    this.timer = 0
    this.dead = false;
    this.id = id;

    this.update = function() {
      this.timer++;
      if (this.timer >= this.lifeTime) {
        this.dead = true;
        return;
      }
      this.vel.x *= 0.98;
      this.vel.y *= 0.98;

      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
    };
  }

  exports.Wall = function(pos1, pos2, color) {
    this.pos1 = pos1;
    this.pos2 = pos2;
    this.color = color;
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
        wall = new exports.Wall(new exports.Vec2(map.walls[wall].x1, map.walls[wall].y1), new exports.Vec2(map.walls[wall].x2, map.walls[wall].y2), map.walls[wall].color);
        this.map.walls.push(wall);
      }
      console.log(this.map.walls);
    }
  };

})(typeof exports === "undefined" ? this["engine"] = {} : exports);
