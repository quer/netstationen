module.exports = function (id, name, socket) {
	this.id = id;
	this.name = name;
	this.socket = socket;
	this.text;
	this.item = 3;
	this.sendToClient = function () {
		return {
			id: this.id,
			name: this.name,
			item: this.item
		}
	}
}