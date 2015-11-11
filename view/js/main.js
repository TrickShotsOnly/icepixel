var numRooms;
var id;
var socket = io();

$(document).ready(function () {
    $.get("getroomdata", function (data) {
        for (i = 0; i < data; i++) {
            $("#s").append('<option value="' + i + '">Room ' + i + '</option>');
        }
    });

    $("#form").on("submit", function (event) {
        event.preventDefault();
        join($("#s").val());
        return false;
    });
});

function join(room){
  socket.emit("joinRoom", room);
  socket.on("joinRoomResponse", function(res){
    if(res == 0){
      console.log("k");
    }else{
      notify("Room not available.", "red");
    }
  })
}

/*function join(room) {
    var username = $("#m").val();
    $.post("roomrequest", {
        room: room,
        username: username
    }, function (data) {
        if (data.error == 0) {
            notify("Connecting", "#27de00");
            play(id);
        } else {
            if (data.error == 1) {
                notify("Room not available", "#ff0000");
            } else if (data.error == 2) {
                notify("Please enter a username", "#ff0000");
            } else if (data.error == 3) {
                notify("Username not allowed", "#ff0000");
            }
        }
    });
}*/

function play(id){
  notify("hi");
  socket.emit("auth", id);
  socket.on("jerror", function(){
    notify("Connection error, please reload", "#red");
  });
  socket.on('join', function(username){
    notify("Successfully connected with username " + username, "#27de00");
  });
}

function notify(message, color) {
    var box = $("#notify-box");
    box.html(message);
    if (color == null) {
        color = "#27de00";
    }
    box.css("background-color", color);
    box.css("height", "auto");
    var height = box.css("height");
    box.css("height", "0px");
    box.animate({
        height: height
    }, 400);
}
