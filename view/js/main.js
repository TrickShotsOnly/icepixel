var numRooms;
var id;
var socket = io();
var canvas;
var ctx;
var curRoom;
var playing = false;

var keypress = {},
  left = 37,
  up = 38,
  right = 39,
  down = 40;

$(document).ready(function() {
  $("#start").animate({
    opacity: 1
  }, 200);

  $.get("getroomdata", function(data) {
    for (i = 0; i < data; i++) {
      $("#s").append('<option value="' + i + '">Room ' + i + '</option>');
    }
  });

  $("#form").on("submit", function(event) {
    event.preventDefault();
    join($("#s").val(), $("#m").val());
    return false;
  });
});

function join(room, username) {
  socket.emit("joinRoom", room);
  if (username == "" || username == null) {
    notify("Please enter a username", "red");
    return;
  }
  socket.on("joinRoomResponse", function(res) {
    if (res == 0) {
      socket.emit("username", username);
      socket.on("play", function(res) {
        if (res == 0) {
          play();
        } else {
          notify("Please enter a username", "red");
        }
      });
    } else {
      notify("Room not available.", "red");
    }
  })
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

function play(id) {
  var start = $("#start");
  start.animate({
    opacity: 0
  }, 300);
  start.promise().done(function() {
    start.hide();
  });

  $("#content").append("<canvas id = 'ctx'>");
  canvas = document.getElementById("ctx");
  resize();
  ctx = canvas.getContext("2d");

  document.addEventListener("keydown", function(evt) {
    keypress[evt.keyCode] = true;
  });

  document.addEventListener("keyup", function(evt) {
    delete keypress[evt.keyCode];
  })

  update();

  socket.on("roomUpdate", function(room) {
    curRoom = room;
  });
}

function update() {
  var input = {
    x: 0,
    y: 0
  }

  if (keypress[left]) input.x -= 1;
  if (keypress[right]) input.x += 1;
  if (keypress[up]) input.y -= 1;
  if (keypress[down]) input.y += 1;

  socket.emit("inputUpdate", input);

  render();
  window.requestAnimationFrame(update);
}

function render() {
  //Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //Draw players
  if (curRoom) {
    for (i = 0; i < curRoom.players.length; i++) {
      ctx.fillStyle = "#27de00";
      ctx.fillRect(curRoom.players[i].x, curRoom.players[i].y, 40, 40);
    }
  } else {
    console.log("Room undefined");
  }
}

$(window).resize(resize);

function resize() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}
