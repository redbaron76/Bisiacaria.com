Template.registerUser.created = function() {
	// Set flag as false
	Session.set('userIsRegistered', false);
};

Template.registerUser.events({
	'submit form': function(e) {
		e.preventDefault();
		var $target = $(e.target);

		var builtDate = $target.find('#yyyy').val()+"-"+$target.find('#mm').val()+"-"+$target.find('#dd').val();
		var bDay = moment(builtDate, "YYYY-MM-DD", true);

		var birthDate = (bDay.isValid()) ? bDay.toDate() : null;
		var gender = $target.find('[name=gender]:checked').val();

		var user = {
			'username': $target.find('#username').val(),
			'email': $target.find('#email').val(),
			'password': $target.find('#password').val(),
			'passwordConfirmed': $target.find('#passwordConfirmed').val(),
			'profile': {
				'birthday': birthDate,	// Date
				'city': (gender === 'male') ? 'Nuovo iscritto' : 'Nuova iscritta',
				'gender': gender,
				'status': 'none',
				'online': true,
				'loggedWith': 'password'
			}
		};

		var errors = Bisia.Validation.validateRegister(user);

		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Meteor.call('registerUser', user, function(error, result) {
			if(error) {
				Bisia.Ui.loadingRemove();
				Bisia.log(error);
			}

			if(result.errors) {
				Bisia.Ui.loadingRemove();
				return Session.set('formErrors', result.errors);
			}

			Bisia.Ui.resetFormMessages();
			// Email verification alert
			Session.set('userIsRegistered', true);

			// If no errors, login!
			/*Meteor.loginWithPassword({'id': result._id}, result.password, function() {
				Bisia.Ui.resetFormMessages();
				Router.go('homePage');
			});*/
		});
	},
	'click #terms-conditions': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
});

Template.registerUser.helpers({
	'isRegistered': function() {
		return Session.get('userIsRegistered');
	}
});