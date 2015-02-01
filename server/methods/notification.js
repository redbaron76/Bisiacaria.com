Meteor.methods({
	resetNotification: function(action) {
		check(action, String);
		Notifications.update({
			'targetId': Meteor.userId(),
			'action': action
		}, {
			$set: {
				'isRead': true
			}
		}, {
			'multi': true
		});
	}
});

