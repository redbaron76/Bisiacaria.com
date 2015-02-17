Template.sidebarMenu.created = function() {
	var instance = this;
	instance.items = [
		{
			key: 'message',
			icon: 'fa-envelope',
			label: 'Messaggi privati',
			path: 'getMessages',
			nClass: 'new'
		},
		{
			key: 'visit',
			icon: 'fa-star',
			label: 'Ultime visite ricevute',
			path: 'visitsList',
			nClass: 'new'
		},
		{
			key: 'friend',
			icon: 'fa-child',
			label: 'Dicono di conoscerti',
			path: 'friendsList',
			nClass: 'new'
		},
		{
			key: 'youknow',
			icon: 'fa-user',
			label: 'Chi dici di conoscere',
			path: 'youKnowList',
			nClass: 'new'
		},
		{
			key: 'vote',
			icon: 'fa-thumbs-up',
			label: 'Voti ricevuti',
			path: 'votesList',
			nClass: 'new'
		}
	];
};

Template.sidebarMenu.helpers({
	menuItems: function() {
		var counters = Bisia.Notification.compute();
		var items = Template.instance().items;
		var menuItems = [];
		_.each(items, function(obj) {
			var countObj = _.find(counters, function(value) {
				return  value.key == obj.key;
			});
			obj.counter = (countObj.counter > 0) ? countObj.counter : null;
			obj.newCount = (countObj.newCount > 0) ? countObj.newCount : null;
			menuItems.push(obj);
		});
		return menuItems;
	},
});

Template.sidebarMenu.events({
	'click #logout': function(e, t) {
		e.preventDefault();
		var logout = {
			'userId': Meteor.userId(),
			'service': Meteor.user().profile.loggedWith
		};
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