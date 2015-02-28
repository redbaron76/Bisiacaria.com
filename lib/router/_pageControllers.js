
// PROFILO UTENTE

UserProfileController = LoggedController.extend({
	user: function() {
		return Users.findOne({ 'username': this.params.username });
	},
	subscriptions: function() {
		Bisia.Ui.pageReady = Meteor.subscribe('userProfile', this.params.username);
	},
	data: function() {
		return {
			user: this.user(),
			pageReady: Bisia.Ui.getPageReady()
		}
	}
});

// IMPOSTAZIONI UTENTE

UserSettingsController = LoggedController.extend({
	subscriptions: function() {
		Bisia.Ui.pageReady = Meteor.subscribe('userSettings');
	},
	data: function() {
		return {
			pageReady: Bisia.Ui.getPageReady()
		}
	}
});