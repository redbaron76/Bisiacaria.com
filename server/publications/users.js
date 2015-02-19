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

		// Notifications count
		Counts.publish(this, 'newMessages', Notifications.find({ 'targetId': this.userId, 'action': 'message', 'isRead': false }), { noReady: true });
		Counts.publish(this, 'newVisits', Notifications.find({ 'targetId': this.userId, 'action': 'visit', 'isRead': false }), { noReady: true });
		Counts.publish(this, 'newFriends', Notifications.find({ 'targetId': this.userId, 'action': 'friend', 'isRead': false }), { noReady: true });
		Counts.publish(this, 'newVotes', Notifications.find({ 'targetId': this.userId, 'action': 'vote', 'isRead': false }), { noReady: true });

		// Messages received
		Counts.publish(this, 'totMessages', Messages.find({ 'targetId': this.userId }), { noReady: true });
		// Friends that you know
		Counts.publish(this, 'youKnow', Friends.find({ 'userId': this.userId }), { noReady: true });
		// Friends that know you
		Counts.publish(this, 'totFriends', Friends.find({ 'targetId': this.userId }), { noReady: true });
		// Count of votes received
		Counts.publish(this, 'totVotes', Votes.find({ 'targetId': this.userId }), { noReady: true });
		// Publish online users
		return Users.find({ 'profile.online': true }, { 'fields': { 'emails': false, 'friends': false, 'services': false } });
	}
});

// Publish a user profile in router.js
Meteor.publish('userProfile', function(username) {
	check(username, String);
	// Meteor._sleepForMs(1000);
	var user = Users.find({ 'username': username }, { 'fields': { 'emails': false, 'services': false } });
	var userId = _.pluck(user.fetch(), '_id')[0];
	Counts.publish(this, 'totFriends', Friends.find({ 'userId': userId }), { noReady: true });
	return user;
});

// Publish a user profile in router.js
Meteor.publish('userSettings', function() {
	check(this.userId, String);
	// Meteor._sleepForMs(1000);
	return Users.find({	'_id': this.userId });
});