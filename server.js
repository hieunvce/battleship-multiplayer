var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var db = require("./playerDB");
var bodyParser=require("body-parser");
var urlencodedParser = require('urlencoded-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(urlencodedParser);

// Mang danh sach cac nguoi choi online
var onlinePlayers = [];
var roomList = [];

server.listen(3000);
console.log("Server is listening at port: 3000");

io.on("connection", function (socket) {
    console.log("ID connected: " + socket.id);
    socket.join("lobby");

    socket.on("room-username",function(data){
        console.log("Loged in player: "+data);
        let playerInfo = onlinePlayers.find(player => player.username == data);
        if (playerInfo != null && playerInfo != undefined){
            onlinePlayers[onlinePlayers.indexOf(playerInfo)]["room"]="lobby";
            socket.username = data;
            socket.emit("playerInfo",playerInfo);
            console.log("Online players: "+JSON.stringify(onlinePlayers));
        } else {
            let nullplayer={};
            nullplayer.username="!!null!!"
            socket.emit("playerInfo",nullplayer);
        }
    });
    socket.emit("roomList",roomList);

    socket.on("room-logout",function(){
        // Remove player from online player list
        let player = onlinePlayers.find(el => el.username == socket.username);
        if (player != null && player != undefined){
            onlinePlayers.splice(onlinePlayers.indexOf(player),1);
        }
        console.log("Loged out: "+socket.username);
        console.log("Online players: "+JSON.stringify(onlinePlayers));
        socket.emit("logedOut");
    });

    socket.on("room-gotoRoom",function(roomName){
        
        let room = roomList.find(el => el.name == roomName);
        let status = false;

        if (room==undefined || room==null){
            room = {};
            room.name = roomName;
            room.p1 = socket.username;
            room.p2 = "";
            room.n=1;
            socket.join(room.name);
            status=true;
        } else {
            roomList.splice(roomList.indexOf(room),1);
            if (room.p1==""){
                room.p1=socket.username;
                room.n=2;
                status=true;
            } else if (room.p2==""){
                room.p2=socket.username;
                room.n=2;
                status=true;
            } else {
                socket.emit("joinRoomFail");
                status=false;
            }
        }
        if (status == true){
        roomList.push(room);
        socket.emit("goToNewRoomBro",room.name);
        }
        console.log("Room list: "+JSON.stringify(roomList));
        socket.broadcast.emit("roomList",roomList);
    });

    socket.on("disconnect",function(){
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

app.get("/setship",function(req, res){
    res.render("setship");
});


app.post('/login', urlencodedParser, function (req, res) {

    let username = req.body.username;
    let password = req.body.password;
    let newPlayer={};
    newPlayer["username"] = req.body.username;
    console.log("New player: "+JSON.stringify(newPlayer));
    db.selectPlayer(username, password, function (isExist) {
        // If account exists in database
        if (isExist) {
            let foundPlayer = onlinePlayers.filter(function(player){return player.username === username});
            if (foundPlayer.username==""){
                res.send({ "loginStatus":"onlined" });
            } else {
                onlinePlayers.push(newPlayer);
                res.send({"loginStatus":"success"});
            }
        } else {
            res.send({"loginStatus":"failed"})
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
