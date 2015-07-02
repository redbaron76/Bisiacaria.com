Template.navbarTop.events({
	'click .toggle-menu': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-left');
	},
	'click .toggle-users': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-right');
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