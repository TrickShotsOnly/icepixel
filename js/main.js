var socket = io();
var x = 1;
var y = 1;
var playerId = 0;
var curState = new engine.State();

socket.on('stateUpdate', function(state){
  curState = state;
	alert(id);
});

socket.on('init', function(id){
 	playerId = id;
	document.write('hi');
});

window.setInterval(playerUpdate, 15);

function playerUpdate(){
  socket.emit('playerUpdate', {x:2, y:1});
}
