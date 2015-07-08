Template.navbarTop.events({
	'click .toggle-menu': function(e, t) {
		// e.preventDefault();
		Bisia.Ui.waitStart(e)
				.toggleSidebar('sidebar-open-left')
				.waitStop();
	},
	'click .toggle-users': function(e, t) {
		// e.preventDefault();
		Bisia.Ui.waitStart(e)
				.toggleSidebar('sidebar-open-right')
				.waitStop();
	}
});

Template.counterNotification.helpers({
	totNotifications: function() {
		var total = Bisia.Notification.total.get();
		if (total > 0)
			Bisia.Audio.playNoty();
		return {
			total: total,
			class: (total > 0) ? 'appear' : null
		};
	}
});