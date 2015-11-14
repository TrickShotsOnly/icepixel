(function(exports) {

  exports.Player = function(id, username, index) {
    this.id = id;
    this.index = index;
    this.username = username;
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.xVel = 0;
    this.yVel = 0;
    this.maxVel = 0;
    this.x = 0;
    this.y = 0;
    this.color = "orange";
    this.fireTimer = 9000;
    this.dead = false;
    this.score = 0;
    this.update = function() {
      this.fireTimer++;
      if (this.dead) {
        this.x = 0;
        this.y = 0;
        console.log("Player " + username + " died");
      }
      if (this.xVel >= this.maxVel) this.xVel = this.maxVel;
      if (this.xVel <= -this.maxVel) this.xVel = -this.maxVel;
      if (this.yVel >= this.maxVel) this.yVel = this.maxVel;
      if (this.yVel <= -this.maxVel) this.yVel = -this.maxVel;
      this.x += this.xVel;
      this.y += this.yVel;
      this.xVel *= 0.95;
      this.yVel *= 0.95;
    }
  };

  exports.Projectile = function(x, y, xVel, yVel, index) {
    this.x = x;
    this.y = y;
    this.xVel = xVel * 30;
    this.yVel = yVel * 30;
    this.lifeTime = 50;
    this.timer = 0
    this.dead = false;
    this.playerIndex = index;
    this.update = function() {
      this.timer++;
      if (this.timer >= this.lifeTime) {
        this.dead = true;
        return;
      }
      this.x += this.xVel;
      this.y += this.yVel;
      this.xVel *= 0.97;
      this.yVel *= 0.97;
    };
  }

  exports.Room = function() {
    this.data = {
      players: [],
      projectiles: []
    };
    this.addPlayer = function(id, username, index) {
      player = new exports.Player(id, username, this.data.players.length);
      this.data.players.push(player);
      return this.data.players.indexOf(player);
    };
    this.spawnProjectile = function(x, y, xVel, yVel, playerIndex) {
      projectile = new exports.Projectile(x, y, xVel, yVel, playerIndex);
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
    this.getProjectileByInde = function(index) {
      if (!this.data.projectiles[index]) return -1;
      return this.data.projectiles[index];
    }
    this.removeProjectileByIndex = function(index) {
      if (!this.data.projectiles[index]) return -1;
      this.data.projectiles.splice(i, 1);
    };
  };

})(typeof exports === "undefined" ? this["engine"] = {} : exports);
