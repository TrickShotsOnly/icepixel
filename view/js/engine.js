(function(exports){
  exports.Vec2  = function(){
    this.x = 0;
    this.y = 0;
  }

  exports.State = function(){
    this.players = [];
    this.addPlayer = function(player){
      this.players.push(player);
      player.id = this.players.length + 1;
    };
    this.removePlayer = function(id){
      for(i = 0; i < this.players.length; i++){
        if(this.players[i].id == id){
          this.players.splice(i, 1);
        }
      }
    };
    this.getPlayer = function(id){
      for(i = 0; i < this.players.length; i++){
        if(this.players[i].id == id){
          return players[i];
        }
      }
      return -1;
    };
  }

  exports.Player = function(){
    this.id = 0;
    this.x = 0;
    this.y = 0;
  }

})(typeof exports === 'undefined'? this['engine']={}: exports);
