$(document).ready(function () {

    function getCookie(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }
    var logedInUser = getCookie("username");
    console.log("Cookie username: " + logedInUser);

    var socket = io("http://localhost:3000");
    socket.emit("username", logedInUser);

    socket.on("roomList", function (data) {
        $("#roomList").html("");
        data.forEach(room => {
            $("#roomList").append(
                '<div class="room">' + room + '</div>'
            );
        });
    });

    socket.on("playerInfo", function (playerInfo) {
        console.log("Player info: " + playerInfo);
        $("#playername").html(playerInfo.username);
    });
});