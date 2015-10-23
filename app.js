var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var buffer = [];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/view/index.html');
});

app.get('/ixl', function(req, res){
  console.log('Someone connected to IXL');
  res.sendFile(__dirname + '/views/ixl/index.html');
});

io.on('connection', function(socket){
  for(i = 0; i < buffer.length; i++){
    socket.emit('chat message', buffer[i]);
  }
  socket.on('chat message', function(msg){
    buffer.push(msg);
    io.emit('chat message', msg);
  });
});

http.listen(8081, function(){
  console.log('Chat app running on *:8081');
});
