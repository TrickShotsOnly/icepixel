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
      socket.on("play", function(res, pos) {
        if (res == 0) {
					//Animate fade
					var start = $("#start");
					start.animate({
						opacity: 0
					}, 300);
					start.promise().done(function() {
						start.hide();
					});

					var body = $("body");
					body.css("cursor", "none");

          play(pos);
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
