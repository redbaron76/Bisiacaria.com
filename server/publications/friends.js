// Publish friends
Meteor.reactivePublish('friendsList', function(query, options, authorId) {
	check(this.userId, String);
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
	var friends = Friends.find(query, options);
	// map the authorIds
	var userIds = friends.map(function(doc) { return doc[authorId] });
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [friends, authors];
});

// Publish your friends
Meteor.publish('myFriends', function() {
	check(this.userId, String);

	// Meteor._sleepForMs(500);

	// Get friends cursor
	var friends = Friends.find({ 'targetId': this.userId });
	// map the authorIds
	var userIds = friends.map(function(doc) { return doc['userId'] });
	var authors = Users.find({ '_id': { '$in': userIds }});
	// return cursors
	return [friends, authors];
});