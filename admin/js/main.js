var socket = io();
var players;

$("#login-form").on("submit", function(event) {
  event.preventDefault();
  login();
  return false;
});

function login() {
  socket.emit("adminLogin", $("#m").val());
  socket.on("adminFailed", function() {
    notify("Incorrect password!", "red");
  });
  socket.on("adminSuccess", function() {
    success();
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
  }, 300);
}

function success() {
  $("#start").hide();
  $("#admin").show();
  socket.emit("numRoomsRequest", 0);
  socket.on("numRooms", function(data){
    loadRooms(data);
  });
  $("#rooms-form").on("submit", function(event) {
    event.preventDefault();
    login();
    return false;
  });
}

function loadPlayers(){
  for (i = 0; i < data; i++) {
    $("#rooms-select").text("");
    $("#rooms-select").append('<option value="' + i + '">Room ' + i + '</option>');
  }
}

function loadRooms(data){
  for (i = 0; i < data; i++) {
    $("#rooms-select").append('<option value="' + i + '">Room ' + i + '</option>');
  }
}
