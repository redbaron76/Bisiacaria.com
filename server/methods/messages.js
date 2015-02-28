// Profile Methods
Meteor.methods({
	deleteMessage: function(chatId) {
		check(this.userId, String);
		check(chatId, String);

		Messages.update({ 'chatId': chatId }, { $addToSet: { 'isDelete': this.userId } }, { 'multi': true });
		return true;
	},
	sendMessage: function(msgObj, firstMessage) {
		check(this.userId, String);
		check(firstMessage, Boolean);
		check(msgObj, {
			chatId: String,
			targetId: String,
			text: String,
			isDelete: Array
		});

		var user = Meteor.user();

		if (user._id == msgObj.targetId)
			throw new Meteor.Error('error-know', 'Non puoi scrivere a te stesso!');

		var msg = _.extend(msgObj, {
			userId: user._id,
			createdAt: Bisia.Time.now(),
			isRead: false
		});

		msg._id = Messages.insert(msgObj);

		if (firstMessage) {
			// Set chatId if first message
			Messages.update({ '_id': msg._id }, { '$set': { 'chatId': msg._id, 'isFirst': true }});
		}

		// Notify message to target user if not in chat mode
		Bisia.Notification.emit('message', {
			userId: user._id,
			targetId: msg.targetId,
			actionId: msg._id
		});

		return true;
	},
	messageOpen: function(chatId) {
		check(this.userId, String);
		check(chatId, String);

		// set isRead when open a message
		var open = Messages.update({
			'chatId': chatId,
			'targetId': Meteor.userId(),
			'isRead': false
		}, {
			'$set': { 'isRead': true }
		}, {
			'multi': true
		});
	}
});