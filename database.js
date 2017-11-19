var Define = require('./Define');
var mysql = require('mysql');
var fs = require('fs');
var connection = mysql.createConnection({
	host     : Define.db.host,
	user     : Define.db.user,
	password : Define.db.password,
	database : Define.db.database,
	connectTimeout: 28800
});
/**
 * the timeout is made to, make sure that we do not lose the connection to the db
 * @type {Object}
 */
var timeout = setTimeout(function() {
    connection.query("SELECT 1", function(error) {});
}, (28740 * 1000));

connection.on('error', function(err) {
  connection = mysql.createConnection({
	  	host     : Define.db.host,
		user     : Define.db.user,
		password : Define.db.password,
		database : Define.db.database,
	  	connectTimeout: 28800
	});
});
module.exports = {
	bt: function (callback) {
		connection.beginTransaction(function(err) {
			if (err) { throw err; }
			callback();
		});
	},
	c: function (callback) {
		connection.commit(function(err) {
	        if (err) {
				connection.rollback(function() {
					saveLog(err, function () {
						console.log('Transaction failed!');
						callback();
					});
				}.bind(this));
			}else{
				callback();
			}
		}.bind(this));
	},
	query: function (query, callback) {
		connection.query(query, function(err, rows, fields) {
		  	//console.log("get query data");
		  	//console.log("err: "+ err);
		  	if (err){
		  		console.log(query);
		  		console.error('query failed: ' + err);
		  	};
		  	//console.log("sql rows: "+ rows.length);
			callback(rows);		

		}.bind(this));
	},
	real: function (text) {
		return connection.escape(text);
	}
};