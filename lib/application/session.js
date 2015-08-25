
// Session

Bisia.Session = {

	beatId: null,
	ghostsTO: 11 * 60 * 1000,
	hearthTO: 5 * 60 * 1000,

	connStatus: new ReactiveVar(true),

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * [checkOnline description]
	 * @return {[type]} [description]
	 */
	connectionStatus: function() {
		var parent = this;
		// Set default status
		parent.connStatus.set(navigator.onLine);
		// On Event change
		$(window).on('offline', function() {
			parent.connStatus.set(false);
			parent.hearthBeatClear();
		}).on('online', function() {
			parent.connStatus.set(true);
			parent.hearthBeat();
		});

		Tracker.autorun(function () {
			Bisia.Ui.blockIfNotConnected();
		});
	},

	/**
	 * Check if profile is offline
	 * @return {[type]} [description]
	 */
	offlineProfile: function() {
		return _.isEmpty(Users.find({ '_id': Meteor.userId(), 'profile.online': true }));
	},

	/**
	 * Cleans ghosts users every 11 minutes
	 * Run by /server/commons/startup.js
	 * @return {Void}
	 */
	ghostsCleaner: function() {
		var parent = this;
		Meteor.setInterval(function() {
			var now = new Date();
			// After 11 minutes
			var gap = moment().subtract(parent.ghostsTO, 'ms').toDate();

			var users = Sessions.find({ 'loginCheck': { '$lt' : gap } }, { 'userId': 1 });
			// Bisia.log('ora server', moment(now).toDate());
			// Bisia.log('pulisco quelli con loginCheckin <', gap);
			if (users.count() > 0) {
				users.forEach(function (user) {
					// Remove record in session
					Sessions.remove({ _id: user._id });
					// Set offline the user
					Users.update(
						{ _id: user.userId },
						{
							'$set': {
								'profile.loginSince': new Date(),
								'profile.online': false
							},
							'$unset': {
								'profile.position': '',
								'loc': ''
							}
						}
					);
					// Remove from chat
					console.log('Chatusers remove', user.userId);
					Chatusers.remove({ 'userId': user.userId, 'isBanned': false });
				});
			}

		}, this.ghostsTO); // run every 11 mins
	},

	/**
	 * Start user session hearthbeat
	 * Run by Autorun /client/application/app.js
	 * @return {Void}
	 */
	hearthBeat: function() {
		var parent = this;
		var userId = Meteor.userId();
		// if(userId) {
		if(userId && Meteor.status().connected) {
			// console.log('hearthbeat started on userId!');
			Bisia.Time.beatTime.set(Bisia.Time.now());
			Meteor.call('hearthBeat', true, function(error, result) {
				// console.log('hearthbeat running 1st!', result);
				Bisia.Time.beatTime.set(result);
			});
			if (!this.beatId) {
				this.beatId = Meteor.setInterval(function() {
					Meteor.call('hearthBeat', false, function(error, result) {
						// console.log('hearthbeat running!', parent.beatId, result);
						Bisia.Time.beatTime.set(result);
					});
				}, this.hearthTO);	// run every 5 mins
			}
		} else {
			// console.log('hearthbeat stopped!');
			this.hearthBeatClear();
		}
	},


	/**
	 * Clears a hearthBeat interval
	 * @return {Void}
	 */
	hearthBeatClear: function(beatId) {
		if (this.beatId) {
			// console.log('hearthbeat cleared!', this.beatId);
			Meteor.clearInterval(this.beatId);
		}
		this.beatId = null;
	},

	/**
	 * Update profile and log ins and outs
	 * @param  {[type]}
	 * @param  {[type]}
	 * @param  {[type]}
	 * @param  {[type]}
	 * @return {[type]}
	 */
	logInOuts: function(userId, service, online, ip) {
		var now = new Date();
		// Set profile object to be updated
		var setProfile = {
			'profile.online': online,
			'profile.loginSince': now,
			'profile.loggedWith': service
		};

		// Update user profile
		Users.update(userId, {
			'$set': setProfile,
			'$unset': { 'profile.position': '', 'loc': '' }
		});

		// If login, upsert new session record and user
		if (online) {
			// Upsert session status
			Sessions.upsert({
				'userId': userId
			}, {
				'$set': { 'loginCheck': now }
			});

			// Update user loginSince - sessions.js line 13
			Users.update({ '_id': userId }, { '$set': { 'profile.loginSince': now } });

		} else {
			// Remove from chat
			Chatusers.remove({ 'userId': userId, 'isBanned': false });
		}

		// Create the log object
		var logObj = {
			'userId': userId,
			'ip': ip
		};

		var user = Meteor.user();

		if (user) {
			logObj = _.extend(logObj, {
				'username': user.username,
				'service': user.profile.loggedWith
			});
			// Set the email prop based on service
			if (service) {
				switch(service) {
					case 'facebook':
						logObj['email'] = Meteor.user().services.facebook.email;
						break;
					default:
						logObj['email'] = Meteor.user().emails[0].address;
				}
			}

			var label = online ? 'loginAt' : 'logoutAt';
			logObj[label] = now;

			// Log login
			Logs.insert(logObj);
		}

		// Log on file
		var info = online ? 'login' : 'logout';
		Bisia.Log.info(info, logObj);

		return true;
	}

};