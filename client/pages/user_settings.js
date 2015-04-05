Template.userSettings.rendered = function() {

	// UPLOAD IMAGE TO CLOUDINARY
	var settings = {
		format: 'jpg',
		width: 200,
		height: 200,
		crop: 'thumb',
		gravity: 'faces:center'
	}
	var bindings = {
		start: 'settingsCloudinaryStart',
		progress: 'settingsCloudinaryProgress',
		done: 'settingsCloudinaryDone'
	}
	Bisia.Img.cloudinaryUpload('#image-form', 'bisia-upload', settings, bindings, this);

	var counter = {
		countDown: true,
		stopInputAtMaximum: true
	};

	this.$('#birthday').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#bio').textcounter(_.extend(counter, { max: 140}));
	this.$('#city').textcounter(_.extend(counter, { max: 25}));
	this.$('.count').textcounter(_.extend(counter, { max: 100}));
	this.$('.autosize').textareaAutoSize();

};

Template.userSettings.helpers({
	checkStatus: function(val, user) {
		var status = user.profile.status;
		return Bisia.Ui.isChecked(val, status);
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
		Bisia.Ui.toggleModal(e);
	},
	'click #lovehate': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e);
	},
	'click #blockedusers': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e);
	},
	'click #delete-img': function(e, t) {
		e.preventDefault();
		Users.update({ '_id': Meteor.userId() }, { $set: { 'profile.avatar': '' }});
	},
	'click .avatar': function(e, t) {
		e.preventDefault();
		var $preview = $(e.target);
		var $form = $preview.parents('.uploader').next('#image-form');
		$form.trigger('click');
		return false;
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

		if (formObject) {
			Meteor.call('saveProfileData', formObject, function(error, result) {
				if(error) {
					Bisia.log('saveProfileData', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				Bisia.Ui.loadingRemove();
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
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				Bisia.Ui.loadingRemove();
				return result;
			});
		}
	}
});