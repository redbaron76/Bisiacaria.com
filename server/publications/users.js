// Publish user counters
Meteor.publish('countUsers', function() {
	// Bisia.log('publishing countUsers...');
	// Meteor._sleepForMs(500000);
	Counts.publish(this, 'totUsers', Users.find({ 'emails': { $elemMatch: { 'verified': true } } }, { 'fields': { '_id': 1 } }));
	Counts.publish(this, 'totOnline', Users.find({ 'profile.online': true }, { 'fields': { '_id': 1 } }));
});

// Publish online users
Meteor.publish('onlineUsers', function(position) {
	if (this.userId) {

		// Meteor._sleepForMs(500000);
		// var my = Users.findOne({ '_id': this.userId }, { 'fields': { 'profile.position': 1, 'loc': 1, 'blocked': 1, 'blockBy': 1 } });

		// Count notifications to read
		// Counts.publish(this, 'totNotifications', Notifications.find({ 'targetId': this.userId, 'isRead': false, 'isBroadcasted': true }));
		// Total Notifications count ['like', 'unlike', 'comment', 'share']
		Counts.publish(this, 'totNotifies', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'note')), { noReady: true });
		// Unread news post from following
		Counts.publish(this, 'lastNews', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'note', false, 'post')), { noReady: true });
		// Single Notifications count
		Counts.publish(this, 'newMessages', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'message')), { noReady: true });
		Counts.publish(this, 'newVisits', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'visit')), { noReady: true });
		Counts.publish(this, 'newFriends', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'friend')), { noReady: true });
		Counts.publish(this, 'newVotes', Notifications.find(Bisia.Notification.getPublishObject(this.userId, 'vote')), { noReady: true });

		// Messages received
		Counts.publish(this, 'unreadMessages', Messages.find({ 'targetId': this.userId, 'isRead': false, 'isDelete': { '$nin': [this.userId] } }), { noReady: true });
		// Friends that you know
		Counts.publish(this, 'youKnow', Friends.find({ 'userId': this.userId }), { noReady: true });
		// Friends that know you
		Counts.publish(this, 'totFriends', Friends.find({ 'targetId': this.userId }), { noReady: true });
		// Count of votes received
		Counts.publish(this, 'totVotes', Votes.find({ 'targetId': this.userId }), { noReady: true });
		// Count birthday of the day
		Counts.publish(this, 'birthdayDay', Users.find({ 'profile.birthday': Bisia.Time.getTodayBirthday() }), { noReady: true });
		// Count events of today
		// Counts.publish(this, 'eventsToday', Events.find({ 'dateTimeEvent': Bisia.Time.getToday() }));
		var limitWeek = Bisia.Time.msWeek;
		Counts.publish(this, 'eventsWeek', Events.find({ 'dateTimeEvent': { '$gte': Bisia.Time.todayStart(), '$lte': Bisia.Time.timeFuture(limitWeek) } }), { noReady: true });

		// All people geotagged
		Counts.publish(this, 'totGeoTagged', Users.find({
			// '_id': { '$ne': this.userId },
			'profile.position': { '$exists': true }
		}), { noReady: true });

		if (position) {
			var nearYouQuery = {
				'_id': { '$ne': this.userId },
				'profile.position': { '$exists': true },
				'loc': {
					'$near': {
						'$geometry': {
							'type': 'Point',
							'coordinates': [ parseFloat(position.lat), parseFloat(position.lng) ]
						},
						'$minDistance': 0,
						'$maxDistance': 500
					}
				}
			};
			// Count hom many near to you
			Counts.publish(this, 'nearYou', Users.find(nearYouQuery), { noReady: true });
			// console.log('nearYou users', this.userId, Users.find(nearYouQuery).count(), position);
		}

		// Get array of people to hide/block
		var toBlock = Bisia.User.getBlockIds(this.userId);

		// Build query to get all users online
		var query = { 'profile.online': true };
		// Exclude people to hide if any
		if (! _.isEmpty(toBlock)) query = _.extend(query, { '_id': { '$nin': toBlock } });

		// Publish online users
		var users = Users.find(query, {
			'fields': {
				'emails': false,
				'blocked': false,
				'blockBy': false,
				'followers': false,
				'services': false
			}
		});

		return users;
	}
});

// Publish a user profile in router.js
Meteor.publish('userSettings', function() {
	if (this.userId) {
		// check(this.userId, String);
		// get blocked ids
		var blockIds = Bisia.User.getBlockIds(this.userId);
		// add my id
		blockIds.push(this.userId);
		var meAndBlockedIds = _.unique(blockIds);
		var users = Users.find({ '_id': { '$in': meAndBlockedIds }});

		// return cursor
		return users;
	}
});

// Publish birthdays
Meteor.publish('users', function(query, options) {
	// Meteor._sleepForMs(1000);
	return Users.find(query, options);
});

Meteor.publish('searchUsers', function(query, options) {
	// Meteor._sleepForMs(50000);
	if (!_.isEmpty(query)) {
		return Users.find(query, options);
	}
});