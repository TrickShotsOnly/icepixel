var socket;

$("#form").submit(function () {
  alert('ok');
  socket = io();
  socket.emit('joinRoom', 0);
  return false;
});

function join(room) {
}