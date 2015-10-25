(function(exports){
  exports.Vec2  = function(){
    this.x = 0;
    this.y = 0;
  }

  exports.State = function(){
    this.players = [];
  }

  exports.Player = function(id){
    this.id = id;
    this.x = 0;
    this.y = 0;
  }

})(typeof exports === 'undefined'? this['engine']={}: exports);
