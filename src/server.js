var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/view/index.html');
  console.log('A user connected');
});

io.on('connection', function(socket){
  socket.on('disconnect', function(){
    console.log('A user disconnected');
  });
});

http.listen(9000, function(){
  console.log('icepixel running on *:9000');
});