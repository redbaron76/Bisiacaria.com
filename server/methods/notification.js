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
		Bisia.log('resetNotification', result);
	}
});

