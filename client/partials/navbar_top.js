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
		var counters = [/*'newMessages', */'newVisits', 'newFriends', 'newVotes'];
		var c = 0;
		_.each(counters, function(el, index) {
			c += Counts.get(el);
		});
		return c;
	}
});