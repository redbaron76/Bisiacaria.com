// Profile Methods
Meteor.methods({
	chatRoomEnter: function() {
		check(this.userId, String);

		var isBanned = Chatusers.findOne({ 'userId': this.userId, 'isBanned': true });
		if ( ! isBanned) {
			Chatusers.upsert({ 'userId': this.userId }, { 'userId': this.userId, 'isBanned': false, createdAt: new Date() });
			return false;
		} else {
			return true;
		}
	},
	chatRoomExit: function() {
		check(this.userId, String);

		var isBanned = Chatusers.findOne({ 'userId': this.userId, 'isBanned': true });
		if ( ! isBanned) {
			Chatusers.remove({ 'userId': this.userId });
		}
	},
	chatRoomBanProposal: function(userId) {
		check(this.userId, String);
		check(userId, String);

		var ban = {
			bannerId: this.userId,
			proposedAt: Bisia.Time.now()
		};

		// Add ban to chat user
		Chatusers.update({ 'userId': userId, 'isBanned': false }, {
			'$addToSet': { 'bans': ban },
			'$inc': { 'banProposal': 1 }
		});

		// Log the comment
		Bisia.Log.info('ban proposal', ban);
		return true;
	},
	deleteMessage: function(chatId) {
		check(this.userId, String);
		check(chatId, String);

		Messages.update({ 'chatId': chatId }, { $addToSet: { 'isDelete': this.userId } }, { 'multi': true });
		// add me to isDelete on Chats
		Chats.update(chatId, { $addToSet: { 'isDelete': this.userId } });
		// get chat to check if both delete the chat
		var checkIsDelete = Chats.findOne({ '_id': chatId, 'isDelete': { '$in': [this.userId] } });
		// delete meets ownerIds length -> delete all messages!
		if (checkIsDelete.isDelete.length == checkIsDelete.ownerIds.length) {
			Notifications.remove({ 'action': 'message', 'actionId': chatId });
			Messages.remove({ 'chatId': chatId });
			Chats.remove({ '_id': chatId });
		}
		return true;
	},
	sendChatMessage: function(msgObj) {
		check(this.userId, String);
		check(msgObj, {
			text: String
		});

		var msg = _.extend(msgObj, {
			userId: this.userId,
			createdAt: Bisia.Time.setServerTime()
		});

		msg.text = Bisia.Form.formatEmoj(msg.text);

		// Insert new message
		msg.text = Bisia.Form.sanitizeHTML(msg.text);
		Chatroom.insert(msg);

		// Log chat message
		Bisia.Log.info('chatRoom', msg);

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

		// first message between two users
		if (msg.chatId == '') {
			// check if a chat between me and my target is already present
			var existingChat = Chats.findOne({ 'ownerIds': { '$all': [this.userId, msgObj.targetId] } });

			// CHAT ALREADY EXISTS
			if (existingChat) {
				// update chatId
				msg.chatId = existingChat._id;
				// Insert new message
				msg.text = Bisia.Form.sanitizeHTML(msg.text);
				Messages.insert(msg);
				// Update Chats
				Chats.update(msg.chatId, {
					'$set': {
						msgTo: msgObj.targetId,
						text: msg.text,
						createdAt: msg.createdAt
					},
					// remove targetId from isDelete
					// '$pull': { 'isDelete': msg.targetId }
					'$pull': { 'isDelete': { '$in': [ msg.targetId, Meteor.userId() ] } }
				});

			// CREATE NEW CHAT
			} else {
				// sanitize HTML
				msg.text = Bisia.Form.sanitizeHTML(msg.text);

				// create Chats entry
				var newChat = Chats.insert({
					ownerIds: [this.userId, msgObj.targetId],
					isDelete: [],
					msgTo: msgObj.targetId,
					text: msg.text,
					createdAt: msg.createdAt
				});
				// update chatId
				msg.chatId = newChat;
				// Insert new message
				Messages.insert(msg);
			}

		// chat already started
		} else {
			// Insert new message
			msg.text = Bisia.Form.sanitizeHTML(msg.text);
			Messages.insert(msg);
			// Update Chats
			Chats.update(msg.chatId, {
				'$set': {
					msgTo: msgObj.targetId,
					text: msg.text,
					createdAt: msg.createdAt
				},
				// remove targetId from isDelete
				//'$pull': { 'isDelete': msg.targetId }
				'$pull': { 'isDelete': { '$in': [ msg.targetId, Meteor.userId() ] } }
			});
		}

		// Log chat message
		Bisia.Log.info('chat', msg);

		// Notify message to target user
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

		var userId =  Meteor.userId();

		// set isRead when open a message
		var open = Messages.update({
			'chatId': chatId,
			'targetId': userId,
			'isRead': false
		}, {
			'$set': { 'isRead': true }
		}, {
			'multi': true
		});

		// reset notification messages displayed
		Notifications.remove({
			'action': 'message',
			'actionId': chatId,
			'targetId': userId,
		});
	}
});