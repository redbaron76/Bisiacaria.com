// Publish user counters
Meteor.publish('countUsers', function() {
	// Bisia.log('publishing countUsers...');
	// Meteor._sleepForMs(5000);
	Counts.publish(this, 'totUsers', Users.find({}, { 'fields': { '_id': 1 } }));
	Counts.publish(this, 'totOnline', Users.find({ 'profile.online': true }, { 'fields': { '_id': 1 } }));
});

// Publish online users
Meteor.publish('onlineUsers', function() {
	if (this.userId) {

		// Meteor._sleepForMs(5000);

		// Total Notifications count ['like', 'unlike', 'comment', 'share']
		Counts.publish(this, 'totNotifies', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'note')), { noReady: true });

		// Single Notifications count
		Counts.publish(this, 'news', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'news')), { noReady: true });
		Counts.publish(this, 'newMessages', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'message')), { noReady: true });
		Counts.publish(this, 'newVisits', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'visit')), { noReady: true });
		Counts.publish(this, 'newFriends', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'friend')), { noReady: true });
		Counts.publish(this, 'newVotes', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'vote')), { noReady: true });

		// Messages received
		Counts.publish(this, 'unreadMessages', Messages.find({ 'targetId': this.userId, 'isRead': false }), { noReady: true });
		// Friends that you know
		Counts.publish(this, 'youKnow', Friends.find({ 'userId': this.userId }), { noReady: true });
		// Friends that know you
		Counts.publish(this, 'totFriends', Friends.find({ 'targetId': this.userId }), { noReady: true });
		// Count of votes received
		Counts.publish(this, 'totVotes', Votes.find({ 'targetId': this.userId }), { noReady: true });
		// Count birthday of the day
		Counts.publish(this, 'birthdayDay', Users.find({ 'profile.birthday': Bisia.Time.getTodayBirthday() }));

		// Get array of people to hide/block
		var toBlock = Bisia.User.getBlockIds(this.userId);
		// Build query to get all users online
		var query = { 'profile.online': true };
		// Exclude people to hide if any
		if (! _.isEmpty(toBlock))
			query = _.extend(query, {
				'_id': { '$nin': toBlock }
			});

		// Publish online users
		return Users.find(query, {
			'fields': {
				'emails': false,
				'blocked': false,
				'blockBy': false,
				'friends': false,
				'services': false
			}
		});
	}
});

// Publish a user profile in router.js
Meteor.reactivePublish('userSettings', function() {
	if (this.userId) {
		check(this.userId, String);
		// Meteor._sleepForMs(5000);
		var user =  Users.find({ '_id': this.userId });
		// get blocked ids
		var blockIds = Bisia.User.getBlockIds(this.userId);
		var blocked = Users.find({ '_id': { '$in': blockIds }});
		// return cursor
		return [user, blocked];
	}
});

// Publish birthdays
Meteor.publish('birthdayList', function(query, options) {
	// Meteor._sleepForMs(1000);
	return Users.find(query, options);
});