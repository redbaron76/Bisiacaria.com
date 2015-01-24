Template.confirmEmail.events({
	'submit #verify-email': function(e, t) {
		e.preventDefault();
		var token = t.data.token;

		// Triggered when user verifies email by link
		Accounts.verifyEmail(token, function(err) {
			if (err != null) {
				if (err.message = 'Verify email link expired [403]') {
					Bisia.log('Sorry this verification link has expired.');
					Bisia.Ui.resetFormMessages();
					Router.go('homePage');
				}
			} else {
				// Set the login object
				var login = {
					'userId': Meteor.userId(),
					'service': 'password'
				};
				Meteor.call('loginUser', login);
				Bisia.Ui.resetFormMessages();
				Router.go('homePage');
			}
		});
	}
});