var numRooms;
var id;
var socket = io();

var renderer;
var stage;
var graphics;
var scoreboard;

var curRoom;
var curPos = new Vec2(0, 0);

var lastUpdate;

var playing = false;
var playerIndex = 0;

var WORLD_START_X = -500;
var WORLD_START_Y = -500;
var WORLD_END_X = 4500;
var WORLD_END_Y = 4000;
var GRID_SIZE = 100;

var WIDTH,
  HEIGHT;

var camX,
  camY = 0;

var mouseX,
  mouseY;

var map;

var popupTimer = 0;
var popupDur = 100;
var killPopup = false;
var killedPopup = false;
var popup;

var pulseDur = 6000;

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
  altDown = 83,
  space = 32;

function play(pos) {

	curPos = pos;

  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  renderer = new PIXI.autoDetectRenderer(WIDTH, HEIGHT, {
    backgroundColor: 0x000000,
    antialias: true
  });
  document.body.appendChild(renderer.view);

  stage = new PIXI.Container();
  graphics = new PIXI.Graphics();
  stage.addChild(graphics);

  scoreboard = new PIXI.Text("", {
    font: "20px Play",
    fill: 0xffffff,
    align: "left"
  });
  scoreboard.position.x = 20;
  scoreboard.position.y = 20;
  stage.addChild(scoreboard);

  popup = new PIXI.Text("", {
    font: "40px Play",
    fill: 0xffffff,
    align: "center"
  });

	popup.anchor.x = 0.5;
	popup.anchor.y = 0.5;

  popup.position.x = WIDTH / 2;
  popup.position.y = HEIGHT * (1 / 3);
  stage.addChild(popup);

  document.addEventListener("mousemove", function(evt) {
    mouseX = evt.clientX;
    mouseY = evt.clientY;
  });

  document.addEventListener("click", function(evt) {
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

	socket.on("subtractIndex", function() {
		playerIndex -= 1;
		console.log(playerIndex);
	})

  document.addEventListener("keydown", function(evt) {
    keypress[evt.keyCode] = true;
    if (evt.keyCode == space) {
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

  socket.on("roomUpdate", function(room) {
    curRoom = room;
  });

  socket.on("kill", function(username) {
    var text = "Killed " + username;
    popup.text = text;
    popupTimer = 0;
  });

  socket.on("killed", function(username) {
    var text = "Killed by " + username
    popup.text = text;
    popupTimer = 0;
  });

  update();
}

function update() {
  var now = Date.now();
  var delta = now - lastUpdate;
  lastUpdate = now;

  if (curRoom) {
    for (i = 0; i < curRoom.players.length; i++) {
      if (i == playerIndex) {
				curPos.x += (curRoom.players[playerIndex].pos.x - curPos.x) * 0.02 * delta;
        curPos.y += (curRoom.players[playerIndex].pos.y - curPos.y) * 0.02 * delta;
      } else {
        updatePlayer(curRoom.players[i], delta);
      }
    }

    for (i = 0; i < curRoom.projectiles.length; i++) {
      updateProjectile(curRoom.projectiles[i], delta);
    }

		//var lerp = 9;
		//camX += (curPos.x - camX - (WIDTH / 2)) * 1/delta * lerp;
		//camY += (curPos.y - camY - (HEIGHT / 2)) * 1/delta * lerp;

    camX = curPos.x - (WIDTH / 2) - 20;
    camY = curPos.y - (HEIGHT / 2) - 20;
  }
  render();
  window.requestAnimationFrame(update);
}

function render() {
  //Clear
  graphics.clear();

  for (i = WORLD_START_X - WIDTH; i < (WORLD_END_X + WIDTH) / GRID_SIZE; i++) {
    graphics.beginFill();
    graphics.moveTo(WORLD_START_X - WIDTH + (i * GRID_SIZE) - camX, WORLD_START_Y - HEIGHT - camY);
    graphics.lineTo(WORLD_START_X - WIDTH + (i * GRID_SIZE) - camX, WORLD_END_Y + HEIGHT - camY);
    graphics.lineStyle(2, 0xb0d6e6, Math.abs((Date.now() % pulseDur) / pulseDur - 0.5) / 4 + 0.1);
    graphics.endFill();
  }

  for (i = WORLD_START_Y - HEIGHT; i < (WORLD_END_Y + HEIGHT) / GRID_SIZE; i++) {
    graphics.beginFill();
    graphics.moveTo(WORLD_START_X - WIDTH - camX, WORLD_START_Y - HEIGHT + (i * GRID_SIZE) - camY);
    graphics.lineTo(WORLD_END_X + WIDTH - camX, WORLD_START_Y - HEIGHT + (i * GRID_SIZE) - camY);
    graphics.lineStyle(2, 0xb0d6e6, Math.abs((Date.now() % pulseDur) / pulseDur - 0.5) / 4 + 0.1);
    graphics.endFill();
  }

  if (map) {
    //Draw map
    for (var i = 0; i < map.walls.length; i++) {
      graphics.beginFill();
      graphics.lineStyle(5, map.walls[i].color, map.walls[i].opacity);
      graphics.moveTo(map.walls[i].pos1.x - camX, map.walls[i].pos1.y - camY);
      graphics.lineTo(map.walls[i].pos2.x - camX, map.walls[i].pos2.y - camY);
      graphics.lineStyle(0, 0xffffff);
      graphics.endFill();
    }
  }
  //Draw room
  if (curRoom) {
    //Projectiles
    for (i = 0; i < curRoom.projectiles.length; i++) {
      graphics.beginFill(0x2199ff, (curRoom.projectiles[i].lifeTime - curRoom.projectiles[i].timer) / curRoom.projectiles[i].lifeTime);
      graphics.drawRect(curRoom.projectiles[i].pos.x - 10 - camX, curRoom.projectiles[i].pos.y - 10 - camY, 20, 20);
      graphics.endFill();
    }
    //Players
    for (i = 0; i < curRoom.players.length; i++) {
      graphics.beginFill(curRoom.players[i].color);
      if (i != playerIndex) {
        graphics.drawRect(curRoom.players[i].pos.x - (curRoom.players[i].width / 2) - camX, curRoom.players[i].pos.y - (curRoom.players[i].width / 2) - camY, curRoom.players[i].width, curRoom.players[i].height);

      } else {
        graphics.drawRect(curPos.x - (curRoom.players[i].width / 2) - camX, curPos.y - (curRoom.players[i].width / 2) - camY, curRoom.players[i].width, curRoom.players[i].height);
      }
      graphics.endFill();
      //ctx.fillText(curRoom.players[i].username, curRoom.players[i].pos.x - camX, curRoom.players[i].pos.y + curRoom.players[i].height - camY + 10);
    }
  }

  if (popupTimer > popupDur) {
    killPopup = false;
    killedPopup = false;
    popup.text = "";
  } else {
    popup.alpha = (popupDur - popupTimer + 1) / popupDur;
    popupTimer++;
  }

  drawScoreboard();
  drawCursor();

  renderer.render(stage);
}

function drawScoreboard() {
  var text = "";
  if (curRoom) {
    for (i = 0; i < curRoom.players.length; i++) {
      text += curRoom.players[i].username + " - " + curRoom.players[i].score + "\n";
    }
  }
  scoreboard.text = text;
}

function drawCursor() {
  graphics.beginFill(0xffffff);
  graphics.drawRect(mouseX - 15, mouseY - 1, 30, 2);
  graphics.drawRect(mouseX - 1, mouseY - 15, 2, 30);
  graphics.endFill();
}

$(window).resize(resize);

function resize() {
  WIDTH = window.innerWidth;
  HEIGHT = window.innerHeight;

  if (popup && renderer) {
    popup.position.x = WIDTH / 2;
    popup.position.y = HEIGHT * (1 / 3);

    renderer.resize(WIDTH, HEIGHT);
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

function colorToNum(string) {
  return Number(string.replace("#", "0x"));
}
