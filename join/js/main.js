$("#form").submit(function () {
    console.log("Joining");
    join(0);
    return false;
});

console.log(window.location.hostname);
console.log(window.location.port);

function join(room) {
    //window.location.replace("http://localhost:9000" + "/r" + room);
    if (window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1") {
        window.location.replace("http://localhost:9000" + "/r" + room);
    }
}