// Publish messages list received/sent
Meteor.reactivePublish('messagesList', function(query, options, authorId) {
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
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Meteor._sleepForMs(1000);
	// return cursors
	return [messages, authors];
});