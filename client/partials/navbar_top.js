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

Template.navbarTop.helpers({
	totNotifications: function() {
		var count = Bisia.Notification.countTotal();
		if (count > 0) {
			// Bisia.Audio.playNoty();
			return count;
		}
	}
});