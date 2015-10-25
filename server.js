var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var engine = require('./view/js/engine');

var state = new engine.State;

//Routing
app.use('/', express.static('view'));

//Run server
http.listen(9000, function(){
  console.log('icepixel now running on *:9000');
});

//Handle connection
io.on('connection', function(socket){
  player = new engine.Player();
  state.addPlayer(player);

  socket.emit('initialize', player);
  console.log("A user connected with player id " + player.id);

  socket.on('disconnect', function(){
    console.log("A user disconnected with player id " + player.id);
    state.removePlayer(player.id);
  });
});

setInterval(update, 15);

function update(){
}
