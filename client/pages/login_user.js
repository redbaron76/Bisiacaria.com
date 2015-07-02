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
				return Bisia.Login.failLogin('facebookEmailExist');
			}
			Bisia.Login.assertLogin('loginFacebook', 'facebook');
		});
	},
	'submit #login-form': function(e) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateLogin');

		if (formObject) {
			Meteor.loginWithPassword(formObject.email, formObject.password, function(error) {
				if (error) {
					Bisia.log(error);
					return Bisia.Login.failLogin('loginFormFail');
				}
				Bisia.Login.assertLogin('loginUser', 'password');
			});
		}

	},
	'click #recover-password-modal': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'recoverPasswordModal');
	},
});

/**
 * Template Helpers
 */
Template.loginUser.helpers({
	fbReady: function() {
		return Accounts.loginServicesConfigured();
	}
});