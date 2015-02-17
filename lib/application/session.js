
// Session

Bisia.Session = {

	beatId: null,
	ghostsTO: 5 * 60 * 1000,
	hearthTO: 2 * 60 * 1000,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Cleans ghosts users every 5 minutes
	 * Run by /server/commons/startup.js
	 * @return {Void}
	 */
	ghostsCleaner: function() {
		var parent = this;
		Meteor.setInterval(function() {
			var now = new Date();
			// After 5 minutes
			var gap = moment().subtract(parent.ghostsTO, 'ms').toDate();

			var users = Sessions.find({ loginCheck: { $lt : gap } }, { userId: 1 });
			Bisia.log('ora server', moment(now).toDate());
			// Bisia.log('pulisco quelli con loginCheckin <', gap);
			if (!users.count()) return;

			users.forEach(function (user) {
				// Bisia.log('ghostsCleaner puliti', user);
				// Remove record in session
				Sessions.remove({ _id: user._id });
				// Set offline the user
				Users.update(
					{ _id: user.userId },
					{ $set: {
						'profile.loginSince': new Date(),
						'profile.online': false,
						'services.resume.loginTokens': []
					}}
				);
			});

		}, this.ghostsTO); // run every 5 mins
	},

	/**
	 * Start user session hearthbeat
	 * Run by Autorun /client/application/app.js
	 * @return {Void}
	 */
	hearthBeat: function() {
		var parent = this;
		var userId = Meteor.userId();
		// Bisia.log('hearthbeat loaded!');
		if(userId) {
			Bisia.Time.beatTime = new ReactiveVar(Bisia.Time.now());
			Meteor.call('hearthBeat', function(error, result) {
				Bisia.Time.beatTime.set(result);
			});
			this.beatId = Meteor.setInterval(function() {
				Meteor.call('hearthBeat', function(error, result) {
					Bisia.Time.beatTime.set(result);
					// Bisia.log('hearthBeatTime', Bisia.Time.beatTime.get());
				});
			}, this.hearthTO);	// run every 2 mins
		} else {
			this.hearthBeatClear();
		}
	},

	/**
	 * Clears a hearthBeat interval
	 * @return {Void}
	 */
	hearthBeatClear: function(beatId) {
		if (this.beatId) {
			// Bisia.log('hearthbeat cleared!', this.beatId);
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
			$set: setProfile
		});

		// If login, upsert new session record
		if (online) {
			// Upsert session status
			Sessions.upsert({ 'userId': userId },{ $set: { 'loginCheck': new Date() }});
		}

		// Create the log object
		var logObj = {
			'userId': userId,
			'username': Meteor.user().username,
			'service': Meteor.user().profile.loggedWith,
			'ip': ip
		};

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

		return true;
	}

};