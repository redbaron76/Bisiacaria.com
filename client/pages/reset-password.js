Template.resetPassword.events({
	'submit #reset-password': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);
		var token = t.data.token;

		var reset = {
			'password': $target.find('#password').val(),
			'passwordConfirmed': $target.find('#passwordConfirmed').val(),
		};

		var errors = Bisia.Validation.validateReset(reset);
		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Accounts.resetPassword(token, reset.password, function(err) {
			if (err) {
				Bisia.log(err);
				Session.set('formErrors', {'email': 'Impossibile recuperare la password'});
				Router.go('recoverPassword');
			}

			// Set the login object
			var login = {
				'userId': Meteor.userId(),
				'service': 'password'
			};
			Meteor.call('loginUser', login);
			Bisia.Ui.resetFormMessages();
			Router.go('homePage');
		});
	}
});

Template.resetPassword.helpers({ });