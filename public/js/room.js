$(document).ready(function () {
    // Nho sua lai khi xong viec
    $("#setMap").hide();
    $("#playGame").hide();
    $("#setDevice").show();
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

    socket.on("deviceList", function (data) {
        console.log("Devicelist received" + JSON.stringify(data))
        $("#deviceList").html("");
        data.forEach(device => {
            $("#deviceList").append('<div class="device">' + device + '</div>');
        });
    });

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
        //console.log("Go to new room" + JSON.stringify(newRoom));
        document.cookie = "userRoom=" + newRoom.roomName + ";path=/";
        $("#setDevice").hide();
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

    $(document).on("click", "#deviceList div.device", function () {
        let deviceName = $(this).text();
        //console.log("Device Name " + deviceName + " has been clicked");
        socket.emit("room-setDevice", deviceName);
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
        //console.log("Room Name " + roomName + " has been clicked");
        socket.emit("room-gotoRoom", roomName);
    });



    //GAME------------------------------------------------------------------
    //GAME Variables---------------------------------------------------------------
    var currentX=0;
    var currentY=0;
    var oldPositionX = 0;
    var oldPositionY = 0;
    var oldPositionClass = "unknow";
    var yourMap;
    

    //DRAW------------------------------------------------------------------
    var drawMap = function(){
        let init = '<tbody>';
        for (let i = 0; i < 10; i++) {
            let row = '<tr>';
            for (let j = 0; j < 10; j++) {
                if (yourMap[j][i]==0){
                    row += '<td id="' + i + j + '" class="empty"></td>';
                } else {
                    row += '<td id="' + i + j + '" class="alive"></td>';
                }
            }
            row += '</tr>';
            init += row;
        }
        init += '</tbody>';
        return init;
    }
    socket.on("yourMap",function(map){
        yourMap = map;
        console.log("My Map: ");
        console.log(map);
        $("#playerMap").html(drawMap());
    });
    var initMap = function (classValue) {
        let init = '<tbody>';
        for (let i = 0; i < 10; i++) {
            let row = '<tr>';
            for (let j = 0; j < 10; j++) {
                row += '<td id="' + i + j + '" class="' + classValue + '"></td>';
            }
            row += '</tr>';
            init += row;
        }
        init += '</tbody>';
        return init;
    }

    $("#opponentMap").html(initMap('unknow'));

    var getCellClass = function (x, y) {
        let table = $("#opponentMap")[0];
        let cell = table.rows[y].cells[x];
        cellClass = $(cell).attr('class');
        return cellClass;
    }
    var addClassToCell = function (map,x, y, className) {
        let table;
        // map=0: playerMap
        // map=1: opponentMap
        if (map==0){
            table = $("#playerMap")[0];
        } else {
            table = $("#opponentMap")[0];
        }
        let cell = table.rows[y].cells[x];
        $(cell).addClass(className);
    }
    var removeClassFromCell = function (map,x, y, className) {
        let table;
        if (map==0){
            table = $("#playerMap")[0];
        } else {
            table = $("#opponentMap")[0];
        }
        //console.log("Table: "+table+" Map:"+map);
        //console.log("Cell of "+x+" "+y);
        let cell = table.rows[y].cells[x];
        $(cell).removeClass(className);
    }

    var redrawOpponentMap = function (hitOrMiss) {
        addClassToCell(1,currentX,currentY,hitOrMiss);
        //console.log("Add class "+hitOrMiss+" to cell "+currentX+" "+currentY);
    }
    var redrawMyMap = function (notify) {
        let x = notify[0];
        let y=notify[1];
        let hitOrMiss=notify[2];
        //console.log("Add class "+hitOrMiss+" to cell "+x+" "+y);
        addClassToCell(0,x,y,hitOrMiss);
    }
    
    socket.on("changeLocation", function (location) {
        //console.log("New location: " + JSON.stringify(location));
        let x = location[0];
        let y = location[1];
        currentX=x;
        currentY=y;
        console.log("Update location: " + x + ", " + y);// + " Old class: " + oldPositionClass);
        removeClassFromCell(1,oldPositionX, oldPositionY, 'current');
        oldPositionX = x;
        oldPositionY = y;
        oldPositionClass = getCellClass(y, x);
        addClassToCell(1,x, y, "current");
    })

    socket.on("hitOrMiss", function (hitOrMiss) {
        console.log("On hitOrMiss: "+hitOrMiss);
        redrawOpponentMap(hitOrMiss);
    });
    socket.on("opponentHitOrMissYou", function (notify) {
        console.log("On opponent hitOrMiss: "+notify);
        redrawMyMap(notify);
    });

});