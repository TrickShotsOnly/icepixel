var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var engine = require("./play/js/engine");
var UUID = require("node-uuid");

var rooms = [];

//Routing

//Join page
app.use("/", express.static("join"));

//Add first room

addRoom();
addRoom();

//Run server
http.listen(9000, function () {
    console.log("icepixel now running on *:9000");
});

//Handle connection
io.on("connection", function (socket) {
    socket.on('requestRoom', function (room) {
        console.log('Request for room ' + room);
        var connectedRoom = 1;
        var id = UUID();
        socket.emit("init", id);
        socket.on("username", function (username) {
            var player = room.addPlayer(id);
            player.username = username;

            console.log("User " + player.username + " : " + id + " connected");
            listConnectedPlayers(connectedRoom);

            socket.on("input", function (data) {
                player.inputX = data.x;
                player.inputY = data.y;
            });

            socket.on("disconnect", function () {
                state.removePlayer(id);
                console.log("User " + id + " disconnected");
                listConnectedPlayers(connectedRoom);
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
    app.use("/r" + rooms.length, express.static("play"));
    console.log("Added room /r" + rooms.length - 1);
    var room = new engine.Room();
    rooms.push(room);
}