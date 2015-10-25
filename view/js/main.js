var socket = io();
var x = 1;
var y = 1;

var input = {
  x,
  y
}

socket.on('update', function(x){
  console.log('X: ' + x);
});

window.addEventListener('keydown', function(event){
  input.x = 0;
  input.y = 0;
  switch (event.keyCode) {
    case 37: //Left
      input.x -= 1;
    case 39: //Right
      input.x += 1;
    case 38: //Up
      input.y += 1;
    case 40: //Down
      input.y -= 1;
  }
});

window.setInterval(sendInput, 15);

function sendInput(){
  socket.emit('input', input);
}
