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
		// Force logout if not online
		/*if(Bisia.Login.forceUnlogged()) {
			Bisia.log('Sei stato disconnesso');
			var router = this;
			Meteor.logout(function() {
				router.redirect('/login');
				// router.stop();
				Bisia.log('forceUnlogged', Meteor.userId());	
			});
			
		}*/
		Bisia.Message.resetMessageProperties();
		// Execute next
		this.next();
	}
});