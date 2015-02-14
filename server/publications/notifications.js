// Publish notifications
Meteor.publish('notifications', function(query, options) {
	// Meteor._sleepForMs(1000);
	return Notifications.find(query, options);
});

Meteor.reactivePublish('getVisitsAndAuthor', function(query, options) {
	// Extend query object
	query = _.extend(query, {targetId: this.userId});
	// get cursors
	var visits = Notifications.find(query, options);
	var userIds = visits.map(function(doc) { return doc.userId });
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [visits, authors];
});