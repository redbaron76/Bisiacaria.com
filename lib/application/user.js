
// User

Bisia.User = {

	/**
	 * The user object
	 * @type {Object}
	 */
	user: null,

	/**
	 * Flag used by Ui.waitStart / stop
	 * @type {Boolean}
	 */
	abortedExecution: false,

	/**
	 * Flag to stop init
	 * @type {Boolean}
	 */
	alreadyInit: false,

	/**
	 * Blocked user ids
	 * @type {Array}
	 */
	blockIds: [],

	/**
	 * evaluation categories
	 * @type {Array}
	 */
	evaluateMale: ['affidabile', 'festaiolo', 'gnocco', 'popolare', 'simpatico'],
	evaluateFemale: ['affidabile', 'festaiola', 'gnocca', 'popolare', 'simpatica'],

	/**
	 * Init in _baseControllers.js
	 * @return {Void}
	 */
	init: function(meteorUser) {
		if (meteorUser && ! this.alreadyInit) {
			this.user = meteorUser;

			// Set some settings
			this.notifyAudio = this.user.profile.notifyAudio;
			this.notifyMail = this.user.profile.notifyMail;

			// Init Audio for notifications
			Bisia.Audio.init();

			this.alreadyInit = true;
		}
	},

	/**
	 * Return flag status
	 * @return {[type]} [description]
	 */
	abortExecution: function() {
		return this.abortedExecution;
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
	 * Augment properties in position object
	 * @param  {Object} position
	 * @param  {String} userId
	 * @param  {String} username
	 * @return {Object}
	 */
	augmentPosition: function(position, userId, username, createdAt) {
		var isEvent = (arguments[4]) ? true : false;
		if (isEvent) {
			return _.extend(position, {
				eventId: userId,
				titleEvent: username,
				dateTimeEvent: createdAt
			});
		} else {
			return _.extend(position, {
				userId: userId,
				username: username,
				createdAt: createdAt
			});
		}
	},

	/**
	 * automatically subscribe in HomePage
	 * @return {Void}
	 */
	autopublishHomepage: function() {
		if (! this.aphItv) {
			this.aphItv = Meteor.setInterval(function() {
				Meteor.subscribe('homepage');
			}, 15 * 60 * 1000); // Every 15 mins
		}
	},

	/**
	 * Block a user
	 * @param  {[type]} e   [description]
	 * @param  {[type]} obj [description]
	 * @return {[type]}     [description]
	 */
	blockUser: function(e, obj) {
		Meteor.call('blockUser', obj.chatId, function (error, result) {
			if (result) {
				Router.go('getMessages');
				return Bisia.Ui.submitSuccess("L'utente è stato bloccato correttamente.");
			}
		});
	},

	deleteAvatar: function(e, obj) {
		if (obj.profile && obj.profile.picture) {
			Meteor.call('cloudinary_delete', Bisia.Img.getImagePublicId(obj.profile.picture), function(error, result) {
				if (result) {
					Users.update({ '_id': Meteor.userId() }, { $set: { 'profile.avatar': '', 'profile.picture': '' }});
					Posts.remove({ 'imageUrl': obj.profile.picture });
				}

				if (error)
					console.log(error);
			});
		}
	},

	deleteUser: function(e, obj) {
		Meteor.call('deleteUser', function (error, result) {
			if (result)
				return Bisia.Ui.submitSuccess("La tua richiesta è stata registrata con successo.");
		});
	},

	deletePlace: function(e, obj) {
		Places.remove(obj.placeId);
		obj.liItem.fadeOut('slow').remove();
	},

	formatSearchUsers: function(searchObj) {
		var obj = {};
		// username query
		if (searchObj && !!searchObj.username) {
			obj['username'] = { '$regex': '^'+searchObj.username, '$options': 'i' };
		}
		// gender query
		if (searchObj && !!searchObj.gender) {
			obj = _.extend(obj, {
				'profile.gender': searchObj.gender
			});
		}
		// city query
		if (searchObj && !!searchObj.city) {
			var cityQuery = { '$regex': '^'+searchObj.city, '$options': 'i' };
			obj = _.extend(obj, {
				'profile.city': cityQuery
			});
		}
		// age query
		if (searchObj && !!searchObj.ageSlider) {
			var ages = searchObj.ageSlider.split(',');
			var from = parseInt(ages[0]);
			var to = parseInt(ages[1]) + 1;
			var ageQuery = {
				'$gte': Bisia.Time.daysAgoEnd(to, 'year'),
				'$lte': Bisia.Time.daysAgoStart(from, 'year')
			}
			obj = _.extend(obj, {
				'profile.birthdate': ageQuery
			});
		}
		// gender status
		if (searchObj && !!searchObj.status) {
			obj = _.extend(obj, {
				'profile.status': searchObj.status
			});
		}
		return obj;
	},

	/**
	 * Get the ids to block
	 * @param  {String} userId
	 * @return {Array}
	 */
	getBlockIds: function(userId) {
		if (userId) {
			var my = arguments[1] || Users.findOne(userId, {fields: { 'blocked': true, 'blockBy': true }});
			// Init blocked to block users
			if (!my['blocked']) my['blocked'] = [];
			if (!my['blockBy']) my['blockBy'] = [];
			// Get array of people to hide
			return _.uniq(_.without(_.union(my['blocked'], my['blockBy']), userId));
		}
		return [];
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
	 * [inChatWith description]
	 * @param  {[type]} chatMsg [description]
	 * @return {[type]}         [description]
	 */
	inChatWith: function(chatMsg) {
		var targetId = chatMsg.targetId;
		var userId = chatMsg.userId;
		var queryId = (targetId == Meteor.userId()) ? userId : targetId;
		return _.pick(Users.findOne({'_id': queryId}), 'username');
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
	 * Check if user owns a document
	 * @param  {String}	the user id
	 * @param  {Object} the document obj (with userId property)
	 * @return {Boolean}
	 */
	ownsDocument: function(userId, doc) {
		return doc && (doc.userId === userId || doc.authorId === userId);
	},

	/**
	 * Check if user owns a profile
	 * @param  {String} the user id
	 * @param  {Object}	the profile obj (with _id property)
	 * @return {Boolean}
	 */
	ownsProfile: function(userId, doc) {
		return doc && doc._id === userId;
	},

	/**
	 * Records the last position
	 * @param  {Object} position
	 * @return {Bisia.User}
	 */
	recordLastPosition: function(position) {
		if (position.lat && position.lng && position.location) {
			var parent = this;
			var userId = Meteor.userId();
			position = _.extend(position, {
				userId: userId,
				username: Meteor.user()['username'],
				createdAt: Bisia.Time.getServerTime()
			});

			// save to db
			Meteor.call('recordPosition', Bisia.Form.createMapLoc(position), position, function(error, result) {
				if (result) {
					if (parent.nearYouSub) parent.nearYouSub.stop();
					parent.nearYouSub = Meteor.subscribe('nearYou', position, 500);	// distance in m
					return result;
				}
			});
		}
	},

	/**
	 * Reset position from user
	 * @return {[type]} [description]
	 */
	resetLastPosition: function() {
		Meteor.call('resetUserPosition', function(error, result) {
			return result;
		});
	},

	/**
	 * Determine if the user has set the position
	 * @return {Object}
	 */
	getUserPosition: function() {
		if (Meteor.userId()) {
			return Meteor.user()['profile']['position'];
		}
		return null;
	},

	/**
	 * Get cursor of users around you
	 * @return {Array}
	 */
	getUsersAroundMe: function(position, distance) {
		if (position) {
			// client side geo query
			var aroundQuery = {
				// 'authorId': { '$in': user['following'] },
				'_id': { '$ne': Meteor.userId() },
				'loc': {
					'$near': [ parseFloat(position.lat), parseFloat(position.lng) ],
					'$maxDistance': distance
				}
			};
			// get people close to you client-side
			var people = Users.find(aroundQuery, {
				'fields': { '_id': 1, 'username': 1, 'profile': 1 },
				'sort': { 'profile.position.createdAt': -1 }
			});
			return people.fetch();
		}
		return [];
	}
};