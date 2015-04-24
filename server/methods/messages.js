// Profile Methods
Meteor.methods({
	deleteMessage: function(chatId) {
		check(this.userId, String);
		check(chatId, String);

		Messages.update({ 'chatId': chatId }, { $addToSet: { 'isDelete': this.userId } }, { 'multi': true });
		return true;
	},
	sendComment: function(targetPost, text) {
		check(this.userId, String);
		check(text, String);
		check(targetPost, {
			postId: String,
			targetId: String,
			notifyIds: Array
		});

		// Block sending comment if targetId is blocked
		if (Bisia.User.isBlocked(targetPost.targetId))
			return true;

		var comment = {
			text: text,
			authorId: this.userId,
			createdAt: Bisia.Time.serverTime
		};

		// Add comment to post
		Posts.update(targetPost.postId, { $addToSet: { 'comments': comment }});

		var authorNick = _.pick(Users.findOne({ '_id': targetPost.targetId }), 'username');

		targetPost = _.extend(targetPost, {
			authorNick: authorNick.username
		});

		// Notify post author
		Bisia.Notification.emit('note', {
			actionId: targetPost.postId,
			actionKey: 'comment',
			targetId: targetPost.targetId,
			userId: this.userId,
			message: Bisia.Notification.noteMsg('comment', targetPost, true)
		});

		// Notify joiners of the post
		_.each(targetPost.notifyIds, function(targetId) {
			Bisia.Notification.emit('note', {
				actionId: targetPost.postId,
				actionKey: 'comment',
				targetId: targetId,
				userId: comment.authorId,
				message: Bisia.Notification.noteMsg('comment', targetPost, false)
			});
		});

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

		if (this.userId == msgObj.targetId)
			throw new Meteor.Error('error-know', 'Non puoi scrivere a te stesso!');

		// Block sending messages if targetId is blocked
		if (Bisia.User.isBlocked(msgObj.targetId))
			return true;

		var msg = _.extend(msgObj, {
			userId: this.userId,
			createdAt: Bisia.Time.now(),
			isRead: false
		});

		// Insert new message
		msg._id = Messages.insert(msg);

		if (firstMessage) {
			// Set chatId if first message
			Messages.update({ '_id': msg._id }, { '$set': { 'chatId': msg._id, 'isFirst': true }});
		}

		// Notify message to target user if not in chat mode
		Bisia.Notification.emit('message', {
			userId: this.userId,
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