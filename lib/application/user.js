
// User

Bisia.User = {

	/**
	 * The user object
	 * @type {Object}
	 */
	user: null,

	/**
	 * Blocked user ids
	 * @type {Array}
	 */
	blockIds: [],

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
	 * Block a user
	 * @param  {[type]} e   [description]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	blockUser: function(e, obj) {
		// Bisia.log(e, obj);
		var blockObj = {
			chatId: obj.chatId,
			blockId: obj.userId,
			username: obj.username
		}
		Meteor.call('blockUser', blockObj, function (error, result) {
			if (result)
				return Bisia.Ui.submitSuccess("L'utente è stato bloccato correttamente.");
		});
	},

	/**
	 * Get the ids to block
	 * @param  {String} userId
	 * @return {Array}
	 */
	getBlockIds: function(userId) {
		var my = Users.findOne(userId, {fields: { 'blocked': true, 'blockBy': true }});
		// Init blocked to block users
		if (!my['blocked']) my['blocked'] = [];
		if (!my['blockBy']) my['blockBy'] = [];
		// Get array of people to hide
		return _.uniq(_.without(_.union(my['blocked'], my['blockBy']), userId));
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
	 * Check if I can't communicate with targetId
	 * @param  {String}  targetId
	 * @return {Boolean}
	 */
	isBlocked: function(targetId) {
		this.blockIds = this.getBlockIds(Meteor.userId());
		return _.contains(this.blockIds, targetId);
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