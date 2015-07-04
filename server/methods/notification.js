// Notification methods
Meteor.methods({
	likeUnlike: function(action, obj) {
		if (Notifications.find({'actionId': obj.actionId,'actionKey': obj.actionKey,'targetId': obj.targetId,'userId': obj.userId }).count() == 0) {
			Bisia.Notification.emit(action, obj);
		}
	},
	resetNotification: function(action, actionKey) {
		check(action, String);
		var query = {
			'targetId': Meteor.userId(),
			'action': action,
			'isRead': false
		};
		if (actionKey) {
			query = _.extend(query, {
				actionKey: actionKey
			});
		}
		var result = Notifications.update(query, {
			$set: {
				'isRead': true
			}
		}, {
			'multi': true
		});
	},
	sharePost: function(postObj, shareArr) {
		check(this.userId, String);
		check(shareArr, Array);
		check(postObj, Object);

		var userId = this.userId;
		var authorNick = _.pick(Users.findOne({ '_id': postObj.authorId }), 'username');

		postObj = _.extend(postObj, {
			countShares: shareArr.length,
			authorNick: authorNick.username
		});

		// Get people blocked
		var blockIds = Bisia.User.getBlockIds(userId);

		Bisia.Notification.emit('note', {
			actionId: postObj._id,
			actionKey: 'share',
			authorId: postObj.authorId,
			targetId: postObj.authorId,
			userId: userId,
			message: Bisia.Notification.noteMsg('share', postObj, true)
		}, blockIds);

		_.each(shareArr, function(targetId) {
			Bisia.Notification.emit('note', {
				actionId: postObj._id,
				actionKey: 'share',
				authorId: postObj.authorId,
				targetId: targetId,
				userId: userId,
				message: Bisia.Notification.noteMsg('share', postObj, false)
			}, blockIds);
		});

		return true;
	},
	queueNotificationMail: function(target, notyObj) {
		var obj = _.pick(notyObj, 'createdAt', 'message');
		var saveObj = _.extend(obj, {
			email: target.email,
			username: target.username,
		});

		var alreadyQueued = Emails.findOne({
			email: target.email,
			actionId: notyObj.actionId
		});

		if (saveObj.email && saveObj.message && ! alreadyQueued)
			Emails.insert(saveObj);
	}
});

