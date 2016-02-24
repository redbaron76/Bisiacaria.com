
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
	 * Automate set and clean expired ban after 24h
	 * @return {[type]} [description]
	 */
	chatRoomBanUsers: function() {

		// get last message
		var lastMessage = Chatroom.findOne({}, { 'sort': { '$natural': -1 } } );
		// remove messages 15 mins older than the last one
		Chatroom.remove({ 'createdAt': { '$lt': moment(lastMessage.createdAt).subtract(15, 'm').toDate() } });

		// togli ban con permanentBanner=false con bannedAt > 24h from now
		Chatusers.remove({ 'isBanned': true, 'bannedAt': { '$lte': Bisia.Time.daysAgoStart(1) } });

		// prendo user id di chi è online in un array
		onlines = Users.find({ 'profile.online': true });
		var onlineIds = onlines.map(function(doc) { return doc['_id'] });
		// elimino $nin da Chatusers
		Chatusers.remove({ 'userId': { '$nin': onlineIds} });

		// conta quanti sono in chat, metà dei presenti è limite minimo da raggiungere per bannare
		var chatUsers = Chatusers.find({ 'isBanned': false });
		var majority = parseInt(chatUsers.count() / 2);

		// set isBanner = true chi ha banProposal >= presenti in chat, set bannedAt = now
		Chatusers.update({
			'isBanned': false,
			'banProposal': { '$gte': majority }
		}, {
			'$set': {
				'bannedAt': Bisia.Time.now(),
				'isBanned': true
			}
		});
	},

	deleteOrphansArray: function() {

		// array di tutti gli utenti e array _.uniq di tutte le liste
		var listIds = [], userIds = [];
		var users = Users.find();
		users.forEach(function(user) {
			userIds.push(user._id);
			if (user.followers && user.followers.length) {
				_.each(user.followers, function(id) {
					listIds.push(id);
				});
			}
			if (user.following && user.following.length) {
				_.each(user.following, function(id) {
					listIds.push(id);
				});
			}
			if (user.blocked && user.blocked.length) {
				_.each(user.blocked, function(id) {
					listIds.push(id);
				});
			}
			if (user.blockBy && user.blockBy.length) {
				_.each(user.blockBy, function(id) {
					listIds.push(id);
				});
			}
		});
		listIds = _.uniq(listIds);
		// differenza tutte le liste e users -> trovo quelli eliminati
		var delIds = _.difference(listIds, userIds);
		// ciclo e elimino
		if (delIds && delIds.length)  {
			_.each(delIds, function(id) {
				Users.update({ 'followers': { '$in': [id] } }, { $pull: { 'followers': id } }, { 'multi': true	});
				Users.update({ 'following': { '$in': [id] } }, { $pull: { 'following': id } }, { 'multi': true	});
				Users.update({ 'blocked': { '$in': [id] } }, { $pull: { 'blocked': id } }, { 'multi': true	});
				Users.update({ 'blockBy': { '$in': [id] } }, { $pull: { 'blockBy': id } }, { 'multi': true	});
			});
			console.log('Eliminati ' + delIds.length);
		}
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
			count ++;
		});
		if (count > 0) {
			var text = 'Email inviate: ' + count + ' - Elapsed time: ' + moment().diff(start, 's') + ' sec.';
			/*Email.send({
				from: Bisia.Mail.Tpl.from,
				to: 'f.fumis@gmail.com',
				subject: 'Riepilogo notifiche bisia',
				text: text
			});*/
			Meteor.call('sendEmail', {
				from: Bisia.Mail.Tpl.from,
				to: 'f.fumis@gmail.com',
				subject: 'Riepilogo notifiche bisia',
				text: text,
				html: ''
			});
		}
	},

	/**
	 * Chiama utenti non online da almeno 15gg
	 * @return {Void}
	 */
	emailRecall: function() {
		var count = 0;
		var start = moment();
		// select users last login older than 15 days
		var users = Users.find({
			'profile.loginSince': { '$lt': Bisia.Time.daysAgoEnd(15) },
			'profile.notifyMail': true
		}, {
			'fields': { 'username': true, 'emails': true, 'profile': true }
		});
		users.forEach(function(userObj) {
			Bisia.Mail.sendYouMissFromBisia(userObj);
			count ++;
		});
		if (count > 0) {
			var text = 'Email inviate: ' + count + ' - Elapsed time: ' + moment().diff(start, 's') + ' sec.';

			Meteor.call('sendEmail', {
				from: Bisia.Mail.Tpl.from,
				to: 'f.fumis@gmail.com',
				subject: 'Riepilogo email Recall',
				text: text,
				html: ''
			});
		}
	},

	/**
	 * Broadcast notifications
	 * @return {Integer} N. of modified records
	 */
	broadcastNotifications: function() {

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
	 * delete Old Notifications
	 * @return {Void}
	 */
	deleteOldNotifications: function() {
		Notifications.remove({
			'isBroadcasted': true,
			'isRead': true,
			'broadcastedAt': { '$lt': moment().subtract(7, 'days').toDate() }
		});

		/*Email.send({
			from: Bisia.Mail.Tpl.from,
			to: 'f.fumis@gmail.com',
			subject: 'Delete old notifications',
			text: 'delete notifications older than ' + moment().subtract(7, 'days').toDate()
		});*/
		Meteor.call('sendEmail', {
			from: Bisia.Mail.Tpl.from,
			to: 'f.fumis@gmail.com',
			subject: 'Delete old notifications',
			text: 'delete notifications older than ' + moment().subtract(7, 'days').toDate(),
			html: ''
		});
	},

	/**
	 * Delete users from Bisia
	 * @return {[String}
	 */
	deleteUsersFromBisia: function() {
		var users = Users.find({ 'scheduledDelete': { '$lt': new Date() } });
		var howMany = users.count();

		var usernames = [];

		users.forEach(function(user) {

			// save username
			usernames.push(user.username);

			// Delete contents
			Events.remove({ 'authorId': user._id });
			Posts.remove({ 'authorId': user._id });
			Friends.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Messages.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Notifications.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Votes.remove({ '$or': [{ 'userId': user._id }, { 'targetId': user._id }] });
			Evaluations.remove({ 'targetId': user._id });
			Emails.remove({ 'targetId': user._id });
			Logs.remove({ 'userId': user._id });

			// Poker
			Pokerplayers.remove({ 'playerId': user._id });
			Pokerhands.remove({ 'playerId': user._id });
			Pokerwinners.update({}, { '$pull': { 'winners': { 'winnerId': user._id }}});

			// Delete denormalized data
			Users.update({ 'followers': { '$in': [user._id] } }, { $pull: { 'followers': user._id } }, { 'multi': true	});
			Users.update({ 'following': { '$in': [user._id] } }, { $pull: { 'following': user._id } }, { 'multi': true	});
			Users.update({ 'blocked': { '$in': [user._id] } }, { $pull: { 'blocked': user._id } }, { 'multi': true	});
			Users.update({ 'blockBy': { '$in': [user._id] } }, { $pull: { 'blockBy': user._id } }, { 'multi': true	});

			// Delete user
			Users.remove({ '_id': user._id });

			Bisia.Log.server("Eliminato l'utente", { userId: user._id });

			Meteor.call('sendEmail', {
				from: Bisia.Mail.Tpl.from,
				to: user.emails[0].address,
				subject: 'Cancellazione utente',
				text: '',
				html: 'Il tuo profilo è stato eliminato da Bisiacaria.com'
			});

		});

		// Delete not confirmed users
		var notConfirmedUsers = Users.find({
			'emails': { '$elemMatch': { 'verified': false }},
			'createdAt': { '$lt': Bisia.Time.daysAgoStart(2) }
		});

		notConfirmedUsers.forEach(function(user) {
			Users.remove({ '_id': user._id });
			Bisia.Log.server("Eliminato utente non confermato", { userId: user._id });
		});

		var message = "Cancellati " + howMany + " utenti.";

		Bisia.Log.server(message, { createdAt: new Date() });

		/*Email.send({
			from: Bisia.Mail.Tpl.from,
			to: 'f.fumis@gmail.com',
			subject: 'Delete users from Bisia',
			text: message
		});*/

		if (usernames.length > 0) {
			message = message + ' ' + usernames.toString();
		}

		Meteor.call('sendEmail', {
			from: Bisia.Mail.Tpl.from,
			to: 'f.fumis@gmail.com',
			subject: 'Delete users from Bisia',
			text: message,
			html: ''
		});

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
	},

    /**
     * Send newsletter to all old users
     */
    sendOldUsers: function() {
        Bisia.Mail.sendToOldUsers();
    }


};