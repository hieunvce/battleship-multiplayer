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
class Ship {
    constructor(name, start, end) {
        this.name = name;
        this.sunk = false;

        this.spots = [];

        if (start.y == end.y) {
            //Neu tau nam ngang
            for (let i = start.x; i <= end.x; i++) {
                this.spots.push({
                    x: i, y: start.y, hit: false
                });
            }
        } else {
            //Neu tau nam doc
            for (let i = start.y; i <= end.y; i++) {
                this.spots.push({
                    x: start.x, y: i, hit: false
                })
            }
        }
    }

    applyHit(target) {
        // Kiem tra xem ban trung khong
        let foundSpot = this.spots.find((spot) => spot.x == target.x && spot.y == target.y);
        if (!isEmpty(foundSpot)) {
            let index = this.spots.indexOf(foundSpot);
            console.log("Target: " + JSON.stringify(target));
            console.log("Apply Hit: name= " + this.name + " spot=" + JSON.stringify(this.spots[index]));
            this.spots[index].hit = true;

            // Neu tat ca ca diem da bi ban thi tau chim
            if (this.spots.every(spot => spot.hit === true)) {
                this.sunk = true;
            }
        }
    }
}
class Map {
    constructor() {
        let self = this;
        this.sunkenShips = 0;
        this.map = [];
        for (let i = 0; i < 10; i++) {
            this.map.push(new Array(10).fill(0));
        }
        this.ships = [];

        // Place random a ship on field
        function placeRandom(length) {
            let randomX = -5;
            let randomY = -5;
            // Random a place
            while (randomX + length < 0 || randomX + length > 9 || randomY + length < 0 || randomY + length > 9) {
                randomX = Math.floor(Math.random() * 10);
                randomY = Math.floor(Math.random() * 10);
            }
            //Random a direction 'H' or 'V'
            let randomDir = Math.random() < 0.5 ? "H" : "V";
            let ship;
            if (randomDir == "V") {
                ship = new Ship(`ship${length + 1}`, {
                    x: randomX, y: randomY
                }, {
                        x: randomX, y: randomY + length
                    });
            } else {
                ship = new Ship(`ship${length + 1}`, {
                    x: randomX, y: randomY
                }, {
                        x: randomX + length, y: randomY
                    });
            }
            // check if spots have already been taken:
            let spotisValid = true
            ship.spots.forEach(spot => {
                if (self.map[spot.x][spot.y] != 0) {
                    spotisValid = false;
                }
            });

            if (spotisValid) {
                self.ships.push(ship);
                ship.spots.forEach(spot => {
                    self.map[spot.x][spot.y] = 1;
                });
            }

            return spotisValid;
        }

        // NOTE ship lengths of 5,4,4,3,1  need to be -1
        let stockShips = [4, 3, 3, 2, 1];
        stockShips.forEach(length => {
            let happened;
            do {
                happened = placeRandom(length);
            } while (!happened)

        });
        let count = 0;
        this.map.forEach(row => row.forEach(coord => {
            if (coord == 1) {
                count++;
            }
        }));
        console.log("Map: " + this.map);
        console.log("Ships: " + JSON.stringify(this.ships));

        this.width = 10;
        this.height = 10;
        this.aliveCell = 18;
        this.x = 0;
        this.y = 0;
        this.maxX = 9;
        this.maxY = 9;
    }
    initUnknowMap() {
        let emptyMap = [];
        for (let i = 0; i < this.width; i++) {
            let row = [];
            for (let j = 0; j < this.height; j++) {
                row[j] = 'unknow';
            }
            emptyMap.push(row);
        }
        this.map = emptyMap;
    }

    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.init();
        this.maxX = width - 1;
        this.maxY = height - 1;
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
    getX() {
        return this.x;
    }
    getY() {
        return this.y;
    }
    getLocation() {
        let location = [];
        location.push(this.x);
        location.push(this.y);
        return location;
    }
    changeLocation(key) {
        switch (key) {
            case 'U':
                if (this.y == 0) {
                    this.y = this.maxY;
                } else {
                    this.y--;
                }
                break;
            case 'D':
                if (this.y == this.maxY) {
                    this.y = 0;
                } else {
                    this.y++;
                }
                break;
            case 'L':
                if (this.x == 0) {
                    this.x = this.maxX;
                } else {
                    this.x--;
                }
                break;
            case 'R':
                if (this.x == this.maxX) {
                    this.x = 0;
                } else {
                    this.x++;
                }
        }
    }
    fire(key) {
        switch (key) {
            case 'O':
                console.log("Location: " + this.x + " " + this.y + " " + this.map[this.x][this.y]);
                switch (this.map[this.x][this.y]) {
                    case 0:
                        this.map[this.x][this.y] = "miss";
                        console.log("Miss :v");
                        break;
                    case 1:
                        this.map[this.x][this.y] = "hit";
                        this.aliveCell--;
                        console.log("Hit :D Alive cell: " + this.aliveCell);
                        for (let ship of this.ships) {
                            ship.applyHit({ "x": this.x, "y": this.y });
                            if (ship.sunk) {
                                this.sunkenShips++;
                                this.ships.splice(this.ships.indexOf(ship), 1);
                                console.log("Removed one ship. Sunken ships: " + this.sunkenShips + "/5");
                                if (this.sunkenShips >= 5) {
                                    return "youWin";
                                }
                                return "sunkAShip";
                            }
                        }
                }
                break;
            case 'C':
        }
        return this.map[this.x][this.y];
    }
}

class Player {
    constructor() {
        this.username = "";
        this.socket_id = "";
        this.device_id = "";
        this.map = new Map();
        //this.opponentMap = new Map();
        //this.opponentMap.initUnknowMap();
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
var playerList = [];
var roomList = [];
var deviceList = [];
var deviceListToChoice = [];
var turn = 1;//Luot choi dau tien thuoc ve player 1

server.listen(3000);
console.log("Server is listening at port: 3000");

io.on("connection", function (socket) {
    console.log("Socket ID connected: " + socket.id);
    socket.join("lobby");
    io.sockets.emit("deviceList", deviceList);
    io.sockets.emit("roomList", roomList);

    socket.on("room-username", function (data) {
        console.log("Loged in player: " + data);
        let playerInfo = playerList.find(player => player.getUsername() == data);
        if (!isEmpty(playerInfo)) {
            playerList[playerList.indexOf(playerInfo)].setSocketId(socket.id);
            socket.username = data;
            socket.emit("playerInfo", playerInfo);
            //console.log("Online players: " + JSON.stringify(playerList));
        } else {
            let nullplayer = new Player;
            nullplayer.setUsername("!!null!!");
            socket.emit("playerInfo", nullplayer);
        }
    });
    socket.emit("roomList", roomList);

    socket.on("room-logout", function () {
        // Remove player from online player list
        let player = playerList.find(el => el.getUsername() == socket.username);
        if (player != null && player != undefined) {
            playerList.splice(playerList.indexOf(player), 1);
        }
        console.log("Loged out: " + socket.username);
        //console.log("Online players: " + JSON.stringify(playerList));
        socket.emit("logedOut");
    });

    socket.on("room-setDevice", function (deviceName) {
        let player = playerList.find(el => el.getUsername() == socket.username);
        if (!isEmpty(player)) {
            playerList[playerList.indexOf(player)].setDeviceId(deviceName);
        }
        deviceListToChoice.splice(deviceListToChoice.indexOf(deviceName), 1);
        io.sockets.emit("deviceList", deviceListToChoice);
    });

    socket.on("room-gotoRoom", function (roomName) {
        //console.log("Go to room...");
        let room = roomList.find(el => el.getRoomName() == roomName);
        let status = false;
        let yourMap;
        if (isEmpty(room)) {
            room = new Room;
            room.setRoomName(roomName);
            let player1 = playerList.find(el => el.getUsername() == socket.username);
            room.setPlayer1(player1);
            room.setNumberOfPlayer(1);
            playerList[playerList.indexOf(player1)].setRoom(roomName);
            socket.join(room.getRoomName());
            yourMap = player1.getMap().getMap();
            status = true;
        } else {
            let player1 = room.getPlayer1();
            let player2 = room.getPlayer2();
            if (player1 != undefined && player1.getUsername() == "") {
                let player = playerList.find(el => el.getUsername() == socket.username);
                playerList[playerList.indexOf(player)].setRoom(roomName);
                room.setPlayer1(player);
                room.setNumberOfPlayer(2);
                yourMap = player.getMap().getMap();
                status = true;
            } else if (player2 != undefined && player2.getUsername() == "") {
                let player = playerList.find(el => el.getUsername() == socket.username);
                playerList[playerList.indexOf(player)].setRoom(roomName);
                room.setPlayer2(player);
                room.setNumberOfPlayer(2);
                yourMap = player.getMap().getMap();
                status = true;
            } else {
                status = false;
            }
        }
        if (status == true) {
            roomList.push(room);
            socket.emit("goToNewRoomBro", room);
            socket.emit("yourMap", yourMap);
        } else {
            socket.emit("joinRoomFail");
        }
        //console.log("Room list: " + JSON.stringify(roomList));
        socket.broadcast.emit("roomList", roomList);

    });
    socket.on("iwinhaha", function () {
        let player = playerList.find(el => el.getUsername() == socket.username);
        io.to(player.getRoom()).emit("gameOver");
        io.to(player.getRoom()).emit("gameOver");
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

app.get("/gamepad", function (req, res) {
    res.render("gamepad");
});


app.post('/login', urlencodedParser, function (req, res) {

    let username = req.body.username;
    let password = req.body.password;
    let newPlayer = new Player;
    newPlayer.setUsername(req.body.username);
    //console.log("New player: " + JSON.stringify(newPlayer));
    try {
        db.selectPlayer(username, password, function (isExist) {
            // If account exists in database
            if (isExist) {
                let foundPlayer = playerList.find(el => el.getUsername() == username);
                //console.log("Found player: " + JSON.stringify(foundPlayer));
                if (!isEmpty(foundPlayer)) {
                    // the array is defined and has at least one element
                    res.send({ "loginStatus": "onlined" });
                } else {
                    playerList.push(newPlayer);
                    res.send({ "loginStatus": "success" });
                }
            } else {
                res.send({ "loginStatus": "failed" })
            }
        });
    } catch (err) {
        console.log("Database error");
    }

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

app.post('/registerdevice', urlencodedParser, function (req, res) {
    let device_id = req.body.device_id;
    console.log("A device with device_id=" + device_id + " has connected.");
    if (!deviceList.includes(device_id)) {
        deviceList.push(device_id);
        deviceListToChoice.push(device_id);
    }
    //console.log("Device list: " + deviceList);
    io.sockets.emit("deviceList", deviceListToChoice);
    res.send({ "registerdevice": "success" })
});

var changeLocationOnOpponentMap = function (device_id, key) {
    try {
        let player = playerList.find(el => el.getDeviceId() == device_id);
        //console.log("changeLocationOnOpponentMap: Found player = " + JSON.stringify(player));
        let room = roomList.find(el => el.getRoomName() == player.getRoom());
        if (isEmpty(room)) {
            console.log("changeMap: Error: No room found.");
            return false;
        } else {
            if (room.getPlayer1().getUsername() == player.getUsername()) {
                // If key was sent by Player 1
                // Then change location on Player 2 map
                room.getPlayer2().getMap().changeLocation(key);
                let newP2Location = room.getPlayer2().getMap().getLocation();
                io.to(player.getSocketId()).emit("changeLocation", newP2Location);
                console.log("New P2 Location:  " + newP2Location);
            } else if (room.getPlayer2().getUsername() == player.getUsername()) {
                // If key was sent by Player 2
                // Then change location on Player 1 map
                room.getPlayer1().getMap().changeLocation(key);
                let newP1Location = room.getPlayer1().getMap().getLocation();
                io.to(player.getSocketId()).emit("changeLocation", newP1Location);
                console.log("New P1 Location" + newP1Location);
            }
            return true;
        }
    } catch (err) {
        console.log('Error location' + err);
    }
}

var fireInTheHole = function (device_id, key) {
    try {
        let player = playerList.find(el => el.getDeviceId() == device_id);
        //console.log("changeLocationOnOpponentMap: Found player = " + JSON.stringify(player));
        let room = roomList.find(el => el.getRoomName() == player.getRoom());
        if (isEmpty(room)) {
            console.log("changeMap: Error: No room found.");
            return false;
        } else {
            if (room.getPlayer1().getUsername() == player.getUsername()) {
                // If key was sent by Player 1
                // Then fire on current location on Player 2 map
                if (turn == 1) {
                    let hitOrMiss = room.getPlayer2().getMap().fire(key);
                    io.to(player.getSocketId()).emit("hitOrMiss", hitOrMiss);
                    let notifyToPlayer2 = room.getPlayer2().getMap().getLocation();
                    notifyToPlayer2.push(hitOrMiss);
                    io.to(room.getPlayer2().getSocketId()).emit("opponentHitOrMissYou", notifyToPlayer2)
                    console.log("New P2 hitOrMiss:  " + notifyToPlayer2);
                    if (hitOrMiss=='hit')
                    {
                        turn = 1;
                    } else {
                        turn = 2; //Den luot nguoi choi 2 ban
                    }
                    
                }
                
            } else if (room.getPlayer2().getUsername() == player.getUsername()) {
                // If key was sent by Player 2
                // Then fire on current location on Player 1 map
                if (turn == 2) {
                    let hitOrMiss = room.getPlayer1().getMap().fire(key);
                    io.to(player.getSocketId()).emit("hitOrMiss", hitOrMiss);
                    let notifyToPlayer1 = room.getPlayer1().getMap().getLocation();
                    notifyToPlayer1.push(hitOrMiss);
                    io.to(room.getPlayer1().getSocketId()).emit("opponentHitOrMissYou", notifyToPlayer1)
                    console.log("New P1 hitOrMiss:  " + notifyToPlayer1);
                    if (hitOrMiss=='hit')
                    {
                        turn = 2;
                    } else {
                        turn = 1; //Den luot nguoi choi 2 ban
                    }
                }
                
            }
            return true;
        }
    } catch (err) {
        console.log('Error hit' + err);
    }
}

app.post('/device', urlencodedParser, function (req, res) {
    let device_id = req.body.device_id;
    let key = req.body.key;
    if (key == 'U' || key == 'D' || key == 'L' || key == 'R') {
        if (changeLocationOnOpponentMap(device_id, key)) {
            res.send({ "status": "success" });
        } else {
            res.send({ "status": "failed" });
        };
    } else if (key == 'O' || key == 'C') {
        if (fireInTheHole(device_id, key)) {
            res.send({ "status": "success" });
        } else {
            res.send({ "status": "failed" });
        };
    }
});
