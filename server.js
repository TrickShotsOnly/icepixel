var express = require("express");
var fs = require("fs");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var engine = require("./view/js/engine");
var UUID = require("node-uuid");
var box = require("./box2d.min");

var projMult = 0.25;
var projBase = 0.15;

var playerSize = 40;

var lastUpdate;

var rooms = [];
var authentications = [];

var wallBounce = 0.05;

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
        delete clients[id];

        var keys = [];
        for (var key in clients) {
          if (clients.hasOwnProperty(key)) keys.push(key);
        }

        for (var i = playerIndex; i < keys.length; i++) {
          clients[keys[i]].emit("subtractIndex");
        }
        console.log("Disconnection: room: " + room + " id: " + id + " username: " + username);
      });
    });
  });
});

setInterval(updateRooms, 30);
setInterval(sendUpdate, config.updateDelta);

function updateRooms() {
  var now = Date.now();
  var delta = now - lastUpdate;
  lastUpdate = now;

  for (a = 0; a < rooms.length; a++) {
    var room = rooms[a];
    //Projectiles
    for (i = 0; i < room.data.projectiles.length; i++) {
      var curProj = room.data.projectiles[i];
      if (curProj.dead == true) {
        room.removeProjectileByIndex(i);
        return;
      }
      engine.updateProjectile(curProj, delta);

      for (p = 0; p < room.data.players.length; p++) {
        if (room.data.players[p].id != curProj.id) {
          if (curProj.pos.x > room.data.players[p].pos.x - (room.data.players[p].width) && curProj.pos.x < room.data.players[p].pos.x + (room.data.players[p].width) && curProj.pos.y > room.data.players[p].pos.y - (room.data.players[p].height) && curProj.pos.y < room.data.players[p].pos.y + (room.data.players[p].height)) {
            clients[curProj.id].emit("kill", room.data.players[p].username);
            clients[room.data.players[p].id].emit("killed", room.getPlayerById(curProj.id).username);
            room.getPlayerById(curProj.id).score++;
            room.data.players[p].dead = true;
            curProj.dead = true;
          }
        }
      }

      /*for (i = 0; i < room.map.walls.length; i++) {
        var wall = rooms[a].map.walls[i];

        if (curProj.pos.x + 20 < wall.x || curProj.pos.x - 20 > wall.x + wall.width) continue;
        if (curProj.pos.y + 20 < wall.y || curProj.pos.y - 20 > wall.y + wall.height) continue;

        curProj.dead = true;
      }*/
    }

    //Players
    for (i = 0; i < room.data.players.length; i++) {
      var player = room.data.players[i];
      if (player.dead) {
        player.spawn(new engine.Vec2(Math.random() * 2000 - 500, Math.random() * 1500 - 500), new engine.Vec2(Math.random() * 10 - 5, Math.random() * 10 - 5));
        player.dead = false;
      }

			/*for (i = 0; i < room.map.walls.length; i++) {
				var wall = rooms[a].map.walls[i];
				if (player.pos.x + (playerSize / 2) < wall.x || player.pos.x - (playerSize / 2) > wall.x + wall.width) continue;
				if (player.pos.y + (playerSize / 2) < wall.y || player.pos.y - (playerSize / 2) > wall.y + wall.height) continue;

				var diff = new engine.Vec2(player.pos.x - (wall.x + (wall.width / 2)), player.pos.y - (wall.y + (wall.height / 2)));

				var overlapX = wall.width / 2 + playerSize / 2 - Math.abs(diff.x);
				var overlapY = wall.height / 2 + playerSize / 2 - Math.abs(diff.y);

				if (overlapX < overlapY) {
					if (diff.x > 0) {
						player.pos.x += overlapX;
						player.vel.x += wallBounce;
					}
					if (diff.x < 0) {
						player.pos.x -= overlapX;
						player.vel.x -= wallBounce;
					}
				} else {
					if (diff.y > 0) {
						player.pos.y += overlapY;
						player.vel.y += wallBounce;
					}
					if (diff.y < 0) {
						player.pos.y -= overlapY;
						player.vel.y -= wallBounce;
					}
				}
			}*/

			engine.updatePlayer(player, delta);
    }
  }
}

//Send current
function sendUpdate() {
  io.emit("roomUpdate", rooms[0].data);
}
