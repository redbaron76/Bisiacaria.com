
// HOMEPAGE

HomePageController = LoggedController.extend({
	subscriptions: function() {
		if (!!Meteor.userId()) {
			var sub = Meteor.subscribe('homepage');
			// Check if it's not offline
			if ( ! Bisia.Session.connStatus.get()) {
				sub.ready = function() {
					return false;
				}
			}
			return sub;
		}
	},
	data: function() {
		return Homepage.find({}, { sort: { createdAt: -1 }, limit: 1 }).fetch()[0];
	},
	onAfterAction: function() {
		Bisia.User.autopublishHomepage();
	}
});

// PROFILO UTENTE

UserProfileController = LoggedController.extend({
	user: function() {
		var user = Users.findOne({ 'username': { '$regex': this.params.username, '$options': 'i' }});
		if(user) {
			this.nickname = user.username;
			return user;
		}
	},
	subscriptions: function() {
		if (!!Meteor.userId() && this.params.username) {
			return Meteor.subscribe('userProfile', this.params.username);
		}
	},
	data: function() {
		return {
			nickname: this.nickname,
			user: this.user()
		}
	}
});

// IMPOSTAZIONI UTENTE

UserSettingsController = LoggedController.extend({
	subscriptions: function() {
		if (!!Meteor.userId()) {
			return Meteor.subscribe('userSettings');
		}
	}
});

// PROFILO UTENTE

SinglePostController = LoggedController.extend({
	post: function() {
		return Posts.findOne({ '_id': this.params._id });
	},
	followers: function() {
		return Friends.find({ 'targetId': Meteor.userId() });
	},
	subscriptions: function() {
		if (!!Meteor.userId() && this.params._id) {
			return [
				Meteor.subscribe('singlePost', this.params._id),
				Meteor.subscribe('myFriends')
			];
		}
	},
	data: function() {
		return {
			post: this.post(),
			followers: this.followers()
		}
	}
});

// PROFILO EVENTO

SingleEventController = LoggedController.extend({
	event: function() {
		return Events.findOne({ '_id': this.params._id });
	},
	subscriptions: function() {
		if (!!Meteor.userId() && this.params._id) {
			return Meteor.subscribe('singleEvent', this.params._id);
		}
	},
	data: function() {
		return {
			event: this.event()
		}
	}
});

// EVENTI DELLA SETTIMANA

eventListController = LoggedController.extend({
	pageSorting: function() {
		return { 'dateTimeEvent': 1, 'createdAt': 1, '_id': -1 };
	},
	findOptions: function() {
		return { 'sort': this.pageSorting() };
	},
	findQuery: function() {
		var limitWeek = Bisia.Time.msWeek;
		return { 'dateTimeEvent': { '$gte': Bisia.Time.todayStart(), '$lte': Bisia.Time.timeFuture(limitWeek) } };
	},
	getEventDates: function() {
		var dates = {};
		var cursor = Events.find(this.findQuery(), this.findOptions());
		cursor.forEach(function(event) {
			var d = moment(event.dateTimeEvent).format('YYYYMMDD');
			event['date'] = d;
			if ( ! _.has(dates, d)) {
				dates[d] = [event];
			} else {
				dates[d].push(event);
			}
		});
		return dates;
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			return Meteor.subscribe('nextWeekEvents', this.findOptions());
		}
	},
	data: function() {
		return this.getEventDates();
	}
});