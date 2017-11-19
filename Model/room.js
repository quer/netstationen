module.exports = function (id, roomData, updateRoomListFunction) {
	console.log(roomData);
    this.id = id;
    this.name = roomData.name? roomData.name : "error";
    this.image = roomData.image? roomData.image : "";
    this.disable = roomData.disable? roomData.disable : [];
    this.slot = roomData.bots? roomData.bots : [];
    this.slots = 48;

    this.updateRoomListFunction = updateRoomListFunction;
    
    this.addUser = function (user){
    	if (!this.isRoomFull()) {
        	var roomSlot = this.getRandomSlot();
        	roomSlot.user = user;
        	user.room = this;
        	this.slot[this.slot.length] = roomSlot;
        	this.updateRoom();
        	this.updateRoomListFunction();
        	return true;
      	}else{
        	return false;
      	}
    }
    this.removeUser = function (user){
      	for (var i = 0; i < this.slot.length; i++) {
        	if(this.slot[i].user.name == user.name){
	          	this.slot.splice(i,1);
	          	this.updateRoomListFunction();
	          	return true;
	          	break;
        	}
      	}
      	return false;
    }
    this.moveUser = function (data, user) {
    	if(!data.x || !data.y){
    		return false;
    	}
    	var y = data.y;
    	var x = data.x;
      	var returnY = this.getYposs(y);
      	if(returnY === false){
        	return false;
      	}
      	var returnX = this.getXposs(x, returnY);
      	if(this.isSlotFree(returnX, returnY)) {
        	var userPlace = this.getUserInRoom(user);
        	userPlace.y = returnY;
        	userPlace.x = returnX;
        	this.updateRoom();
        	return true;
      	}else{
        	return false;
      	}
    }
    /* SOCKET */
    this.updateRoom = function() {
      	var userList = this.createUserList();
      	//console.log(this.slot)
      	for (var i = 0; i < this.slot.length; i++) {
        	if (this.slot[i].user.socket !== undefined) {
          		this.slot[i].user.socket.emit("updateRoom", userList, this.image);
        	};
      	};
    }
    /* interne functioner */
    this.createUserList = function(){
      	var returnUserList = [];
      	for (var i = 0; i < this.slot.length; i++) {
        	returnUserList[returnUserList.length] = {
        		x: this.slot[i].x, 
        		y: this.slot[i].y, 
    			name: this.slot[i].user.name, 
    			item: this.slot[i].user.item, 
    			text: (this.slot[i].user.text ? this.slot[i].user.text.text : null) 
        	};
      	}
      	return returnUserList;
    }
    this.isSlotFree = function (x, y){
      	var row = 4;
      	if (y % 2) {
        	row = 5;
      	}
      	if((y < 0) || (x < 0) || (y > 8) || (x > row)){
        	return false;
      	}
      	for (var i = 0; i < this.slot.length; i++) {
        	var slot = this.slot[i];
        	if (slot.y == y && slot.x == x) {
          		return false;
        	};
      	};
      	for (var i = 0; i < this.disable.length; i++) {
        	var disable = this.disable[i];
        	if (disable.y == y && disable.x == x) {
          		return false;
        	};
      	};
      	return true;
    }
    this.isRoomFull = function() {
      	var users = this.slot.length;
      	var disable = this.disable.length;
      	if (users+disable >= this.slots) {
        	// vis alle rum er fyldt vil den prøve et ikke eksterne rum
        	return true;
      	}
      	return false;
    }
    this.getRandomSlot = function() {
      	var y = Math.floor((Math.random() * 9) + 0);
      	if (y % 2) {
        	var x = Math.floor((Math.random() * 6) + 0);
      	}else{
        	var x = Math.floor((Math.random() * 5) + 0);
      	}
      	if (this.isSlotFree(x, y)) {
        	return {x: x, y: y};
      	}else{
        	return this.getRandomSlot();
      	}
    }
    this.getYposs = function (yClick) {
      	var returnVar = 0;
      	var i = -1;
      	if (yClick < 39) { return false; };
      	while (returnVar < yClick) {
        	if (i % 2) {
          	returnVar += 32;
        	}else{
          	returnVar += 39;
        	}
        	i++;
      	}
      	return i-1;
    }
    this.getXposs = function (xClick, yPoss) {
      	var returnVar = 40;
      	if (yPoss % 2) {
        	returnVar = 5; 
      	};
      	var i = 0;
      	while (returnVar < xClick) {
        	returnVar += 69;
        	i++;
      	}
      	return i-1;
    }
    this.getUserInRoom = function(user) {
      	for (var i = 0; i < this.slot.length; i++) {
         	if(this.slot[i].user.name == user.name){
          		return this.slot[i];
         	}
      	};
      	return false;
    }
    this.updateText = function () {
    	var needUpdate = false;
  		for (var i = 0; i < this.slot.length; i++) {
    		if(this.slot[i].user.text !== undefined && this.slot[i].user.text.type == "user"){
      			if ((this.slot[i].user.text.time + 10000) < new Date().getTime()) {
        			delete this.slot[i].user.text;
        			needUpdate = true;
      			};
    		}else if (this.slot[i].user.text !== undefined && this.slot[i].user.text.type == "bot") {
    			if(this.slot[i].user.text.time === undefined){
    				this.slot[i].user.text.time = new Date().getTime();
    			}
      			if ((this.slot[i].user.text.time + 10000) < new Date().getTime()) {
        			this.slot[i].user.text.time = new Date().getTime();
			        this.slot[i].user.text.loop += 1;
			        if (this.slot[i].user.text.loop >= this.slot[i].user.text.loopText.length) {
			          	this.slot[i].user.text.loop = 0;
			        };
        			this.slot[i].user.text.text = this.slot[i].user.text.loopText[this.slot[i].user.text.loop];
      				needUpdate = true;
      			};
    		};
  		};
  		if(needUpdate){
  			this.updateRoom();
  		}
	}
	this.update = function (tick) {
		this.updateText();
	}
	this.setTextonUser = function (text, user) {
		var userPlace = this.getUserInRoom(user);
		userPlace.user.text = {
			type: "user", 
			text: text, 
			time: new Date().getTime()
		};
		this.updateRoom();
	}
}