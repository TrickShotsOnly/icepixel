var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var engine = require("./view/js/engine");
var UUID = require("node-uuid");

var rooms = [];
var authentications = [];

//Routing

app.use("/", express.static("view"));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.get("/getroomdata", function (req, res) {
    res.json(rooms.length);
})

//Authentication

/*Authentication errors:
cerror 0 = no errors :D
cerror 1 = room not available
cerror 2 = no username
cerror 3 = username not allowed
*/

app.post("/roomrequest", function (req, res) {
    var room = req.body.room;
    var username = req.body.username;
    console.log(username);
    var id = UUID();
    console.log("Request for room " + room);
    var response = {
        error: 0,
        username: "",
        id: 0
    };
    response.id = id;
    if (rooms[room]) {
        if (username == "" || username == null) {
            response.error = 2;
            res.json(response);
            console.log("No username, returning cerror 2");
            return;
        } else {
            response.username = username;
            console.log("Authentication: " + username + " : " + id);
            authentications.push(response);
            res.json(response);
            return;
        }
    } else {
        console.log("Requested room " + room + " not available, returning cerror 1");
        response.error = 1;
        res.json(response);
        return;
    }
});

//Add first room

addRoom();

//Run server
http.listen(9000, function () {
    console.log("icepixel now running on *:9000");
});

//Handle connection

io.on("connection", function(socket){
  var id = UUID();
  socket.on("joinRoom", function(room){
    console.log("Request to join room " + room + " by " + id);
    if (rooms[room]){
      socket.emit("joinRoomResponse", 0);
    }else{
      socket.emit("joinRoomResponse", 1);
    }
  });
});

/*io.on("connection", function(socket){
  socket.on("auth", function(id){
    console.log("Socket connection attempted by id " + id);
    for(i = 0; i < 0; i++){
      if(authentications[i].id == id){
        socket.emit("join", authentications[i].username);
        console.log("Success");
        break;
      }
      socket.emit("join", 1);
      console.log("Error");
    }
  });
});*/

/*io.on("connection", function (socket) {
    socket.on("joinRoom", function (room) {
        var id = UUID();
        if (rooms[room]) {
            console.log("Requested room " + room + " available, querying for username");

            socket.emit("init", id);
        } else {
            console.log("Requested room " + room + " not available, returning cerror 0");
            socket.emit("cerror", 0);
            return;
        }
        socket.on("username", function (name) {
            if (name == null || name == "") {
                socket.emit("cerror", 1);
                console.log("No username entered, returning cerror 1")
                return;
            }
            var player = rooms[room].addPlayer(id);
            player.username = name;

            console.log("Connection " + '"' + player.username + '"' + " : " + id);

            socket.emit("join", rooms[room]);

            socket.on("input", function (data) {
                player.inputX = data.x;
                player.inputY = data.y;
            });

            socket.on("disconnect", function () {
                rooms[room].removePlayer(id);
                console.log("Disconnection " + '"' + player.username + '"' + " : " + id);
            });
        });
    });
});*/


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
