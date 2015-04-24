// Publish friends
/*Meteor.reactivePublish('friendsList', function(query, options, authorId) {
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
});*/

// Publish events of the week
Meteor.publish('nextWeekEvents', function(options) {

	// Meteor._sleepForMs(500);
	var thisWeek = {
		'$gte': Bisia.Time.todayStart(),
		'$lte': Bisia.Time.dayEnd(7)
	};

	Bisia.log(thisWeek);
	// Get friends cursor
	var events = Events.find({ 'dateTimeEvent': thisWeek }, options);
	// map the authorIds
	var userIds = events.map(function(doc) { return doc['authorId'] });
	var authors = Users.find({ '_id': { '$in': userIds }});
	// return cursors
	return [events, authors];
});