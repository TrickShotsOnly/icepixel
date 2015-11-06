(function(exports){
  exports.Vec2  = function(){
    this.x = 0;
    this.y = 0;
  };

	exports.Player = function(id){
    this.id = id;
        this.username = "";
        this.inputX = 0;
		this.inputY = 0;
    this.x = 0;
    this.y = 0;
  };
	
  exports.Room = function(){
    this.players = [];
    this.addPlayer = function(id){
			player = new exports.Player(id);
      this.players.push(player);
        return player;
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
          return this.players[i];
        }
      }
      return -1;
    };
  };

})(typeof exports === "undefined"? this["engine"]={}: exports);
