var db = require('../database.js');
module.exports = new function () {
	this.cachedItems = {};

	this.getItem = function (id, callback) {
		if(this.cachedItems[id]){
			return this.cachedItems[id];
		}
		db.query("SELECT `id`, `name`, `image`, `x`, `y` FROM `items` WHERE `id` = '"+id+"'", function (rows) {
			if(rows.length > 0){
				this.cachedItems[id] = rows[0];
				callback(rows[0]);
			}
			callback(null);
		}.bind(this));
	}
	this.getActiveItemsOnUser = function (userId, callback) {
		var query = "SELECT `items`.`id`, `items`.`name`, `items`.`image`, `items`.`x`, `items`.`y` FROM `user_items`"
					+"INNER JOIN `items` ON `user_items`.`itemid` = `items`.`id`"
					+"WHERE `user_items`.`activeOnProfile` = 1 AND `userid` = '"+userId+"'";
			db.query(query, callback)
	}
}