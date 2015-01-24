Template.recoverPasswordModal.events({
	'submit #recover-password': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var recover = {
			'emailRecover': $target.find('#emailRecover').val()
		};

		var errors = Bisia.Validation.validateRecover(recover);
		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Accounts.forgotPassword({email: recover.emailRecover}, function(err) {
			if (err) {
				if (err.message === 'User not found [403]') {
					errors.emailRecover = 'Questa e-mail non risulta essere registrata';
				} else {
					errors.emailRecover = 'Si è verificato un errore nel recupero della password';
				}
				Bisia.Ui.loadingRemove();
				return Session.set('formErrors', errors);
			} else {
				Bisia.Ui.resetFormMessages();
				return Session.set('formSuccess', {emailRecover: "L'e-mail è stata inviata!"});
				// Trigga Accounts.sendResetPasswordEmail
			}
		});
		return false;
	}
});

Template.recoverPasswordModal.helpers({ });