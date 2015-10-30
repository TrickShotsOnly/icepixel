var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var engine = require('./view/js/engine');
var UUID = require('node-uuid');

var state = new engine.State();

//Routing
app.use('/', express.static('view'));

//Run server
http.listen(9000, function(){
	console.log('icepixel now running on *:9000');
});

//Handle connection
io.on('connection', function(socket){
	var id = UUID();
	state.addPlayer(id);
	socket.emit('init', id);
	console.log('User ' + id + ' connected');
	listConnectedPlayers();

	socket.on('input', function(data){
		state.getPlayer(id).inputX = data.x;
		state.getPlayer(id).inputY = data.y;
	});
	socket.on('disconnect', function(){
		state.removePlayer(id);
		console.log('User ' + id + ' disconnected');
		listConnectedPlayers();
	});
});


setInterval(stateUpdate, 15);

function stateUpdate(){
	for(i = 0; i < state.players.length; i++){
		state.players[i].x += 1;
	}
	console.log(state.players);
	io.emit('stateUpdate', state);
}

function listConnectedPlayers(){
	console.log('Connected players:');
	console.log(state.players);
}
