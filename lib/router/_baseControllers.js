// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Ui.resetFormMessages();

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
		// Bisia.Message.resetMessageProperties();

		// Filter "alreadyLogged"
		/*if(! Bisia.User.isLogged()) {
			if(Meteor.loggingIn()) {
				this.render(this.loadingTemplate);
			} else {
				this.render('loginUser');
			}
		} else {
			this.next();
		}*/
		Bisia.Login.requireLogin.call(this);
	}
});