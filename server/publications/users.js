// Publish user counters
Meteor.publish('countUsers', function() {
	// Bisia.log('publishing countUsers...');
	// Meteor._sleepForMs(5000);
	Counts.publish(this, 'totUsers', Users.find());
	Counts.publish(this, 'totOnline', Users.find({ 'profile.online': true }));
});

// Publish online users
Meteor.publish('onlineUsers', function() {
	if (this.userId) {
		// Bisia.log('publishing onlineUsers from '+where+'...');
		// Meteor._sleepForMs(5000);
		Counts.publish(this, 'newVisits', Notifications.find({ 'targetId': this.userId, 'action': 'visit', 'isRead': false }), { noReady: true });
		Counts.publish(this, 'newFriends', Notifications.find({ 'targetId': this.userId, 'action': 'friend', 'isRead': false }), { noReady: true });
		Counts.publish(this, 'newVotes', Notifications.find({ 'targetId': this.userId, 'action': 'vote', 'isRead': false }), { noReady: true });
		return Users.find({ 'profile.online': true }, { 'fields': { 'emails': false, 'services': false } });
	}
});

// Publish a user profile in router.js
Meteor.publish('userSettings', function(userId) {
	// Meteor._sleepForMs(10000);
	return Users.find({	'_id': this.userId });
});

// Publish a user profile in router.js
Meteor.publish('user', function(userId) {
	check(userId, String);
	// Bisia.log('publishing user...');
	// Meteor._sleepForMs(1000);
	return Users.find({	'_id': userId });
});

// Publish a user profile in router.js
Meteor.publish('userProfile', function(username) {
	check(username, String);
	// Bisia.log('publishing  '+username+'...');
	// Meteor._sleepForMs(1000);
	var user = Users.find({ 'username': username }, { 'fields': { 'emails': false, 'services': false } });
	var userId = _.pluck(user.fetch(), '_id')[0];
	Counts.publish(this, 'totFriends', Friends.find({ 'userId': userId }), { noReady: true });
	return user;
});