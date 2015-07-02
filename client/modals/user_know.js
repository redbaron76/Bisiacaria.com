Template.userKnowModal.onCreated(function() {
	// Initialization
	var instance = this;

	Bisia.Paginator.init(instance, {
		subsTo: 'userFriendsList',
		collection: 'friends',
		query: {
			'userId': '_id'
		}
	});

});

Template.userKnowModal.helpers({
	friendUsers: function() {
		return Template.instance().getData();
	},
	hasMoreData: function() {
		return Template.instance().hasMoreData.get();
	},
	pageReady: function() {
		return Template.instance().ready.get();
	}
});

Template.userKnowModal.events({
	'click .username': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Paginator.triggerBottom(e);
	}
});





Template.knowUserModal.onCreated(function() {
	// Initialization
	var instance = this;

	Bisia.Paginator.init(instance, {
		subsTo: 'userFriendsList',
		collection: 'friends',
		query: {
			'targetId': '_id'
		}
	});
});

Template.knowUserModal.helpers({
	friendUsers: function() {
		return Template.instance().getData();
	},
	hasMoreData: function() {
		return Template.instance().hasMoreData.get();
	},
	pageReady: function() {
		return Template.instance().ready.get();
	}
});

Template.knowUserModal.events({
	'click .username': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Paginator.triggerBottom(e);
	}
});