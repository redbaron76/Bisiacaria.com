// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.log('UnloggedController', 'onBeforeAction');
		Bisia.Ui.resetFormMessages();
		this.next();
	}
});

// Password-protected pages controller
LoggedController = UnloggedController.extend({
	onBeforeAction: function() {
		Bisia.log('LoggedController', 'onBeforeAction');
		if(!Meteor.userId()) {
			Router.go('/login');
		}
		this.next();
	}
});