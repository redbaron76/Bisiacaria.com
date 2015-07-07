
// Bisia Namespace

Bisia = {

	timer: 0,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	createNestedObject: function(base, names, value, force) {
		// If a value is given, remove the last name and keep it for later:
		var lastName = arguments.length >= 3 ? names.pop() : false;
		var forceInsertValue = force || false;

		// Walk the hierarchy, creating new objects where needed.
		// If the lastName was removed, then the last object is not set yet:
		for (var i = 0; i < names.length; i++) {
		    base = base[names[i]] = base[names[i]] || {};
		}

		// If a value was given, set it to the last name:
		if ((lastName && value) || forceInsertValue) {
			base = base[lastName] = value;
		}

		// Return the last object in the hierarchy:
		return base;
	},

	/**
	 * [checkNestedObject description]
	 * @param  {[type]} obj [description]
	 * @param  {[type]} key [description]
	 * @return {[type]}     [description]
	 */
	checkNestedObject: function(obj, key) {
		return key.split(".").reduce(function(o, x) {
			return (typeof o == "undefined" || o === null) ? o : o[x];
		}, obj);
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
	 * Execute a string function in the context
	 * @param  {String} functionName
	 * @param  {Object} context
	 * @return {Mixed}
	 */
	executeFunctionByName: function(functionName, context) {
		var args = [].slice.call(arguments).splice(2);
		var namespaces = functionName.split(".");
		var func = namespaces.pop();
		for(var i = 0; i < namespaces.length; i++) {
			context = context[namespaces[i]];
		}
		return context[func].apply(context, args);
	},

	/**
	 * [extractDomain description]
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	extractDomain: function(url) {
		var domain;
		//find & remove protocol (http, ftp, etc.) and get domain
		if (url.indexOf("://") > -1) {
			domain = url.split('/')[2];
		} else {
			domain = url.split('/')[0];
		}
		// find and split querystring
		domain = domain.split('?')[0];
		//find & remove port number
		domain = domain.split(':')[0];
		return domain;
	},

	/**
	 * Flatten nested object
	 * @param  {Object} obj
	 * @param  {Object} result
	 * @param  {String} prefix
	 * @return {Object}
	 */
	flattenObject: function(obj, result, prefix) {
		var parent = this;
		if(_.isObject(obj) && ! _.isDate(obj) && ! _.isEmpty(obj)) {
			_.each(obj, function(element, index) {
				parent.flattenObject(element, result, index);
			});
		} else {
			result[prefix] = obj;
		}
		return result;
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
	 * Get arrays and return unique array (without userId)
	 * @return {Array}
	 */
	mergeIds: function() {
		var ids = [];
		for (var i = 0; i < arguments.length; i++) {
			ids = _.union(ids, arguments[i]);
		}
		return _.uniq(ids);
	},

	/**
	 * Format errors from server calls
	 * @param  {Object} errorsObj
	 * @return {Object}
	 */
	serverErrors: function(errorsObj) {
		return {
			errors: errorsObj
		};
	},

	/**
	 * Slugify a string
	 * @param  {String} text
	 * @return {String}
	 */
	slugify: function(text)	{
		return text.toString().toLowerCase()
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(/[^\w\-]+/g, '')       // Remove all non-word chars
		.replace(/\-\-+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '');            // Trim - from end of text
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