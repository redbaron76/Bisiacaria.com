// Notification methods
Meteor.methods({
	resetNotification: function(action) {
		check(action, String);
		var result = Notifications.update({
			'targetId': Meteor.userId(),
			'action': action,
			'isRead': false
		}, {
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
		var blockIds = Bisia.User.getBlockIds(this.notify.userId);

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
	}
});

