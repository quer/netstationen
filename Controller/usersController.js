var RoomsController = require('./roomsController');
var User = require('../Model/user');
var db = require('../database.js');

module.exports = new function(){
    this.users = [];
    this.getUser = function(nickname) {
        for (var i = 0; i < this.users.length; i++) {
            if(this.users[i].nickname == nickname){
                return this.users[i];
            }
        }
        return false; 
    };
    /**
     * callback if login is valid
     * @param  {object} loginData  the username and password
     * @param  {object} userObj the user object
     * @param  {function} callback the callback
     * @return {bool}           return valid or not
     */
    this.login = function (loginData, userObj, Usersocket, callback) {
        var that = this;
        if(!loginData.username && !loginData.password){
            return callback("fill all fields");
        }
        var username = db.real(loginData.username);
        var password = db.real(loginData.password);
        if(userObj != null){
            return callback(null);
        }else if (username != "" && password != "") {
            var query = 'SELECT `id` FROM `user` WHERE `name` = ' + username + ' AND `pass` = ' + password;
            console.log(query);
            db.query(query, function (rows) {
                console.log(rows.length);
                if(rows.length > 0){
                    var newUserObj = this.newUser(rows[0].id, loginData.username, Usersocket);
                    RoomsController.addUserToRandomRoom(newUserObj);
                    callback(newUserObj);
                }else{
                    callback(null);
                }
            }.bind(this));
        }
    }
    this.addUser = function(user){
        this.users[this.users.length] = user;
    };

    this.newUser = function(userId, username, Usersocket){
        var newUser = new User(userId, username, Usersocket);
        this.addUser(newUser);
        return newUser;
    }
}