/**
 * Template Events
 */
Template.loginUser.events({
	'click #login-fb': function(e, t) {
		e.preventDefault();

		var errors = {};

		Meteor.loginWithFacebook({
			requestPermission: ['email', 'publish_actions', 'user_birthday', 'user_friends', 'user_about_me', 'user_hometown'],
			requestOfflineToken: true
		}, function(error) {
			if (error) {
				if (error.reason) {
					errors.email = (error.reason == 'Email already exists.') ? "L'e-mail del tuo account Facebook è già stata usata" : "Login non riuscito, riprovare!";
				} else {
					errors.email = 'Errore nel collegamento con Facebook, riprovare!';
				}
				// Bisia.log(errors);
				return Session.set('formErrors', errors);
			} else {
				// Set the login object
				var login = {
					'userId': Meteor.userId(),
					'service': 'facebook'
				};
				// Call loginFacebook method
				Meteor.call('loginFacebook', login, function(error, result) {
					if (error) {
						errors.email = 'Errore nel collegamento con Facebook, riprovare!';
						return Session.set('formErrors', errors);
					}

					if (result) {
						Router.go('homePage');
					}
				});
			}
		});
	},
	'submit #login-form': function(e) {
		e.preventDefault();
		var $target = $(e.target);

		var email = Bisia.trimInput($target.find('#email').val()),
			password = $target.find('#password').val();

		var errors = Bisia.Validation.validateLogin({
			'email': email,
			'password': password
		});

		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Meteor.loginWithPassword(email, password, function(error) {
			if (error) {
				// Mail account not verified via mail
				if (error.reason) {
					// Bisia.log(error.reason);
					errors.email = (error.reason == 'Indirizzo e-mail non ancora verificato via mail') ? error.reason : 'Login non riuscito, riprovare!';
					errors.password = '';
				} else {
					errors.email = '';
					errors.password = 'Indirizzo e-mail e password non corrispondenti';
				}
				// Bisia.log(errors);
				return Session.set('formErrors', errors);
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

		return false;
	},
	'click #recover-password-modal': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
});

/**
 * Template Helpers
 */
Template.loginUser.helpers({
	errors: function() {
		return Session.get('loginUserErrors');
	},
	fbReady: function() {
		return Accounts.loginServicesConfigured();
	}
});