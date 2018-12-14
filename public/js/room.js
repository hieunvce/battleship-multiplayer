$(document).ready(function () {

    $("#setMap").hide();
    $("#playGame").hide();
    $("#setRoom").show();
    
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
    socket.emit("room-username", logedInUser);

    socket.on("roomList", function (data) {
        $("#roomList").html("");
        data.forEach(room => {
            if (room.n < 2) {
                $("#roomList").append('<div class="room">'+ room.name + '</div>');
            }
        });
    });

    socket.on("playerInfo", function (playerInfo) {
        console.log("Player info: " + JSON.stringify(playerInfo));
        if (playerInfo.username === "!!null!!") {
            $("#playername").html("Null player. Please relogin!");
        } else {
            $("#playername").html(playerInfo.username);
        }

    });

    socket.on("logedOut", function () {
        window.location = '/';
    });

    socket.on("goToNewRoomBro", function (newRoom) {
        document.cookie = "userRoom=" + newRoom + ";path=/";
        window.location = '/setship';
    });

    $("#logout").click(function () {
        socket.emit("room-logout");
    });

    $("#btnCreateNewRoom").click(function () {
        let newRoom = $("#newRoomName").val();
        if (newRoom != "") {
            socket.emit("room-gotoRoom", newRoom);
        } else {
            $("#newRoomName").attr("placeholder", "Please enter room name");
        }
    });

    $(document).on("click", "#roomList div.room", function () {
        let roomName = $(this).text();
        console.log("Room Name " + roomName + " has been clicked");
        socket.emit("room-gotoRoom", roomName);
    });
});