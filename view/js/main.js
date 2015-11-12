var numRooms;
var id;
var socket = io();
var canvas;
var ctx;
var curRoom;
var playing = false;
var playerIndex;

var mouseX,
  mouseY;

var keypress = {},
  left = 37,
  up = 38,
  right = 39,
  down = 40;

$(document).ready(function() {
  $("#start").css({
    opacity: 0
  });
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
  }, 300);
}

function play(id) {
  socket.emit("requestIndex");
  socket.on("index", function(index) {
    playerIndex = index;
    console.log(playerIndex);
  });

  var start = $("#start");
  start.animate({
    opacity: 0
  }, 300);
  start.promise().done(function() {
    start.hide();
  });

  $("#content").append("<canvas id = 'ctx'>");
  $("#ctx").css("opacity", "0");
  $("canvas").animate({
    opacity: 1
  }, 300);
  canvas = document.getElementById("ctx");
  resize();
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousemove", function(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
  });

  canvas.addEventListener("click", function(evt) {
    var pos = {
      x: mouseX,
      y: mouseY
    }
    socket.emit("fire", pos);
  });

  document.addEventListener("keydown", function(evt) {
    keypress[evt.keyCode] = true;
  });

  document.addEventListener("keyup", function(evt) {
    delete keypress[evt.keyCode];
  })

  update();

  socket.on("roomUpdate", function(room) {
    curRoom = room;
    console.log(curRoom);
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
  //Draw room
  if (curRoom) {
    //Projectiles
    for (i = 0; i < curRoom.projectiles.length; i++) {
      ctx.fillStyle = "#2199ff";
      ctx.globalAlpha = (curRoom.projectiles[i].lifeTime - curRoom.projectiles[i].timer) / curRoom.projectiles[i].lifeTime;
      ctx.fillRect(curRoom.projectiles[i].x, curRoom.projectiles[i].y, 30, 30);
      ctx.globalAlpha = 1;
    }
    //Players
    for (i = 0; i < curRoom.players.length; i++) {
      if (curRoom.players[i].index == playerIndex) {
        ctx.fillStyle = "#27de00";
        console.log("myPlayer");
      } else {
        ctx.fillStyle = "#2199ff";
      }
      ctx.fillRect(curRoom.players[i].x - 15, curRoom.players[i].y - 15, 60, 60);
    }
  }

  drawCursor();
}

function drawCursor() {
  ctx.fillStyle = "white";
  ctx.shadowColor = "white";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillRect(mouseX - 15, mouseY - 1, 30, 2);
  ctx.fillRect(mouseX - 1, mouseY - 15, 2, 30);
  ctx.shadowBlur = 0;
}

$(window).resize(resize);

function resize() {
  if (canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}
