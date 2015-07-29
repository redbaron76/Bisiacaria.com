
Bisia.Automator = {

	/**
	 * Container for interval handlers
	 * @type {Object}
	 */
	automators: {},

	/**
	 * Interval seconds object
	 * @type {Object}
	 */
	timers: Meteor.settings.automator,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		this.startProcess('broadcastNotifications');
		// this.startProcess('emailNotifications');
		this.startProcess('homePageBuilder');

		SyncedCron.start();
	},

	/**
	 * Delete broadcasted Notifications
	 * @param {Integer} olderThan
	 * @return {Void}
	 */
	deleteNotifications: function(olderThan) {
		// Remove visit greater than a week ago
		Notifications.remove({ 'isBroadcasted': true, 'isRead': true, 'createdAt': { '$lt': Bisia.Time.timeAgo(olderThan) } });
	},

	/**
	 * Send notification in queue by email
	 * @return {Void}
	 */
	emailNotifications: function() {
		var emailNotifications = Emails.find();
		var start = moment();
		var count = 0;
		emailNotifications.forEach(function (email) {
			Bisia.Mail.sendNotificationMail(email);
			count++;
		});
		if (count > 0)
			Bisia.log('Email inviate: ' + count, 'Elapsed time: ' + moment().diff(start, 'ms') + 'ms');
	},

	/**
	 * Broadcast notifications
	 * @return {Integer} N. of modified records
	 */
	broadcastNotifications: function() {

		// delete broadcasted notifications - in cronjob
		// this.deleteNotifications(Bisia.Time.msWeek);

		// Update multiple notifications when are isBroadcasted
		return Notifications.update({
			'broadcastedAt': Bisia.Time.nowStart(),
			'isBroadcasted': false,
			'isRead': false
		}, {
			$set: {
				'broadcastedAt': Bisia.Time.now(),
				'isBroadcasted': true
			}
		}, {
			multi: true
		});
	},

	/**
	 * Build a new HomePage
	 * @return {Void}
	 */
	homePageBuilder: function() {
		return Bisia.Homepage.build();
	},

	/**
	 * Delete users from Bisia
	 * @return {[String}
	 */
	deleteUsersFromBisia: function() {
		var users = Users.find({ 'scheduledDelete': { '$lt': new Date() } });
		var howMany = users.count();

		users.forEach(function(user) {
			// Delete contents
			Events.remove({ 'authorId': user._id });
			Posts.remove({ 'authorId': user._id });
			Friends.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Messages.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Notifications.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Votes.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });

			// Delete denormalized data
			Users.update({ 'followers': { '$in': [user._id] } }, { '$set': { $pull: { 'followers': user._id } } });
			Users.update({ 'following': { '$in': [user._id] } }, { '$set': { $pull: { 'following': user._id } } });
			Users.update({ 'blocked': { '$in': [user._id] } }, { '$set': { $pull: { 'blocked': user._id } } });
			Users.update({ 'blockBy': { '$in': [user._id] } }, { '$set': { $pull: { 'blockBy': user._id } } });

			// Delete user
			Users.remove(user._id);

			Bisia.Log.server("Eliminato l'utente", { userId: user._id });

		});

		// Delete not confirmed users
		var notConfirmedUsers = Users.find({
			'emails': { '$elemMatch': { 'verified': false }},
			'createdAt': { '$lt': Bisia.Time.daysAgoStart(2) }
		});

		notConfirmedUsers.forEach(function(user) {
			Users.remove(user._id);
			Bisia.Log.server("Eliminato utente non confermato", { userId: user._id });
		});

		var message = "Cancellati " + howMany + " utenti.";
		Bisia.Log.server(message, { createdAt: new Date() });

		return message;
	},

	/**
	 * Start a recursive process every interval seconds
	 * @param  {String} method
	 * @return {Bisia.Automator}
	 */
	startProcess: function(method) {
		var parent = this;
		parent[method]();
		var process = Meteor.setInterval(function() {
			parent[method]();
		}, this.timers[method] * 1000);
		if (!!this.automators[method]) {
			Meteor.clearInterval(this.automators[method]);
		}
		this.automators[method] = process;
		return this;
	},

	/**
	 * Rebuild friends counter and connections
	 * @return {Void}
	 */
	rebuildFriends: function() {
		Users.find({}).forEach(function(user) {
			var uId = user._id;
			console.log('rebuildFriends for: ' + uId);
			var followers = []; // targetId == userId
			var following = []; // userId == uId

			// Get all my followers
			Friends.find({ targetId: uId}).forEach(function(friend) {
				followers.push(friend.userId);
			});

			// Get all all my following
			Friends.find({ userId: uId}).forEach(function(friend) {
				following.push(friend.targetId);
			});

			// Update user
			Users.update(uId, { $set:{ following: following, followers: followers }});

		});
	},

	/**
	 * Rebuild votes counter
	 * @return {Void}
	 */
	rebuildVotes: function() {
		Users.find({}).forEach(function(user) {
			var uId = user._id;
			console.log('rebuildVotes for: ' + uId);
			// Get all received votes
			var count = Votes.find({ targetId: uId}).count();

			// Update update counter
			Users.update(uId, { $set:{ 'profile.votesCount': count }});

		});
	}


};