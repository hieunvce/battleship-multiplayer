"use strict";

var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var db = require("./playerDB");
var bodyParser = require("body-parser");
var urlencodedParser = require('urlencoded-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(urlencodedParser);

// Classes
class Map {
    constructor() {
        this.width = 10;
        this.height = 10;
        this.map = [];
        this.aliveCell = 20;
        this.currentCell = [0, 0];
    }

    init() {
        let emptyMap = [];
        for (let i = 0; i < this.width; i++) {
            let row = [];
            for (let j = 0; j < this.height; j++) {
                row[j] = 0;
            }
            emptyMap.push(row);
        }
        this.map = emptyMap;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.init();
    }

    getCell(x, y) {
        return this.map[x][y];
    }
    setCell(x, y, value) {
        this.map[x][y] = value;
    }
    getMap() {
        return this.map;
    }

}

class Player {
    constructor() {
        this.username = "";
        this.socket_id = "";
        this.device_id = "";
        this.map = new Map;
        this.room = "";
    }

    getUsername() {
        return this.username;
    }
    setUsername(username) {
        this.username = username;
    }
    getSocketId() {
        return this.socket_id;
    }
    setSocketId(socket_id) {
        this.socket_id = socket_id;
    }
    getDeviceId() {
        return this.device_id;
    }
    setDeviceId(device_id) {
        this.device_id = device_id;
    }
    getMap() {
        return this.map;
    }
    setMap(map) {
        this.map = map;
    }
    getRoom() {
        return this.room;
    }
    setRoom(room) {
        this.room = room;
    }
}

class Room {
    constructor() {
        this.roomName = "";
        this.player1 = new Player;
        this.player2 = new Player;
        this.numberOfPlayers = 0;
    }
    getRoomName() {
        return this.roomName;
    }
    setRoomName(roomName) {
        this.roomName = roomName;
    }
    getPlayer1() {
        return this.player1;
    }
    setPlayer1(player) {
        this.player1 = player;
    }
    getPlayer2() {
        return this.player2;
    }
    setPlayer2(player) {
        this.player2 = player;
    }
    getNumberOfPlayer() {
        return this.numberOfPlayers;
    }
    setNumberOfPlayer(number) {
        this.numberOfPlayers = number;
    }

}

//Helper
function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
// Mang danh sach cac nguoi choi online
var onlinePlayers = [];
var roomList = [];


server.listen(3000);
console.log("Server is listening at port: 3000");

io.on("connection", function (socket) {
    console.log("ID connected: " + socket.id);
    socket.join("lobby");

    socket.on("room-username", function (data) {
        console.log("Loged in player: " + data);
        let playerInfo = onlinePlayers.find(player => player.getUsername() == data);
        if (!isEmpty(playerInfo)) {
            onlinePlayers[onlinePlayers.indexOf(playerInfo)].setSocketId(socket.id);
            socket.username = data;
            socket.emit("playerInfo", playerInfo);
            console.log("Online players: " + JSON.stringify(onlinePlayers));
        } else {
            let nullplayer = new Player;
            nullplayer.setUsername("!!null!!");
            socket.emit("playerInfo", nullplayer);
        }
    });
    socket.emit("roomList", roomList);

    socket.on("room-logout", function () {
        // Remove player from online player list
        let player = onlinePlayers.find(el => el.getUsername() == socket.username);
        if (player != null && player != undefined) {
            onlinePlayers.splice(onlinePlayers.indexOf(player), 1);
        }
        console.log("Loged out: " + socket.username);
        console.log("Online players: " + JSON.stringify(onlinePlayers));
        socket.emit("logedOut");
    });

    socket.on("room-gotoRoom", function (roomName) {
        console.log("Go to room...");
        let room = roomList.find(el => el.getRoomName() == roomName);
        let status = false;

        if (isEmpty(room)) {
            room = new Room;
            room.setRoomName(roomName);
            let player1 = onlinePlayers.find(el => el.getUsername() == socket.username);
            room.setPlayer1(player1);
            room.setNumberOfPlayer(1);
            socket.join(room.getRoomName());
            status = true;
        } else {
            let player1 = room.getPlayer1();
            let player2 = room.getPlayer2();
            if (player1 != undefined && player1.getUsername() == "") {
                room.getPlayer1().setUsername(socket.username);
                room.setNumberOfPlayer(2);
                status = true;
            } else if (player2 != undefined && player2.getUsername() == "") {
                room.getPlayer2().setUsername(socket.username);
                room.setNumberOfPlayer(2);
                status = true;
            } else {
                status = false;
            }
        }
        if (status == true) {
            roomList.push(room);
            socket.emit("goToNewRoomBro", room);
        } else {
            socket.emit("joinRoomFail");
        }
        console.log("Room list: " + JSON.stringify(roomList));
        socket.broadcast.emit("roomList", roomList);

    });
    socket.on("disconnect", function () {
        console.log(socket.id + " has disconnected");
    });
});

app.get("/", function (req, res) {
    res.render("login");
});

app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/room", function (req, res) {
    res.render("room");
});

app.get("/setship", function (req, res) {
    res.render("setship");
});


app.post('/login', urlencodedParser, function (req, res) {

    let username = req.body.username;
    let password = req.body.password;
    let newPlayer = new Player;
    newPlayer.setUsername(req.body.username);
    console.log("New player: " + JSON.stringify(newPlayer));
    db.selectPlayer(username, password, function (isExist) {
        // If account exists in database
        if (isExist) {
            let foundPlayer = onlinePlayers.find(el => el.getUsername() == username);
            console.log("Found player: " + JSON.stringify(foundPlayer));
            if (!isEmpty(foundPlayer)) {
                // the array is defined and has at least one element
                res.send({ "loginStatus": "onlined" });
            } else {
                onlinePlayers.push(newPlayer);
                res.send({ "loginStatus": "success" });
            }
        } else {
            res.send({ "loginStatus": "failed" })
        }
    });

});

app.post('/register', urlencodedParser, function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    db.findPlayer(username, function (isExist) {
        if (isExist) {
            res.send({ "registerStatus": "usernameExisted" });
        } else {
            db.insertPlayer(username, password);
            res.send({ "registerStatus": "success" });
        }
    })
});

app.post('/gamepad',urlencodedParser, function (req, res) {
    let device_id = req.body.device_id;
    let key = req.body.key;
});
//socket.emit("playerPosition",position);
// Xu ly vuj truyen du lieu nay len socket


