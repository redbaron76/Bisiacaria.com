
// PROFILO UTENTE

UserProfileController = LoggedController.extend({
	user: function() {
		return Users.findOne({ 'username': this.params.username });
	},
	subscriptions: function() {
		Bisia.log('UserProfileController', 'subscriptions');
		this.pageLoading = Meteor.subscribe('userProfile', this.params.username);
	},
	data: function() {
		return {
			user: this.user(),
			pageReady: this.pageLoading.ready
		}
	}
});

// IMPOSTAZIONI UTENTE

UserSettingsController = LoggedController.extend({
	subscriptions: function() {
		Bisia.log('UserSettingsController', 'subscriptions');
		this.pageLoading = Meteor.subscribe('userSettings');
	},
	data: function() {
		return {
			pageReady: this.pageLoading.ready
		}
	}
});