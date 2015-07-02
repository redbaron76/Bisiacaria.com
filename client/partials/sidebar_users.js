Template.sidebarUsers.onCreated(function() {

	// Initialization
	var instance = this;

	// Init reactive vars
	instance.ready = new ReactiveVar(false);

	// Autorun when reactive var changes
	instance.autorun(function() {;
		// Subscribe to publication
		var subscription = Meteor.subscribe('onlineUsers', Bisia.User.getUserPosition());
		// trigger reactivity
		if (subscription.ready() && Bisia.Session.connStatus.get()) {
			instance.ready.set(true);
		} else {
			instance.ready.set(false);
		}
	});

	// The cursor
	instance.onlineUsers = function() {
		if (Bisia.User.isLogged) {
			// Get array of people to hide/block
			var toBlock = Bisia.User.getBlockIds(Meteor.userId());
			// Build query to get all users online
			var query = { 'profile.online': true };
			// Exclude people to hide if any
			if ( ! _.isEmpty(toBlock)) {
				query = _.extend(query, {
					'_id': { '$nin': toBlock }
				});
			}

			return Users.find(query, {
					'fields': {
						'username': true,
						'profile': true
					},
					'sort': { 'profile.loginSince': -1 }
				}
			);
		}
		return;
	};

});

Template.sidebarUsers.helpers({
	onlineUsers: function() {
		return Template.instance().onlineUsers();
	},
	usersReady: function() {
		return Template.instance().ready.get();
	}
});

Template.sidebarUsers.events({
	'keyup #filter-nickname': function(e, t) {
		var text = $(e.target).val().toLowerCase();
		$('#usersList > li').each(function() {
			var $this = $(this);
			var username = $this.data('username');
			(username.indexOf(text) == 0) ? $this.show() : $this.hide();
		});
	}
});

Template.onlineUser.onRendered(function() {
	var user = this.data;
	if (user._id != Meteor.userId() && Bisia.Session.connStatus.get()) {
		var youFollow = Meteor.user()['following'];
		var bubbled = AlertFollowing.findOne({targetId: user._id, seen: true});
		var message = 'in questo momento è online!';
		if (_.contains(youFollow, user._id) && !bubbled) {
			Bisia.Ui.runAfter(function() {
				Bisia.Ui.setReactive('bubble', {
					template: 'voteBubble',
					user: user,
					message: message
				});
				Bisia.Audio.playPresent();
				AlertFollowing.insert({targetId: user._id, seen: true});
			}, function() {
				Bisia.Ui.unsetReactive('bubble');
			}, 5);
		}
	}
});

Template.onlineUser.onDestroyed(function() {
	var user = this.data;
	// AlertFollowing.remove({targetId: user._id});
});

Template.onlineUser.events({
	'click .write-message': function(e, t) {
		e.preventDefault();
		var userObj = Bisia.Message.getMessageObject(this, 'messagePopup');
		Bisia.Ui.setReactive('popup', userObj);
	},
	'click [data-action=open]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.swipeUserListItem(e, 'li', 'tools-open');
	},
	'click .send-vote': function(e, t) {
		e.preventDefault();

		var voteObj = {	targetId: t.data._id };
		var gender = t.data.profile.gender;

		Meteor.call('voteUser', voteObj, gender, function(error, result) {
			Bisia.Ui.runAfter(function() {
				Bisia.Ui.setReactive('bubble', {
					template: 'voteBubble',
					user: t.data,
					message: error ? error : result
				});
			}, function() {
				Bisia.Ui.unsetReactive('bubble');
			}, 3);
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