// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Ui.resetFormMessages();
		this.next();
	}
});

// Password-protected pages controller
LoggedController = UnloggedController.extend({
	onBeforeAction: function() {
		// Force login if not login (TO DO!!!)
		if(!Bisia.Login.profileLogged()) {
			this.render('loginUser');
			// this.redirect('/login');
		}
		Bisia.Message.resetMessageProperties();
		// Execute next
		this.next();
	}
});