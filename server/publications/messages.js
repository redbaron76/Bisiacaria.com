// Publish messages list received/sent
Meteor.reactivePublish('messagesList', function(query, options, authorId) {
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
	var messages = Messages.find(query, options);
	// map the authorIds
	var userIds = messages.map(function(doc) { return doc[authorId] });
	var chatIds = messages.map(function(doc) { return doc.chatId });

	// Publish each counter of unread messages per chatId
	_.each(chatIds, function(el, index) {
		Counts.publish(this, el, Messages.find({ 'chatId': el, 'targetId': this.userId, 'isRead': false }), { noReady: true });
	}, this);

	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [messages, authors];
});

Meteor.reactivePublish('messageAuthor', function(query, options, limit) {
	check(this.userId, String);

	var userId = this.userId;
	// Extend to be sure userId has access to message
	query = _.extend(query, {
		'$and': [{
			'$or': [
				{ 'targetId': userId },
				{ 'userId': userId }
			]
		}]
	});

	// Return cursor
	var messages = Messages.find(query, options);
	var first = messages.fetch()[0];
	var authors = Users.find({ '_id': { '$in': [first.userId, first.targetId] }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [messages, authors];
});