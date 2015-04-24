
// PROFILO UTENTE

UserProfileController = LoggedController.extend({
	user: function() {
		return Users.findOne({ 'username': this.params.username });
	},
	subscriptions: function() {
		if (Meteor.userId()) {
			return Meteor.subscribe('userProfile', this.params.username);
		}
	},
	data: function() {
		return {
			user: this.user()
		}
	}
});

// IMPOSTAZIONI UTENTE

UserSettingsController = LoggedController.extend({
	subscriptions: function() {
		if (Meteor.userId()) {
			return Meteor.subscribe('userSettings');
		}
	}
});

// PROFILO UTENTE

SinglePostController = LoggedController.extend({
	post: function() {
		return Posts.findOne({ '_id': this.params._id });
	},
	friends: function() {
		return Friends.find({ 'targetId': Meteor.userId() });
	},
	subscriptions: function() {
		if (Meteor.userId()) {
			return [
				Meteor.subscribe('singlePost', this.params._id),
				Meteor.subscribe('myFriends')
			];
		}
	},
	data: function() {
		return {
			post: this.post(),
			friends: this.friends()
		}
	}
});

// EVENTI DELLA SETTIMANA

eventListController = LoggedController.extend({
	pageSorting: function() {
		return { 'dateTimeEvent': 1, '_id': -1 };
	},
	findOptions: function() {
		return { 'sort': this.pageSorting() };
	},
	findQuery: function() {
		var limitWeek = Bisia.Time.msWeek;
		return { 'dateTimeEvent': { '$gte': Bisia.Time.todayStart(), '$lte': Bisia.Time.timeFuture(limitWeek) } };
	},
	subscriptions: function() {
		if (Meteor.userId()) {
			return Meteor.subscribe('nextWeekEvents', this.findOptions());
		}
	},
	data: function() {
		return Events.find(this.findQuery(), this.findOptions());
	}
});