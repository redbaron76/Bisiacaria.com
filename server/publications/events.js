// Publish events of the week
Meteor.publish('nextWeekEvents', function(options) {

	// Meteor._sleepForMs(500);
	var thisWeek = {
		'$gte': Bisia.Time.todayStart(),
		'$lte': Bisia.Time.dayEnd(7)
	};

	// Bisia.log(thisWeek);
	// Get friends cursor
	var events = Events.find({ 'dateTimeEvent': thisWeek }, options);

	if (events.count() > 0) {
		// map the authorIds
		var userIds = events.map(function(doc) { return doc['authorId'] });
		var authors = Users.find({ '_id': { '$in': userIds }});
		// return cursors
		return [events, authors];
	}
});

// Publish a single Event
Meteor.publish('singleEvent', function(eventId) {
	check(eventId, String);

	// Meteor._sleepForMs(500);

	// Get the event
	var event = Events.find({ '_id': eventId });

	if (event.count() > 0) {
		// map the authorIds
		var userIds = event.map(function(doc) {
			return _.map(doc['joiners'], function(value, key) {
				return value['authorId'];
			});
		});

		// get authors of likes and comments
		var authors = Users.find({ '_id': { '$in': userIds[0] }});

		// Return cursor
		return [event, authors];
	}
});