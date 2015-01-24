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

userSettingsController = RouteController.extend({
	subscriptions: function() {
		var userId = Meteor.userId();
		if (userId) {
			this.userSub = Meteor.subscribe('user', userId);
		}
	}
});