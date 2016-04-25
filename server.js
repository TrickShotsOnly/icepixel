var express = require("express");
var fs = require("fs");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var engine = require("./view/js/engine");
var UUID = require("node-uuid");

var projMult = 0.25;
var projBase = 0.15;

var lastUpdate;

var rooms = [];
var authentications = [];

//Load config
var configFile = fs.readFileSync("config.json");
var config = JSON.parse(configFile);

//Routing
app.use("/", express.static("view"));
app.use("/admin", express.static("admin"));
app.use(bodyParser.urlencoded({
  extended: false
}));

//Add a room
var room0 = new engine.Room();
rooms.push(room0);
if (cubicMap = JSON.parse(fs.readFileSync("maps/cubic.json"))) {}
room0.loadMap(cubicMap);

//Run server
http.listen(config.port, function() {
  console.log("icepixel now running on port " + config.port);
});

var clients = {};

//Handle connection
io.on("connection", function(socket) {
  var id = UUID();
  var username;
  var connected;
  socket.emit("numRooms", rooms.length);
  socket.on("numRoomsRequest", function() {
    console.log("adminRoomsRequest");
    socket.emit("numRooms", rooms.length);
  });
  socket.on("adminLogin", function(password) {
    if (password == config.adminPassword) {
      console.log("Admin logged in");
      socket.emit("adminSuccess", 0);
      socket.on("kick", function(id, room) {
        rooms[room].removePlayerById(id);
      });
      socket.on("adminGetPlayersInRoom", function(room) {
        socket.emit("adminReturnPlayersInRoom", rooms[room].data.players);
      });
    } else {
      console.log("Admin login attempt failed, password " + password);
      socket.emit("adminFailed", 0);
    }
  });
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

			var pos = new engine.Vec2(Math.random() * 2000 - 500, Math.random() * 1500 - 500);

      username = name;
      connected = true;
      socket.emit("play", 0, pos);
      console.log("Connection: room: " + room + " id: " + id + " username: " + username);

      //Ingame
      var playerIndex = rooms[room].addPlayer(id, username);
      var curPlayer = rooms[room].getPlayerByIndex(playerIndex);
      curPlayer.maxVel = config.players.maxVel;
      curPlayer.pos = pos;
      curPlayer.vel = new engine.Vec2(Math.random() * 10 - 5, Math.random() * 10 - 5);

      //Save socket for further use
      clients[id] = socket;

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
          var dis = new engine.Vec2(pos.x - curPlayer.pos.x, pos.y - curPlayer.pos.y);
          var mag = Math.sqrt(dis.x * dis.x + dis.y * dis.y);
          var vel = Math.sqrt(curPlayer.vel.x * curPlayer.vel.x + curPlayer.vel.y * curPlayer.vel.y);
          var dir = new engine.Vec2(dis.x / mag * (vel * projMult + projBase),
            dis.y / mag * (vel * projMult + projBase));
          rooms[room].spawnProjectile(new engine.Vec2(curPlayer.pos.x, curPlayer.pos.y), dir, id);
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
setInterval(sendUpdate, config.updateDelta);

function updateRooms() {
  var now = Date.now();
  var delta = now - lastUpdate;
  lastUpdate = now;

  for (a = 0; a < rooms.length; a++) {
    //Projectiles
    for (i = 0; i < rooms[a].data.projectiles.length; i++) {
      var curProj = rooms[a].data.projectiles[i];
      if (curProj.dead == true) {
        rooms[a].removeProjectileByIndex(i);
        return;
      }
      engine.updateProjectile(curProj, delta);

      for (p = 0; p < rooms[a].data.players.length; p++) {
        if (curProj.pos.x > rooms[a].data.players[p].pos.x - (rooms[a].data.players[p].width) && curProj.pos.x < rooms[a].data.players[p].pos.x + (rooms[a].data.players[p].width) && curProj.pos.y > rooms[a].data.players[p].pos.y - (rooms[a].data.players[p].height) && curProj.pos.y < rooms[a].data.players[p].pos.y + (rooms[a].data.players[p].height)) {
          if (rooms[a].data.players[p].id != curProj.id) {
            clients[curProj.id].emit("kill", rooms[a].data.players[p].username);
						rooms[a].data.players[i].spawn(new engine.Vec2(Math.random() * 2000 - 500, Math.random() * 1500 - 500), new engine.Vec2(Math.random() * 10 - 5, Math.random() * 10 - 5));

						clients[rooms[a].data.players[p].id].emit("killed", rooms[a].getPlayerById(curProj.id).username, rooms[a].data.players[i].pos);
	          rooms[a].getPlayerById(curProj.id).score++;
            rooms[a].data.players[p].dead = true;
            curProj.dead = true;
          }
        }
      }
    }

    //Players
    for (i = 0; i < rooms[a].data.players.length; i++) {
      engine.updatePlayer(rooms[a].data.players[i], delta);
    }
  }
}

//Send current room
function sendUpdate() {
  io.emit("roomUpdate", rooms[0].data);
}
