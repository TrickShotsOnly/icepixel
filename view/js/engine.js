(function(exports) {
  exports.Vec2 = function() {
    this.x = 0;
    this.y = 0;
  };

  exports.Player = function(id, username) {
    this.id = id;
    this.username = username;
    this.input = exports.Vec2(0, 0);
    this.pos = exports.Vec2(0, 0);
  };

  exports.Room = function() {
    this.players = [];
    this.addPlayer = function(id, username) {
      player = new exports.Player(id, username);
      this.players.push(player);
      return this.players.indexOf(player);
    };
    this.getPlayerById = function(id) {
      for (i = 0; i < this.players.length; i++) {
        if (this.players[i].id == id) {
          return this.players[i];
        }
      }
      return -1;
    };
    this.removePlayerById = function(id) {
      for (i = 0; i < this.players.length; i++) {
        if (this.players[i].id == id) {
          this.players.splice(i, 1);
          return;
        }
      }
      return -1;
    };
    this.getPlayerByIndex = function(index) {
      if (!this.players[index]) return -1;
      return this.players[index];
    }
    this.removePlayerByIndex = function(index) {
      if (!this.players[index]) return -1;
      this.players.splice(i, 1);
    }
  };

})(typeof exports === "undefined" ? this["engine"] = {} : exports);
