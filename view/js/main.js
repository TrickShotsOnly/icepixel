var socket;
var id;
var numRooms;

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

function join(room) {
    var username = $("#m").val();
    $.post("roomrequest", {
        room: room,
        username: username
    }, function (data) {
        if (data.error == 0) {
            id = data.id;
            notify("Successfully joined!", "#27de00");
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