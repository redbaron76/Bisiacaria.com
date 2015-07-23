/**
 * Template Events
 */
Template.loginUser.events({
	'click .fb-like': function(e, t) {
		e.preventDefault();
		console.log(e.currentTarget);
	},
	'click #login-fb': function(e, t) {
		e.preventDefault();

		var errors = {};

		Meteor.loginWithFacebook({
			requestPermission: [
				'email',
				'public_profile',
				'publish_actions',
				'publish_pages',
				'user_birthday',
				'user_about_me',
				'user_hometown',
				'user_location',
				'user_about_me',
				'user_friends',
				'user_likes',
				'user_posts'
			],
			requestOfflineToken: true
		}, function(error) {
			if (error) {
				if (error.reason == 'Email already exists.') {
					return Bisia.Login.failLogin('facebookEmailExist');
				} else {
					Bisia.Login.failLogin("facebookConnection", error.reason);
				}
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
	},
	detectLikePage: function() {
		var instance = Template.instance();
		Meteor.setTimeout(function() {
			FB.Event.subscribe('edge.create', function() {
				console.log('liked!');
			});
		}, 1000);
		return this;
	}
});