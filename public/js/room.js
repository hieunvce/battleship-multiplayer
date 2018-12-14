$(document).ready(function () {
    // Nho sua lai khi xong viec
    $("#setMap").hide();
    $("#playGame").show();
    $("#setRoom").hide();

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
        console.log("Roomlist received" + JSON.stringify(data))
        $("#roomList").html("");
        data.forEach(room => {
            if (room.numberOfPlayers < 2) {
                $("#roomList").append('<div class="room">' + room.roomName + '</div>');
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
        console.log("Go to new room" + JSON.stringify(newRoom));
        document.cookie = "userRoom=" + newRoom.roomName + ";path=/";
        $("#setRoom").hide();
        $("#playGame").show(2000);
        $("#setMap").hide();
    });
    socket.on("joinRoomFail", function () {
        $("#info").html(playerInfo.username);
    });

    socket.on("disconnect", function () {
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



    //GAME------------------------------------------------------------------
    //DRAW------------------------------------------------------------------
    var initMap = '<tbody>';
    for (let i = 0; i < 10; i++) {
        let row = '<tr>';
        for (let j = 0; j < 10; j++) {
            row += '<td id="' + i + j + '" class="empty"></td>';
        }
        row += '</tr>';
        initMap += row;
    }
    initMap+='</tbody>';
    $("#playerMap").html(initMap);
    $("#opponentMap").html(initMap);
    
    var getCellClass = function(x,y){
        let table = $("#opponentMap")[0];
        let cell = table.rows[x].cells[y];
        cellClass = $(cell).attr('class');
        return cellClass;
    }
    var setCell = function(x,y,className){
        let table = $("#opponentMap")[0];
        let cell = table.rows[x].cells[y];
        $(cell).toggleClass(className);
    }
    
    //GAME---------------------------------------------------------------
    var oldPositionX=0;
    var oldPositionY=0;
    var oldPositionClass="";

    socket.on("playerPosition", function(position){
        let x=position.x;
        let y=position.y;
        setCell(oldPositionX,oldPositionY,oldPositionClass);
        oldPositionX=x;
        oldPositionY=y;
        oldPositionClass=getCellClass(x,y);
        setCell(x,y,"current");
    })

    

});