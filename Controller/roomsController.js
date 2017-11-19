var Room = require('../Model/room.js');
var fs = require("fs");
module.exports = {
	rooms : [
	],
	socket: null,
	init: function (socket) {
		var that = this;
		this.socket = socket;
		var roomsList = require("path").join(__dirname, "../rooms");
		fs.readdirSync(roomsList).forEach(function(file) {
			var roomData = JSON.parse(fs.readFileSync('rooms/' + file).toString());
			that.addRoom(that.rooms.length, roomData);
		});
	},
	addRoom : function (id, roomFileData) {
		this.rooms.push(new Room(id, roomFileData, this.updateRoomList.bind(this)));
	},
	/**
	 * Add user to random room
	 * @param {User} userObj 
	 */
	addUserToRandomRoom : function (userObj) {
		var freeRoom = this.getFreeRoom();
		freeRoom.addUser(userObj);
	},
	getFreeRoom : function() {
      	for (var i = 0; i < this.rooms.length; i++) {
        	if(!this.rooms[i].isRoomFull()){
          		return this.rooms[i];
        	}
      	}
      return false;
    },
    getRoomFromId : function(roomId) {
		for (var i = 0; i < this.rooms.length; i++) {
	        if(this.rooms[i].id == roomId){
	          	return this.rooms[i];
	        }
		}
      return false;
    },
    update : function (tick) {
    	for (var i = 0; i < this.rooms.length; i++) {
    		this.rooms[i].update(tick);
    	}
    },
    updateRoomList: function () {
    	var roomCount = [];
    	for (var i = 0; i < this.rooms.length; i++) {
      		roomCount[i] = {count: this.rooms[i].slot.length, name: this.rooms[i].name};
    	};
   		this.socket.sockets.emit("updateRoomList", roomCount); 
    },
    moveUserToRoom: function (roomName, user) {
    	var toJoinRoom = this.getRoomFromName(roomName);
    	//remove user from room
    	if(toJoinRoom != null){
	    	if(user.room){
	    		user.room.removeUser(user);
	    	}
	    	if(!toJoinRoom.addUser(user)){
	    		console.log("cant join room");
	    	}

		}
    },
    getRoomFromName: function (roomName) {
    	for (var i = 0; i < this.rooms.length; i++) {
    		if(this.rooms[i].name == roomName){
    			return this.rooms[i];
    		}
    	}
    	return null;
    }
};