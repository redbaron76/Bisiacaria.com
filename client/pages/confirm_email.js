Template.confirmEmail.events({
	'submit #verify-email': function(e, t) {
		e.preventDefault();
		var token = t.data.token;

		// Triggered when user verifies email by link
		Accounts.verifyEmail(token, function(error) {
			if (error) {
				return Bisia.Ui.submitError(Bisia.Login.messages.unableVerifyEmail, 'Verifica non riuscita!');
			}

			Bisia.Login.assertLogin('loginUser', 'password');
		});
		return false;
	}
});