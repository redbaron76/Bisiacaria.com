Template.sidebarMenu.created = function() {
	var instance = this;
	// instance.items = Meteor.settings.public.menu;
	instance.items = Bisia.Menu.structure;
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

Template.menuItem.helpers({
	spacer: function() {
		if (this.spacer)
			return 'spacer';
	}
});