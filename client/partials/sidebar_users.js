Template.sidebarUsers.created = function() {

	// Initialization
	var instance = this;

	// Init reactive vars
	instance.ready = new ReactiveVar(false);

	// Autorun when reactive var changes
	instance.autorun(function() {

		// Subscribe to publication
		var subscription = Meteor.subscribe('onlineUsers');

		if (subscription.ready()) {
			instance.ready.set(true);
		} else {
			instance.ready.set(false);
		}

	});

	// The cursor
	instance.onlineUsers = function() {
		return Users.find(
			{ 'profile.online': true },
			{
				fields: { 'username': 1, 'profile': 1 },
				sort: { 'profile.loginSince': -1 }
			}
		);
	};

};

Template.sidebarUsers.helpers({
	onlineUsers: function() {
		return Template.instance().onlineUsers();
	},
	usersReady: function() {
		return Template.instance().ready.get();
	}
});

Template.onlineUser.events({
	'click .write-message': function(e, t) {
		e.preventDefault();
		Bisia.Message.setTarget(this);
	},
	'click [data-action=open]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.swipeUserListItem(e);
	},
	'click .send-vote': function(e, t) {
		e.preventDefault();
		Meteor.call('voteUser', {
			targetId: t.data._id
		});
	}
});

Template.onlineUser.helpers({
	setOpenClose: function() {
		if (this._id && this._id !== Meteor.userId()) {
			return "open";
		} else {
			return "close";
		}
	}
});