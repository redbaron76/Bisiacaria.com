Template.registerUser.onCreated(function() {
	// Set flag as false
	Session.set('userIsRegistered', false);
});

Template.registerUser.onRendered(function() {
	this.$('#birthday').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
});

Template.registerUser.events({
	'submit form': function(e) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateRegister', {
			'birthday': 'birthDate.date',
			'gender': 'profile.gender'
		}, {
			'verifyKey': '',
			'birthDate?.separator': '/',
			'profile.city': 'Nuova iscrizione',
			'profile.status': 'none',
			'profile.online': false,
			'profile.loggedWith': 'password'
		}, {
			'birthDate': 'Bisia.Time.formatBirthDate'
		}, {
			'profile.birthday': 'birthDate',
		});

		if (formObject) {
			Meteor.call('registerUser', formObject, function(error, result) {
				if(error) {
					Bisia.log(error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				Session.set('userIsRegistered', result);
				// var welcome = formObject.profile.gender == 'male' ? 'Benvenuto' : 'Benvenuta';
				// return Bisia.Ui.submitSuccess(Bisia.Login.messages.welcome, welcome + ' su Bisia!');

			});
		}

	},
	'click #privacy-policy': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'privacyPolicyModal');
	},
	'click #regolamento': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'regolamentoModal');
	}
});

Template.registerUser.helpers({
	'isRegistered': function() {
		return Session.get('userIsRegistered');
	}
});