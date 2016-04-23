var numRooms;
var id;
var socket = io();
var canvas;
var ctx;

var curRoom;

var lastUpdate;

var playing = false;
var playerIndex = 0;

var WORLD_START_X = -1500;
var WORLD_START_Y = -1000;
var WORLD_END_X = 4300;
var WORLD_END_Y = 3000;
var GRID_SIZE = 75;

var camX,
  camY;

var mouseX,
  mouseY;

var map;

var popupFade = 0;
var popupTime = 100;
var killPopup = false;
var killedPopup = false;
var otherUsername;

var keypress = {},
  prevKeypress = {
    init: 0
  },
  left = 37,
  up = 38,
  right = 39,
  down = 40,
  altLeft = 65,
  altUp = 87,
  altRight = 68,
  altDown = 83;

$(document).ready(function() {
  $("#start").css({
    opacity: 0
  });
  $("#start").animate({
    opacity: 1
  }, 200);

  socket.on("numRooms", function(data) {
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
      x: mouseX + camX,
      y: mouseY + camY
    }
    socket.emit("fire", pos);
  });

  socket.on("map", function(roomMap) {
    map = roomMap;
  });

  socket.emit("requestIndex");
  socket.on("index", function(index) {
    playerIndex = index;
  });

  document.addEventListener("keydown", function(evt) {
    keypress[evt.keyCode] = true;
    if (evt.keyCode == 32) {
      var pos = {
        x: mouseX + camX,
        y: mouseY + camY
      }
      socket.emit("fire", pos);
    }
    inputUpdate();
  });

  document.addEventListener("keyup", function(evt) {
    delete keypress[evt.keyCode];
    inputUpdate();
  })

  update();

  socket.on("roomUpdate", function(room) {
    curRoom = room;
  });

  socket.on("kill", function(username) {
    otherUsername = username;
    popupFade = 0;
    killPopup = true;
  });

  socket.on("killed", function(username) {
    otherUsername = username;
    popupFade = 0;
    killedPopup = true;
  });

  camX = 0;
  camY = 0;
}

function update() {
  var now = Date.now();
  var delta = now - lastUpdate;
  lastUpdate = now;

  if (curRoom) {
    for (i = 0; i < curRoom.players.length; i++) {
      updatePlayer(curRoom.players[i], delta);
    }
    for (i = 0; i < curRoom.projectiles.length; i++) {
			updateProjectile(curRoom.projectiles[i], delta);
    }

    //var lerp = 9;
    //camX += (curRoom.players[playerIndex].pos.x - camX - (canvas.width / 2)) * 1/delta * lerp;
    //camY += (curRoom.players[playerIndex].pos.y - camY - (canvas.height / 2)) * 1/delta * lerp;

    camX = curRoom.players[playerIndex].pos.x - (canvas.width / 2);
    camY = curRoom.players[playerIndex].pos.y - (canvas.height / 2);
  }
  render();
  window.requestAnimationFrame(update);
}

function render() {
  //Clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (killedPopup) {
    ctx.globalAlpha = (popupFade + 1) / popupTime;
  }

  for (i = WORLD_START_X; i < WORLD_END_X; i += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(WORLD_START_X + i - camX, WORLD_START_Y - camY);
    ctx.lineTo(WORLD_START_X + i - camX, WORLD_END_Y - camY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.stroke();
    ctx.fill();
  }

  for (i = WORLD_START_Y; i < WORLD_END_Y; i += GRID_SIZE) {
    ctx.beginPath();
    ctx.moveTo(WORLD_START_X - camX, WORLD_START_Y + i - camY);
    ctx.lineTo(WORLD_END_X - camX, WORLD_START_Y + i - camY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.stroke();
    ctx.fill();
  }

  if (map) {
    //Draw map
    for (var i = 0; i < map.walls.length; i++) {
      if (map.walls.hasOwnProperty(i)) {
        ctx.beginPath();
        ctx.moveTo(map.walls[i].pos1.x - camX, map.walls[i].pos1.y - camY);
        ctx.lineTo(map.walls[i].pos2.x - camX, map.walls[i].pos2.y - camY);
        ctx.lineWidth = 5;
        ctx.strokeStyle = map.walls[i].color;
        ctx.stroke();
        ctx.fill();
      }
    }
  }
  //Draw room
  if (curRoom) {
    //Projectiles
    for (i = 0; i < curRoom.projectiles.length; i++) {
      if (curRoom.projectiles[i] && !curRoom.projectiles[i].dead) {
        ctx.fillStyle = "#2199ff";
        ctx.globalAlpha = (curRoom.projectiles[i].lifeTime - curRoom.projectiles[i].timer) / curRoom.projectiles[i].lifeTime;
        ctx.fillRect(curRoom.projectiles[i].pos.x - 10 - camX, curRoom.projectiles[i].pos.y - 10 - camY, 20, 20);
        ctx.globalAlpha = 1;
      }
    }
    //Players
    for (i = 0; i < curRoom.players.length; i++) {
      if (curRoom.players[i] && !curRoom.players[i].dead) {
        ctx.fillStyle = curRoom.players[i].color;
        ctx.fillRect(curRoom.players[i].pos.x - (curRoom.players[i].width / 2) - camX, curRoom.players[i].pos.y - (curRoom.players[i].width / 2) - camY, curRoom.players[i].width, curRoom.players[i].height);
        ctx.font = "20px Play";
        ctx.textAlign = "center";
        ctx.fillText(curRoom.players[i].username, curRoom.players[i].pos.x - camX, curRoom.players[i].pos.y + curRoom.players[i].height - camY + 10);
      }
    }
  }

  popupFade++;

  if (killPopup) {
    ctx.globalAlpha = (popupTime - popupFade + 1) / popupTime;
    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Play";
    ctx.textAlign = "center";
    ctx.fillText("Killed " + otherUsername, canvas.width / 2, canvas.height * (1 / 4));
    ctx.globalAlpha = 1;
  }

  if (killedPopup) {
    ctx.globalAlpha = (popupTime - popupFade + 1) / popupTime;
    ctx.fillStyle = "#ffffff";
    ctx.font = "30px Play";
    ctx.textAlign = "center";
    ctx.fillText("Killed by " + otherUsername, canvas.width / 2, canvas.height * (1 / 4));
    ctx.globalAlpha = 1;
  }

  if (popupFade > popupTime) {
    killPopup = false;
    killedPopup = false;
  }

  drawScoreboard();
  drawCursor();
}

function drawScoreboard() {
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Play";
  ctx.textAlign = "left";
  if (curRoom) {
    for (i = 0; i < curRoom.players.length; i++) {
      ctx.fillText(curRoom.players[i].username + " - " + curRoom.players[i].score, 30, 30 + (i * 30));
    }
  }

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

function inputUpdate() {
  var input = {
    left: false,
    right: false,
    up: false,
    down: false
  }

  if (keypress[left] || keypress[altLeft]) input.left = true;
  if (keypress[right] || keypress[altRight]) input.right = true;
  if (keypress[up] || keypress[altUp]) input.up = true;
  if (keypress[down] || keypress[altDown]) input.down = true;

  socket.emit("inputUpdate", input);
}
