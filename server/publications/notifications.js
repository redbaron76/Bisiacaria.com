Meteor.publish('myNotifications', function() {
	return Notifications.find({userId: this.userId, read: false});
})