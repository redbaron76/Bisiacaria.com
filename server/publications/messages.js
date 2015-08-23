// Publish messages list received/sent
Meteor.publish('messagesList', function(query, options, authorId) {
	// check(this.userId, String);
	check(query, Object);
	check(options, {
		sort: Object,
		limit: Number
	});

	var authorIds = [], chatIds = [];
	var chats = Chats.find(query, options);

	chats.forEach(function(chat) {
		// console.log(chat.ownerIds);
		authorIds = authorIds.concat(chat.ownerIds);
		chatIds.push(chat._id);
	});

	var authors = Users.find({ '_id': { '$in': _.uniq(authorIds) }});

	// Publish each counter of unread messages per chatId
	_.each(chatIds, function(el, index) {
		Counts.publish(this, el, Messages.find({ 'chatId': el, 'targetId': this.userId, 'isRead': false }), { noReady: true });
	}, this);

	return [chats, authors];
});

Meteor.publish('messageAuthor', function(query, options) {
	// check(this.userId, String);
	check(query, Object);
	check(options, Object);

	// Meteor._sleepForMs(1000);

	// Extend to be sure userId has access to message
	query = _.extend(query, {
		'$or': [
			{ 'targetId': this.userId },
			{ 'userId': this.userId }
		]
	});

	if (this.userId) {
		// Return cursor
		var messages = Messages.find(query, options);
		if (messages.count() > 0) {
			var first = messages.fetch()[0];
			var authors = Users.find({ '_id': { '$in': [first.userId, first.targetId] }});
			return [messages, authors];
		}
	}
});

Meteor.publish('chatRoom', function(query, options) {
	// check(this.userId, String);
	check(query, Object);
	check(options, Object);

	var isBanned = Chatusers.findOne({ 'userId': this.userId, 'isBanned': true });

	// Meteor._sleepForMs(1000);
	var chatUsers = Chatusers.find();

	if (this.userId && ! isBanned) {
		// Return cursor

		// chat user
		var chatMessages = Chatroom.find(query, options);
		// map the authorIds
		var userIds = chatMessages.map(function(doc) { return doc['userId'] });
		var authors = Users.find({ '_id': { '$in': _.uniq(userIds) }});

		// Meteor._sleepForMs(1000);
		// return cursors
		return [chatMessages, chatUsers, authors];

	}

	return chatUsers;
});