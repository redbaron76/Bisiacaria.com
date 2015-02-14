// Publish friends
Meteor.publish('friends', function(query, options) {
	// Meteor._sleepForMs(1000);
	return Friends.find(query, options);
});

Meteor.reactivePublish('getFriendsAndAuthor', function(query, options) {
	// Extend query object
	query = _.extend(query, {targetId: this.userId});
	// get cursors
	var visits = Friends.find(query, options);
	var userIds = visits.map(function(doc) { return doc.userId });
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [visits, authors];
});

Meteor.reactivePublish('getYourFriendsAndAuthor', function(query, options) {
	// Extend query object
	query = _.extend(query, {userId: this.userId});
	// get cursors
	var visits = Friends.find(query, options);
	var userIds = visits.map(function(doc) { return doc.userId });
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [visits, authors];
});