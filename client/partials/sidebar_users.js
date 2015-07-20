Template.sidebarUsers.onCreated(function() {

	// Initialization
	var instance = this;

	instance.countUsers = 0;
	instance.totalUsers = 0;
	instance.onlineFriends = [];
	instance.checkFriends = new ReactiveVar(false);

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

		if (instance.checkFriends.get() && instance.onlineFriends.length > 0) {
			var newerUser = instance.onlineFriends.reverse()[0];
			var totFriends = instance.onlineFriends.length;
			var msg;

			switch(totFriends) {
				case 1:
					msg = "in questo momento è online!";
					break;
				case 2:
					msg = "ed <strong>un'altra persona</strong> sono online!";
					break;
				default:
					msg = "ed <strong>altre " + totFriends - 1 + " persone</strong> sono online!";
			}

			Bisia.Ui.runAfter(function() {
				Bisia.Ui.setReactive('bubble', {
					template: 'voteBubble',
					user: newerUser,
					message: msg
				});
				Bisia.Audio.playPresent();
			}, function() {
				Bisia.Ui.unsetReactive('bubble');
				instance.checkFriends.set(false);
			}, 5);
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

			var users = Users.find(query, {
					'fields': {
						'username': true,
						'profile': true
					},
					'sort': { 'profile.loginSince': -1 }
				}
			);
			instance.totalUsers = users.count();
			return users;
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
	// get user list instance
	var userList = this.parentTemplate();
	var yourFriends = Meteor.user()['following'];
	var alreadyAlerted = AlertFollowing.findOne({userId: user._id});
	// not me
	if (user._id != Meteor.userId() && Bisia.Session.connStatus.get() && ! alreadyAlerted) {
		// if the user is someone thai I follow and not already in onlineFriends
		if (_.contains(yourFriends, user._id) && ! _.contains(userList.onlineFriends, user)) {
			// add user to array
			userList.onlineFriends.push(user);
			AlertFollowing.insert({userId: user._id});
		}
	}
	// increment counter
	userList.countUsers ++;
	// if last element
	if(userList.countUsers == userList.totalUsers) {
		if (userList.onlineFriends.length > 0) {
			// check flag
			userList.checkFriends.set(true);
		}
	}
});

Template.onlineUser.onDestroyed(function() {
	var user = this.data;
	var userList = this.parentTemplate();
	AlertFollowing.remove({userId: user._id});
	userList.onlineFriends = _.reject(userList.onlineFriends, function(el) {
		return el._id === user._id;
	});
	userList.countUsers --;
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
		// e.preventDefault();
		Bisia.Ui.waitStart(e);

		var voteObj = {	targetId: t.data._id };
		var gender = t.data.profile.gender;

		Meteor.call('voteUser', voteObj, gender, function(error, result) {
			Bisia.Ui.waitStop().runAfter(function() {
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