
// Bisia Namespace

Bisia = {

	timer: 0,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Delay execution of a function after ms
	 * @return {Function}
	 */
	delay: function(callback) {
		var ms = arguments[1] || 1000;
		Meteor.clearTimeout(this.timer);
		this.timer = Meteor.setTimeout(callback, ms);
	},

	/**
	 * Get a collection by its name
	 * @param  {String} collectionName
	 * @return {Object}
	 */
	getCollection: function(collectionName) {
		return Mongo.Collection.get(collectionName);
	},

	/**
	 * Get Iron Router Controller props/methods
	 * @return {Object/Function}
	 */
	getController: function() {
		var controller = Iron.controller();
		return (arguments) ? controller[arguments[0]] : controller;
	},

	/**
	 * Check if an object has properties
	 * @param  {Object}
	 * @return {Boolean}
	 */
	has: function(obj) {
		return !_.isEmpty(obj);
	},

	/**
	 * Logs arguments as console.log
	 * @return {}
	 */
	log: function() {
		return console.log(arguments);
		// return Bisia.Log.info(arguments);
	},

	/**
	 * Inverse authorId
	 * @param  {String} target
	 * @return {String}
	 */
	inverseAuthor: function(author) {
		return author == 'targetId' ? 'userId' : 'targetId';
	},

	/**
	 * Trims an input
	 * @param  {String}
	 * @return {String}
	 */
	trimInput: function(str) {
		if (str) {
			return str.replace(/^\s*|\s*$/g, '');
		} else {
			return str;
		}
	},

	/**
	 * Trim 'value' with arguments[1]
	 * @param  {String}
	 * @param  {String, .} default separator
	 * @param  {Boolean, false} to lower case
	 * @return {String}
	 */
	trimSpaces: function(str) {
		var repChar = arguments[1] || ".";
		var toLower = arguments[2] || false;
		var text = str.replace(' ', repChar);
		return (toLower) ? text.toLowerCase() : text;
	}
};