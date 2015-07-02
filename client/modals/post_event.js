Template.newPostEventModal.events({
	'click [data-change=tab]': function(e, t) {
		var user = (this.user) ? this.user : this;
		Bisia.Ui.manageTab(e, {
			userId: user._id,
			followers: user.followers,
			categories: user.profile.categories,
		});
	}
});

Template.tabPostEventWrapper.helpers({
	hasTab: function() {
		return Bisia.Ui.tab.get();
	}
});

Template.newPostTab.onRendered(function() {
	this.$('.autosize').textareaAutoSize();
	this.$('#date-post').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#time-post').mask('99:99', {placeholder: 'hh:mm'});
});

Template.newPostTab.events({
	'click #open-categories': function(e, t) {
		e.preventDefault();
		Bisia.Ui.setReactive('info', {
			template: 'categoryList',
			categories: this.categories
		});
	},
	'click #open-geotags': function(e, t) {
		e.preventDefault();
		var places = Bisia.Map.getNearPlaces(100, 20);
		if (places.count() > 0) {
			Bisia.Ui.setReactive('info', {
				template: 'geotagList',
				geotags: places
			});
		}
	},
	'submit #form-post-event': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateNewPost', {
			'datePost': 'dateTimePost.date',
			'timePost': 'dateTimePost.time',
			'positionLat': 'position.lat',
			'positionLng': 'position.lng',
			'location': 'position.location',
			'geotag': 'position.tag'
		},{
			'dateTimePost?.separator': '/',
			'imageUrl': '',
			'tagId': ''
		}, {
			'dateTimePost': 'Bisia.Time.nowIfEmpty'
		});

		if (formObject) {
			Meteor.call('saveNewPost', formObject, function(error, result) {
				if(error) {
					Bisia.log('saveNewPost', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				if (result) {
					// record position to user.js
					Bisia.User.recordLastPosition(formObject.position);
					Bisia.Ui.loadingRemove()
							.toggleModal(e, 'tab')
							.submitSuccess('Il tuo post è stato pubblicato correttamente.', 'Pubblicato!', null, true);
				}
			});
		}
	}
});

Template.newEventTab.onRendered(function() {
	this.$('.autosize').textareaAutoSize();
	this.$('#date-event').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#time-event').mask('99:99', {placeholder: 'hh:mm'});
});

Template.newEventTab.events({
	'submit #form-post-event': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateNewEvent', {
			'dateEvent': 'dateTimeEvent.date',
			'timeEvent': 'dateTimeEvent.time',
			'positionLat': 'position.lat',
			'positionLng': 'position.lng',
			'location': 'position.location'
		}, {
			'dateTimeEvent?.separator': '/',
			'imageUrl': '',
			'text': '',
			'tagId': ''
		}, {
			'dateTimeEvent': 'Bisia.Time.formatFormDate'
		});

		if (formObject) {
			Meteor.call('saveNewEvent', formObject, function(error, result) {
				if(error) {
					Bisia.log('saveNewEvent', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				if (result) {
					var successMsg = 'Il tuo evento è stato pubblicato correttamente e sarà visibile' +
									 ' in "Eventi della settimana" a 7 giorni dalla sua scadenza.';

					Bisia.Ui.loadingRemove()
							.toggleModal(e, 'tab')
							.submitSuccess(successMsg, 'Pubblicato!', null, true);
				}
			});
		}
	}
});