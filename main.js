var items = require('./site/items.js');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var RoomsController = require('./Controller/roomsController');
RoomsController.init(io);
var UsersController = require('./Controller/usersController');

server.listen(3000);
app.use("/", express.static(__dirname + '/site/'));
app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});


io.sockets.on('connection', function (socket) {
	var userObj = null;
  	console.log("new user connection");
  	socket.on('login', function (data, callback){
  		console.log(data);
	    UsersController.login(data, userObj, socket, function (user) {
	    	if(user != null){
	    		userObj = user;
	    		callback(true);
	    	}
	    	else{
	    		callback(false);
	    	}
	    });
	});
	socket.on('move user', function (data){
  		console.log(data);
  		if(userObj != null && userObj.room != null){
  			console.log(userObj.name);
  			userObj.room.moveUser(data, userObj);
  		}else{
  			console.log("error");
  		}
	});
	socket.on('new text', function (text, callback){
		if(userObj != null && userObj.room != null){
			userObj.room.setTextonUser(text, userObj);
			callback("send!");
		}else{
			callback("text fail");
		}
	});
	socket.on('moveRoom', function (roomName, callback){
		RoomsController.moveUserToRoom(roomName, userObj);
	});
	socket.on('get user', function (x, y, callback) {
		var user = userObj.room.getUser(x, y);
		callback(user);
	})
});
var tick = 0;
var theLoop = setInterval(function () {
	//console.log("loop", tick);
  	RoomsController.update(tick);
  	++tick;
}, 2000);
