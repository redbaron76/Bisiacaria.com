// Publish user counters
Meteor.publish('countUsers', function() {
	// Bisia.log('publishing countUsers...');
	Counts.publish(this, 'totUsers', Users.find());
	Counts.publish(this, 'totOnline', Users.find({ 'profile.online': true }));
});

// Publish online users
Meteor.publish('onlineUsers', function() {
	if (this.userId) {
		// Bisia.log('publishing onlineUsers from '+where+'...');
		// Meteor._sleepForMs(5000);
		return Users.find({ 'profile.online': true });
	}
});

// Publish a user profile in router.js
Meteor.publish('user', function(userId) {
	check(userId, String);
	// Bisia.log('publishing user...');
	// Meteor._sleepForMs(5000);
	return Users.find({	'_id': userId });
});