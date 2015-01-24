Template.navbar1.events({
	'click #logout': function(e) {
		var logout = {
			'userId': Meteor.userId(),
			'service': Meteor.user().profile.loggedWith
		};
		Meteor.call('logoutUser', logout, function(error, result) {
			if (result)	{
				Meteor.logout(function() {
					Router.go('homePage');
				});
			}
		});
	}
});