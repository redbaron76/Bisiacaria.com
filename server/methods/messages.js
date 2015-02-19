// Profile Methods
Meteor.methods({
	sendMessage: function(msgObj) {
		check(this.userId, String);
		check(msgObj, {
			targetId: String,
			text: String
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
		// Notify message to target user
		Bisia.Notification.emit('message', {
			userId: user._id,
			targetId: msg.targetId,
			actionId: msg._id
		});

		return true;
	}
});