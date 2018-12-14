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
        console.log("Roomlist received"+JSON.stringify(data))
        $("#roomList").html("");
        data.forEach(room => {
            if (room.numberOfPlayers < 2) {
                $("#roomList").append('<div class="room">'+ room.roomName + '</div>');
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
        console.log("Go to new room"+JSON.stringify(newRoom));
        document.cookie = "userRoom=" + newRoom.roomName + ";path=/";
        window.location = '/setship';
    });
    socket.on("joinRoomFail",function(){
        $("#info").html(playerInfo.username);
    });

    socket.on("disconnect",function(){
        socket.emit("room-username", logedInUser);
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