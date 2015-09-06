
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
		// var user = Users.findOne({ 'username': this.params.username });
		var user = Users.findOne({ 'username': { '$regex': '^'+this.params.username+'$', '$options': 'i' }});
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
	yourQuery: function() {
		return { 'authorId': Meteor.userId() };
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
	getYourEvents: function() {
		var dates = {};
		var cursor = Events.find(this.yourQuery(), this.findOptions());
		cursor.forEach(function(event) {
			var d = moment(event.dateTimeEvent).format('YYYYMMDD');
			event['date'] = d;
			event['action'] = 'event';
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
		// return this.getEventDates();
		return {
			nextEvents: this.getEventDates(),
			yourEvents: this.getYourEvents()
		};
	}
});

// BIS POKER

BisPokerController = LoggedController.extend({
	onBeforeAction: function() {
		this.preloadImages();
		this.next();
	},
	lastGameStatus: function() {
		var bet = null, handId;
		var winMessage = null;
		var statusPlay = 'apri';
		var statusMessage = 'Punta per giocare';
		var deck = [null, null, null, null, null];
		var firstHand = [null, null, null, null, null];

		var lastStatus = Pokerhands.findOne({
			'playerId': Meteor.userId(),
			'status': 'running'
		}, {
			'sort': { 'createdAt': -1 },
			'limit': 1
		});

		if (lastStatus) {
			switch (lastStatus.status) {
				case 'running':
					deck = lastStatus.playDeck;
					break;
				case 'finish':
					deck = lastStatus.changeDeck;
					break;
				default:
					deck = deck;
			}

			bet = lastStatus.bet;
			handId = lastStatus._id;
			statusMessage = lastStatus.statusMessage;
			winMessage = lastStatus.winMessage;
			statusPlay = lastStatus.statusPlay;
			firstHand = lastStatus.playDeck;
		}

		return {
			bet: bet,
			deck: deck,
			handId: handId,
			winMessage: winMessage,
			statusPlay: statusPlay,
			statusMessage: statusMessage,
			firstHand: firstHand
		};
	},
	preloadImages: function() {
		var parent = this;
		parent.state.set('imagesLoaded', false);
		var image = new Image();
		image.src = 'img/poker/back.jpg';
		for (var i = 0; i <= 53; i++) {
			image = new Image();
			image.src = 'img/poker/'+ i +'.jpg';
			image.onload = function() {
				if (i > 53) {
					parent.state.set('imagesLoaded', true);
				}
			}
		}
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			return Meteor.subscribe('pokerCurrentStatus');
		}
	},
	data: function() {
		return this.lastGameStatus();
	}
});

PokerWinnersController = LoggedController.extend({
	winners: function() {
		return Pokerwinners.find({
			'gameYear': parseInt(moment().format('YYYY'))
		}, {
			'sort': {
				'gameWeek': -1
			}
		});
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			return Meteor.subscribe('pokerLastWinners');
		}
	},
	data: function() {
		return {
			items: this.winners()
		};
	}
});