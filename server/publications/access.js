// Publish votes
Meteor.publish('accessCheck', function(eventId, userId) {
	check(eventId, String);
	check(userId, String);

	// Fixture valid events
	var events = Meteor.settings.bisiapass.events;
	_.each(events, function(ev, index) {
		// add event if not present
		if (Access.find({ 'eventId': ev.eventId }).count() == 0) {
			ev.scheduledAt = moment(ev.scheduledAt, 'DD/MM/YYYY', true).toDate();
			Access.insert(ev);
		}
	});

	// Get Pass event
	var pass = Access.find({ 'eventId': eventId });
	if (pass) {
		// get user
		var user = Users.find(userId, {
			'fields': { 'username': true }
		});
		// check is user and not already in
		if (user.count() > 0 && Access.find({ 'eventId': eventId, 'joiners': { '$elemMatch': { '_id': userId } } }).count() == 0) {
			joiner = user.fetch()[0];
			joiner.joinedAt = Bisia.Time.now();
			Access.update({
				'eventId': eventId
			}, {
				$addToSet: { 'joiners': joiner },
				$inc: { 'usersCount': 1 }
			});
		}
		return [pass, user];
	}
	return pass;
});