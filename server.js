var express = require("express");
var fs = require("fs");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var engine = require("./view/js/engine");
var UUID = require("node-uuid");

var rooms = [];
var authentications = [];

//Load config
var configFile = fs.readFileSync("config.json");
var config = JSON.parse(configFile);

//Routing

app.use("/", express.static("view"));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get("/getroomdata", function(req, res) {
  res.json(rooms.length);
})

//Add rooms set in config

for (i = 0; i < config.numRooms; i++) {
  addRoom();
}

//Run server
http.listen(config.port, function() {
  console.log("icepixel now running on port " + config.port);
});

//Handle connection

io.on("connection", function(socket) {
  var id = UUID();
  var username;
  var connected;
  socket.on("joinRoom", function(room) {
    if (rooms[room]) {
      socket.emit("joinRoomResponse", 0);
    } else {
      socket.emit("joinRoomResponse", 1);
    }
    socket.on("username", function(name) {
      if (connected) {
        return;
      }
      if (name == "" || name == null) {
        console.log("No username");
        socket.emit("play", 1);
        return;
      }
      username = name;
      connected = true;
      socket.emit("play", 0);
      console.log("Connection: room: " + room + " id: " + id + " username: " + username);
      //Ingame
      var playerIndex = rooms[room].addPlayer(id, username);

      //Disconnections
      socket.on("disconnect", function(){
        console.log("Disconnection: room: " + room + " id: " + id + " username: " + username);
      });
    });
  });
});

setInterval(updateRooms, 15);

function updateRooms() {
  for (a = 0; a < rooms.length; a++) {
    for (i = 0; i < rooms[a].players.length; i++) {
      rooms[a].players[i].x += 1;
    }
    io.emit("stateUpdate", rooms[a]);
  }
}

function listConnectedPlayers(state) {
  console.log("Connected players:");
  console.log(rooms[state].players);
}

function addRoom() {
  var room = new engine.Room();
  console.log("Added room " + rooms.length);
  rooms.push(room);
}
