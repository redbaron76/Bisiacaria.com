/*Template.navbarTop.onCreated(function() {
	var instance = this;
	instance.autorun(function() {
		instance.totNotifications = Counts.get('totNotifications');
		instance.totOnlineUsers = Counts.get('totOnline');
		console.log('autorun', instance.totNotifications, instance.totOnlineUsers);
	});
});*/

Template.navbarTop.events({
	'click h1': function(e, t) {
		Bisia.Ui.goTop(e, '.content');
	},
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

/*Template.counterNotification.helpers({
	totNotifications: function() {
		var total = parseInt(Bisia.Notification.total.get());
		if (total > 0) {
			Bisia.Audio.playNoty();
			return {
				total: total,
				class: (total > 0) ? 'appear' : null
			};
		}
		return null;
	}
});*/