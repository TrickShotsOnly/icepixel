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
      var curPlayer = rooms[room].getPlayerByIndex(playerIndex);
      curPlayer.maxVel = config.players.maxVel;

      socket.on("inputUpdate", function(input) {
        curPlayer.input = input;
      });

      socket.on("requestIndex", function() {
        socket.emit("index", playerIndex);
      });

      socket.emit("map", rooms[room].map);

      socket.on("fire", function(pos) {
        if (curPlayer.fireTimer > 20) {
          //Calculate direction
          var disX = pos.x - curPlayer.x;
          var disY = pos.y - curPlayer.y;
          var mag = Math.sqrt(disX * disX + disY * disY);
          var dirX = disX / mag;
          var dirY = disY / mag;
          rooms[room].spawnProjectile(curPlayer.x, curPlayer.y, dirX, dirY, playerIndex);
          curPlayer.fireTimer = 0;
        }
      });

      //Disconnections
      socket.on("disconnect", function() {
        rooms[room].removePlayerById(id);
        console.log("Disconnection: room: " + room + " id: " + id + " username: " + username);
      });
    });
  });
});

setInterval(updateRooms, 15);
setInterval(sendUpdate, 45);

function updateRooms() {
  for (a = 0; a < rooms.length; a++) {

    for (i = 0; i < rooms[a].data.players.length; i++) {
      var curPlayer = rooms[a].data.players[i];
      if (curPlayer.input) {
        var moveX = 0;
        var moveY = 0;
        if (curPlayer.input.left) moveX -= 1;
        if (curPlayer.input.right) moveX += 1;
        if (curPlayer.input.up) moveY -= 1;
        if (curPlayer.input.down) moveY += 1;

        curPlayer.xVel += moveX * 0.2;
        curPlayer.yVel += moveY * 0.2;
      }
      curPlayer.update();
      /*for (var wall in rooms[a].map.walls) {
        if (rooms[a].map.walls.hasOwnProperty(wall)) {
          if (curPlayer.x < (rooms[a].map.walls[wall].x + rooms[a].map.walls[wall].width / 2) &&
            curPlayer.x > (rooms[a].map.walls[wall].x - rooms[a].map.walls[wall].width / 2) &&
            curPlayer.y < (rooms[a].map.walls[wall].y + rooms[a].map.walls[wall].height / 2) &&
            curPlayer.y > (rooms[a].map.walls[wall].y - rooms[a].map.walls[wall].height / 2)
          ){
            console.log("collision");
          }
        }
      }*/
    }

    for (i = 0; i < rooms[a].data.projectiles.length; i++) {
      var curProj = rooms[a].data.projectiles[i];
      if (curProj.dead == true) {
        rooms[a].removeProjectileByIndex(i);
        return;
      }
      curProj.update();

      for (p = 0; p < rooms[a].data.players.length; p++) {
        if (curProj.x > rooms[a].data.players[p].x - 20 && curProj.x < rooms[a].data.players[p].x + 20 && curProj.y > rooms[a].data.players[p].y - 20 && curProj.y < rooms[a].data.players[p].y + 20) {
          if (rooms[a].data.players[p].index != curProj.playerIndex) {
            rooms[a].data.players[p].dead = true;
          }
        }
      }
    }
  }
}

function sendUpdate() {
  io.emit("roomUpdate", rooms[0].data);
}

function listConnectedPlayers(state) {
  console.log("Connected players:");
  console.log(rooms[state].players);
}

function addRoom() {
  var room = new engine.Room();
  console.log("Added room number " + rooms.length);
  rooms.push(room);
  room.loadMap(config.maps.main);
}
