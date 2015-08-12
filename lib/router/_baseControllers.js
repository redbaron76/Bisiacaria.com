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
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe('userSettings');
		}
	},
	onAfterAction: function() {
		if (this.pageReady && this.pageReady.ready())
			Bisia.User.init(Meteor.user());
	}
});