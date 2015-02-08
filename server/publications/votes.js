// Publish votes
Meteor.publish('votes', function(query, options) {
	// extends query with current userId
	query = _.extend(query, {
		targetId: this.userId
	});
	// Meteor._sleepForMs(1000);
	return Votes.find(query, options);
});