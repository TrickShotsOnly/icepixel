var socket = io();

var room = 0;

for (i = 0; i < window.location.href.length; i++) {
    if (window.location.href.charAt(i) == "#") {
        room = charAt(i + 1);
    }
}

socket.emit('requestRoom', room);