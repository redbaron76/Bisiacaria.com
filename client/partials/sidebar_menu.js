Template.sidebarMenu.events({
	'click #logout': function(e, t) {
		e.preventDefault();
		var logout = {
			'userId': Meteor.userId(),
			'service': Meteor.user().profile.loggedWith
		};
		// Bisia.log('beforeCall');
		Meteor.call('logoutUser', logout, function(error, result) {
			if (result)	{
				Meteor.logout(function() {
					Bisia.Ui.toggleSidebar();
					Router.go('homePage');
				});
			}
		});
	}
});