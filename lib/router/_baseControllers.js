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
		// requireLogin filter
		Bisia.Login.requireLogin.call(this);
		// Unlock sidebar click on change page
		Bisia.Ui.sidebarLock = false;
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