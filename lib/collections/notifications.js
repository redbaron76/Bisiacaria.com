// Notifications
Notifications = new Mongo.Collection('notifications');

Notifications.allow({
	insert: function(userId, doc) {
		return (doc.action == 'note');
	}
});