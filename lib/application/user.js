
// User

Bisia.User = {

	/**
	 * The user object
	 * @type {Object}
	 */
	user: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Init the user
	 * @return {Object}
	 */
	initUser: function() {
		if (arguments[0])
			this.user = arguments[0];
		if (! this.user)
			this.user = Meteor.user();
		return this.user;
	},

	/**
	 * Get saved categories for posts
	 * @param  {String} template
	 * @return {Object}
	 */
	getPostCategories: function(template) {
		var categories,
			user = Users.findOne({_id: Meteor.userId()}, {fields: {_id: 0, 'profile.categories': true}});
		if(_.isEmpty(user.profile.categories)) {
			categories = [];
		} else {
			categories = user.profile.categories;
		}
		return {
			template: template,
			categories: categories
		};
	},

	/**
	 * Get a property from user.profile
	 * @param  {String}
	 * @return {String/Object}
	 */
	getProfile: function(val) {
		var user = this.initUser(arguments[1]);
		return this.getUser('profile', user)[val];
	},

	/**
	 * Get a user property
	 * @param  {String}
	 * @return {String/Object}
	 */
	getUser: function(val) {
		var user = this.initUser(arguments[1]);
		if (user && user[val])
			return user[val];
		return;
	},

	/**
	 * Check if user is logged
	 * @return {Boolean}
	 */
	isLogged: function() {
		return !!Meteor.userId();
	},

	/**
	 * Check if profile is offline
	 * @return {[type]} [description]
	 */
	offlineProfile: function() {
		return Users.find({ '_id': Meteor.userId(), 'profile.online': false }).count() > 0;
	},

	/**
	 * Check if user owns a document
	 * @param  {String}	the user id
	 * @param  {Object} the document obj (with userId property)
	 * @return {Boolean}
	 */
	ownsDocument: function(userId, doc) {
		return doc && doc.userId === userId;
	},

	/**
	 * Check if user owns a profile
	 * @param  {String} the user id
	 * @param  {Object}	the profile obj (with _id property)
	 * @return {Boolean}
	 */
	ownsProfile: function(userId, doc) {
		return doc && doc._id === userId;
	}
};