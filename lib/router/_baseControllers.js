// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		// Filter "requireLogin"
		if(Bisia.User.isLogged()) {
			this.render('homePage');
		} else {
			this.next();
		}
	}
});

// Password-protected pages controller
LoggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Login.requireLogin.call(this);
	},
	subscriptions: function() {
		if (Meteor.userId()) {
			return Meteor.subscribe('userSettings');
		}
	}
});