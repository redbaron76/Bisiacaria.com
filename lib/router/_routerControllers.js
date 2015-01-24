// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Ui.resetFormMessages();
		this.next();
	}
});

// Password-protected pages controller
LoggedController = UnloggedController.extend({
	subscriptions: function() {

	}
});

UserProfileController = RouteController.extend({
	subscriptions: function() {
		var username = this.params.username;
		if (username)
			this.userProfileSub = Meteor.subscribe('userProfile', username);
	},
	data: function() {
		return Users.findOne({ 'username': this.params.username });
	}
});

UserSettingsController = RouteController.extend({
	subscriptions: function() {
		var userId = Meteor.userId();
		if (userId)
			this.userSub = Meteor.subscribe('user', userId);
	}
});