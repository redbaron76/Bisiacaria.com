// Publish votes
Meteor.publish('votes', function(query, options) {
	// Meteor._sleepForMs(1000);
	return Votes.find(query, options);
});

Meteor.reactivePublish('getVotesAndAuthor', function(query, options) {
	// Extend query object
	query = _.extend(query, {targetId: this.userId});
	// get cursors
	var visits = Votes.find(query, options);
	var userIds = visits.map(function(doc) { return doc.userId });
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [visits, authors];
});