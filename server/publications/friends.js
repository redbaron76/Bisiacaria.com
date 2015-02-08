// Publish friends
Meteor.publish('friends', function(query, options) {
	// extends query with current userId
	query = _.extend(query, {
		targetId: this.userId
	});
	// Meteor._sleepForMs(1000);
	return Friends.find(query, options);
});