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
			text: Bisia.Form.sanitizeHTML(text),
			authorId: this.userId,
			createdAt: Bisia.Time.setServerTime()
		};

		comment.text = Bisia.Form.formatEmoj(comment.text);

		// Add comment to post
		Posts.update(targetPost.postId, { $addToSet: { 'comments': comment }, $inc: { 'commentsCount': 1 } });

		// Log the comment
		Bisia.Log.info('post comment', {postId: targetPost.postId, comment: comment});

		var authorNick = _.pick(Users.findOne({ '_id': targetPost.targetId }), '_id', 'username');

		targetPost = _.extend(targetPost, {
			authorId: authorNick._id,
			authorNick: authorNick.username
		});

		var citeObj = _.extend(comment, {
			_id: targetPost.postId
		});

		Bisia.Notification.notifyCiteUsers('note', 'comment', citeObj, 'commento');

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
			var selfUser = (comment.authorId == targetPost.authorId) ? true : false;
			Bisia.Notification.emit('note', {
				actionId: targetPost.postId,
				actionKey: 'comment',
				targetId: targetId,
				userId: comment.authorId,
				message: Bisia.Notification.noteMsg('comment', targetPost, false, selfUser)
			});
		});

		return true;
	},
	sendMessage: function(msgObj) {
		check(this.userId, String);
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
			createdAt: Bisia.Time.setServerTime(),
			isRead: false
		});

		msg.text = Bisia.Form.formatEmoj(msg.text);

		// if not a valid chatId
		if (msg.chatId == '') {
			// check if a chat between me and my target is already present
			var existingChat = Messages.findOne({
				// 'isDelete': { '$nin': [msg.targetId, this.userId] },
				'chatId': { '$exists': true },
				'$and': [
					{'$or': [{ 'targetId': this.userId },{ 'userId': this.userId }]},
					{'$or': [{ 'targetId': msg.targetId },{ 'userId': msg.targetId }]}
				]
			});

			if (existingChat) {
				// Bisia.log('chat esiste', existingChat);
				msg.chatId = existingChat.chatId;
				// Insert new message
				msg.text = Bisia.Form.sanitizeHTML(msg.text);
				Messages.insert(msg);
			} else {
				// Bisia.log('chat non esiste', existingChat);
				// Insert new message
				msg.text = Bisia.Form.sanitizeHTML(msg.text);
				msg._id = Messages.insert(msg);
				Messages.update({ '_id': msg._id }, { '$set': { 'chatId': msg._id }});
				msg.chatId = msg._id;
			}

		} else {
			// Insert new message
			msg.text = Bisia.Form.sanitizeHTML(msg.text);
			Messages.insert(msg);
		}

		// Log chat message
		Bisia.Log.info('chat', msg);

		// Notify message to target user if not in chat mode
		Bisia.Notification.emit('message', {
			actionId: msg.chatId,
			targetId: msg.targetId,
			userId: this.userId,
			message: 'ti ha inviato un nuovo <strong>messaggio privato</strong>.'
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