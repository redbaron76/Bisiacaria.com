Template.resetPassword.events({
	'submit #reset-password': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);
		var token = t.data.token;

		var formObject = Bisia.Form.getFields($target, 'validateReset');

		if (formObject) {
			Accounts.resetPassword(token, formObject.password, function(error) {
				if (error) {
					return Bisia.Ui.submitError(Bisia.Login.messages.passwordNotSet, 'Cambio non riuscito!');
				}
				Bisia.Login.assertLogin('loginUser', 'password');
			});
		}
	}
});