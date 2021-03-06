// Publish votes
Meteor.publish('votesList', function(query, options, authorId) {
	// check(this.userId, String);
	check(authorId, String);
	check(query, Object);
	check(options, {
		sort: Object,
		limit: Number
	});

	// Get the subject (opposite of authorId)
	var target = Bisia.inverseAuthor(authorId);
	// Build owner subject (the one to get from the query)
	var owner = {};
	owner[target] = this.userId;
	// Extend query object
	query = _.extend(query, owner);
	// get cursors
	var visits = Votes.find(query, options);

	if (visits.count()) {
		// map the authorIds
		var userIds = visits.map(function(doc) { return doc[authorId] });
		var authors = Users.find({ '_id': { '$in': userIds }});

		// Meteor._sleepForMs(1000);
		// return cursors
		return [visits, authors];
	}
	return visits;
});