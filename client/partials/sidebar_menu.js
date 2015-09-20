Template.sidebarMenu.onCreated(function() {
	var instance = this;
	// instance.items = Meteor.settings.public.menu;
	instance.items = Bisia.Menu.structure;
});

Template.sidebarMenu.helpers({
	menuItems: function() {
		var items = Template.instance().items;
		var menuItems = [];
		var counters = Bisia.Notification.compute();
		_.each(items, function(obj, index) {
			var countObj = _.find(counters, function(value) {
				return  value.key == obj.key;
			});
			obj.counter = (countObj.counter > 0) ? countObj.counter : null;
			obj.newCount = (countObj.newCount > 0) ? countObj.newCount : null;
			obj.text = (obj.newCount > 0 && obj['newLabel']) ? obj['newLabel'] : obj['label'];
			obj.hlClass = obj.newCount > 0 ? 'highlight' : '';
			menuItems.push(obj);
		});
		return menuItems;
	},
	totNotifies: function() {
		return Counts.get('totNotifies');
	},
	mobileDevice: function() {
		return ( Meteor.Device.isTablet() || Meteor.Device.isPhone() ) ? true : false;
	}
});

Template.sidebarMenu.events({
	'click [data-action=open]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.swipeUserListItem(e, '.profile-intro', 'links-open');
	},
	'click #new-post': function(e, t) {
		e.preventDefault();
		var tabObj = Bisia.Ui.getTabObject({
			userId: this._id,
			followers: this.followers || [],
			categories: this.profile.categories || []
		}, 'newPostTab');
		Bisia.Ui.setReactive('tab', tabObj);
		Bisia.Ui.toggleModal(e, 'newPostEventModal', Meteor.user());
	},
	'click #new-position': function(e, t) {
		e.preventDefault();
		Bisia.Map.triggerMapCreation('map-wrapper', true, null, true);
	},
	'click #logout': function(e, t) {
		e.preventDefault();
		var logout = {
			'userId': Meteor.userId(),
			'service': Meteor.user().profile.loggedWith
		};
		// Meteor.logoutOtherClients(function() {
			Meteor.call('logoutUser', logout, function(error, result) {
				if (result)	{
					Meteor.logout(function() {
						Bisia.User.alreadyInit = false;
						Bisia.Ui.toggleSidebar();
						Router.go('loginUser');
					});
				}
			});
		// });
	},
	'click .reset-note': function(e, t) {
		Bisia.Notification.resetNotify('note');
	},
	'click #open-bisiapass': function(e, t) {
		e.preventDefault();
		Bisia.Ui.setReactive('info', {
			template: 'bisiaPassQRCode'
		});
	},
});

Template.menuItem.helpers({
	spacer: function() {
		if (this.spacer)
			return 'spacer';
	}
});

Template.menuItem.events({
	'click a': function(e, t) {
		Bisia.Notification.resetNotify(t.data.key);
	}
});

Template.sidebarMenu.events({
	'click [data-action=around-you]': function(e, t) {
		e.preventDefault();
		var actualPosition = Bisia.User.getUserPosition();
		if (actualPosition) {
			Bisia.Map.triggerMapCreation('map-wrapper', false, actualPosition, false, true);
		} else {
			var message = "Per vedere gli utenti geotaggati o chi si trova nei tuoi dintorni, devi prima registrare la tua posizione creando un Blog o impostando un GeoTag.";
			return Bisia.Ui.submitError(message, 'Azione richiesta!');
		}
	},
	'click [data-unlight]': function(e, t) {
		var $target = $(e.currentTarget);
		var suffix = $target.data('unlight');
		$target.find('.fa-' + suffix).removeClass('highlight');
	}
});