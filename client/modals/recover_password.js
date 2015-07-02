Template.recoverPasswordModal.events({
	'submit #recover-password': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateRecover');

		if (formObject) {
			Accounts.forgotPassword(formObject, function(error) {
				if (error) {
					return Bisia.Ui.submitError(Bisia.Login.messages.emailNotPresent, 'Recupero non riuscito!');
				}
				$('#emailRecover').val('');
				return Bisia.Ui.submitSuccess(Bisia.Login.messages.passwordRecovered);
			});
			return false;
		}
	}
});