Template.userSettings.onRendered(function() {

	// UPLOAD IMAGE TO CLOUDINARY
	/*var settings = {
		format: 'jpg',
		width: 200,
		height: 200,
		crop: 'thumb',
		gravity: 'faces:center'
	};
	var bindings = {
		start: 'settingsCloudinaryStart',
		progress: 'settingsCloudinaryProgress',
		done: 'settingsCloudinaryDone'
	};
	Bisia.Img.cloudinaryUpload('#avatar-profile', 'profile', settings, bindings, this);*/

	var counter = {
		countDown: true,
		stopInputAtMaximum: true
	};

	this.$('#birthday').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#bio').textcounter(_.extend(counter, { max: 140}));
	this.$('#city').textcounter(_.extend(counter, { max: 25}));
	this.$('.count').textcounter(_.extend(counter, { max: 100}));
	this.$('.autosize').textareaAutoSize();

});

Template.userSettings.helpers({
	checkStatus: function(val, user) {
		var status = user.profile.status;
		return Bisia.Ui.isChecked(val, status);
	},
	countBlocked: function() {
		return this.blocked.length;
	},
	getAccount: function() {
		return Bisia.User.getProfile('loggedWith');
	},
	getBirthDate: function() {
		return Bisia.User.getProfile('birthday').replace('-', '/');
	}
});

Template.userSettings.events({
	'click #question': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'questionModal');
	},
	'click #lovehate': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'loveHateModal');
	},
	'click #blockedusers': function(e, t) {
		e.preventDefault();
		Bisia.Ui.setReactive('info', {
			template: 'blockedList',
			blocked: this.blocked
		});
	},
	'click #deleteaccount': function(e, t) {
		e.preventDefault();
		var data = _.extend(this, {
			infoTitle: "Eliminare l'account?",
			infoText: "Procedendo con l'eliminazione, il tuo profilo non sarà più disponibile entro le prossime 24 ore."
		});
		Bisia.Ui.confirmDialog('Bisia.User.deleteUser', e, data);
	},
	'click #delete-img': function(e, t) {
		e.preventDefault();
		var data = _.extend(this, {
			infoTitle: "Eliminare la foto?",
			infoText: "Il tuo avatar verrà rimosso completamente dal sistema."
		});
		Bisia.Ui.confirmDialog('Bisia.User.deleteAvatar', e, data);
	},
	'submit #profile-form': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);
		// var currentUser = this._id;

		var formObject = Bisia.Form.getFields($target, 'validateProfileData', {
			'birthday': 'birthDate.date',
			'city': 'profile.city',
			'status': 'profile.status',
			'bio': 'profile.bio',
		}, {
			'birthDate?.separator': '/',
			'profile.status': 'none'
		}, {
			'birthDate': 'Bisia.Time.formatBirthDate'
		}, {
			'profile.birthday': 'birthDate'
		});

		var username = Meteor.user()['username'];

		if (formObject) {
			Meteor.call('saveProfileData', formObject, username, function(error, result) {
				if(error) {
					Bisia.log('saveProfileData', error);
					Bisia.Ui.loadingRemove()
							.waitStop();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				Bisia.Ui.loadingRemove()
						.waitStop()
						.submitSuccess('I dati sono stati salvati correttamente.', 'Salvato!', null, true);

				return result;
			});
		}
	},
	'submit #account-form': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateAccountData');

		if (formObject) {
			Meteor.call('saveAccountData', formObject, function(error, result) {
				if(error) {
					Bisia.log('saveAccountData', error);
					Bisia.Ui.loadingRemove()
							.waitStop();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				Bisia.Ui.loadingRemove()
						.waitStop()
						.submitSuccess('I dati sono stati salvati correttamente.', 'Salvato!', null, true);

				return result;
			});
		}
	},
	'change #enable-audio': function(e, t) {
		var status = e.currentTarget.checked;
		Bisia.User.notifyAudio = status;
		Users.update(Meteor.userId(), {'$set': {'profile.notifyAudio': status}});
	},
	'change #enable-mail': function(e, t) {
		var status = e.currentTarget.checked;
		Bisia.User.notifyMail = status;
		Users.update(Meteor.userId(), {'$set': {'profile.notifyMail': status}});
	},
	'change #enable-online': function(e, t) {
		var status = e.currentTarget.checked;
		Bisia.User.notifyFriends = status;
		Users.update(Meteor.userId(), {'$set': {'profile.notifyFriends': status}});
	},
	'click #newsletter-signup': function(e, t) {
		e.preventDefault();
		var email = Bisia.User.getUser("emails", this)[0].address;
		Meteor.call('newsletterSignup', email, function(error, result) {
			if (result)
				return Bisia.Ui.submitSuccess('La tua iscrizione alla newsletter è andata a buon fine!');
		});
	},
	'click #facebook-connect': function(e, t) {
		e.preventDefault();
		Package.facebook.Facebook.requestCredential({
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
			requestOfflineToken: true,
			loginStyle: 'popup'
		}, function(token) {
			var secret = Package.oauth.OAuth._retrieveCredentialSecret(token);
			Meteor.call('userAddOAuthCredentials', token, secret, 'facebook', function(error) {
				if (error)
					Bisia.Login.failLogin("facebookConnection", error.reason);
			})
		});
	},
	'click #facebook-logout': function(e, t) {
		e.preventDefault();
		Meteor.call('userRemoveOAuthCredentials', function(error, success) {

		});
	},
});