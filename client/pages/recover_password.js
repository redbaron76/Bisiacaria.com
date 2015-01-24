Template.recoverPassword.events({
	'submit #recover-password': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var recover = {
			'email': $target.find('#email').val()
		};

		var errors = Bisia.Validation.validateRecover(recover);
		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Accounts.forgotPassword({email: recover.email}, function(err) {
			if (err) {
				if (err.message === 'User not found [403]') {
					errors.email = 'Questa e-mail non risulta essere registrata';
				} else {
					errors.email = 'Si è verificato un errore nel recupero della password';
				}
				Bisia.Ui.loadingRemove();
				return Session.set('formErrors', errors);
			} else {
				Bisia.Ui.loadingRemove();
				return Session.set('formSuccess', {email: "L'e-mail è stata inviata!"});
				// Trigga Accounts.sendResetPasswordEmail
			}
		});
		return false;
	}
});

Template.recoverPassword.helpers({ });