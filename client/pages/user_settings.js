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
	Bisia.Img.cloudinaryUpload(this, 'bisia-upload', settings, bindings);

	var counter = {
		countDown: true,
		stopInputAtMaximum: true
	};

	this.$('.count').textcounter(_.extend(counter, { max: 100}));
	this.$('#bio').textcounter(_.extend(counter, { max: 140}));
	this.$('#city').textcounter(_.extend(counter, { max: 25}));
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
	getBirthDate: function(whichPart) {
		var bDate = Bisia.User.getProfile('birthday').split('-');

		switch(whichPart){
			case 'day':
				return bDate[0];
				break;
			case 'month':
				return bDate[1];
				break;
			case 'year':
				return bDate[2];
				break;
		}
		return;
	}
});

Template.userSettings.events({
	'click #question': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click #lovehate': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click #blockedusers': function(e, t) {
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
		var currentUser = this._id;

		var builtDate = $target.find('#dd').val()+"-"+$target.find('#mm').val()+"-"+$target.find('#yyyy').val();
		var bDay = moment(builtDate, "DD-MM-YYYY", true);

		var birthDate = bDay.isValid() ? builtDate : null;

		var user = {
			'username': $target.find('#username').val(),
			'profile': {
				'bio': $target.find('#bio').val(),
				'birthday': birthDate,					// Date
				'city': $target.find('#city').val(),
				'status': $target.find('[name=status]:checked').val()
			}
		};

		var errors = Bisia.Validation.validateProfileData(user);

		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Meteor.call('saveProfileData', user, currentUser, function(error, result) {
			if(error) Bisia.Ui.loadingRemove();

			if(result.errors) {
				Bisia.Ui.loadingRemove();
				return Session.set('formErrors', result.errors);
			}

			if (result) Bisia.Ui.resetFormMessages();
		});
	},
	'submit #account-form': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);
		var currentUser = this._id;

		var user = {
			'email': $target.find('#email').val(),
			'password': $target.find('#password').val(),
			'passwordConfirmed': $target.find('#passwordConfirmed').val(),
		};

		var errors = Bisia.Validation.validateAccountData(user);

		if (Bisia.has(errors)) {
			Bisia.Ui.loadingRemove();
			return Session.set('formErrors', errors);
		}

		Meteor.call('saveAccountData', user, currentUser, function(error, result) {
			if(error) Bisia.Ui.loadingRemove();

			if(result.errors) {
				Bisia.Ui.loadingRemove();
				return Session.set('formErrors', result.errors);
			}

			if (result) Bisia.Ui.resetFormMessages();
		});
	}
});