/*Template.newPostEventModal.rendered = function() {
	var tabObj = Bisia.Ui.getTabObject(this.data, 'newPostTab');
	Bisia.Ui.setReactive('tab', tabObj);
}*/

Template.newPostEventModal.events({
	'click [data-change=tab]': function(e, t) {
		Bisia.Ui.manageTab(e, {
			userId: this.user._id,
			friends: this.user.friends,
			categories: this.user.profile.categories,
		});
	}
});

Template.tabPostEventWrapper.helpers({
	hasTab: function() {
		return Bisia.Ui.tab.get();
	}
});

Template.newPostTab.rendered = function() {
	this.$('.autosize').textareaAutoSize();
	this.$('#date-post').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#time-post').mask('99:99', {placeholder: 'hh:mm'});
}

Template.newPostTab.events({
	'click #open-categories': function(e, t) {
		e.preventDefault();
		Bisia.Ui.setReactive('info', {
			template: 'categoryList',
			categories: this.categories
		});
	},
	'submit #form-post-event': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateNewPost', {
			'datePost': 'dateTimePost.date',
			'timePost': 'dateTimePost.time',
			'positionLat': 'position.lat',
			'positionLng': 'position.lng',
			'location': 'position.loc'
		},{
			'dateTimePost?.separator': '/',
			'imageUrl': ''
		}, {
			'dateTimePost': 'Bisia.Time.nowIfEmpty'
		});

		if (formObject) {
			Meteor.call('saveNewPost', formObject, this.friends, function(error, result) {
				if(error) {
					Bisia.log('saveNewPost', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				if (result) {
					Bisia.Ui.loadingRemove()
							.toggleModal(e, 'tab');
				}
			});
		}
	}
});

Template.newEventTab.rendered = function() {
	this.$('.autosize').textareaAutoSize();
	this.$('#date-event').mask('99/99/9999', {placeholder: 'gg/mm/anno'});
	this.$('#time-event').mask('99:99', {placeholder: 'hh:mm'});
}

Template.newEventTab.events({
	'submit #form-post-event': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, 'validateNewEvent', {
			'dateEvent': 'dateTimeEvent.date',
			'timeEvent': 'dateTimeEvent.time',
			'positionLat': 'position.lat',
			'positionLng': 'position.lng',
			'location': 'position.loc'
		}, {
			'dateTimeEvent?.separator': '/',
			'imageUrl': '',
			'text': ''
		}, {
			'dateTimeEvent': 'Bisia.Time.formatFormDate'
		});

		if (formObject) {
			Meteor.call('saveNewEvent', formObject, this.friends, function(error, result) {
				if(error) {
					Bisia.log('saveNewEvent', error);
					Bisia.Ui.loadingRemove();
					return false;
				}

				if(result.errors)
					return Bisia.Ui.submitError(result.errors);

				if (result) {
					Bisia.Ui.loadingRemove()
							.toggleModal(e, 'tab');
				}
			});
		}
	}
});