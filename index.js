var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('hi');
});

http.listen(8082, function(){
  console.log('icepixel running on *:8082');
});