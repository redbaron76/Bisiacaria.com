
// PAGINATOR BASE

PaginatorBaseController = LoggedController.extend({
	increment: 20,
	isFirstPage: function() {
		return this.pageLimit() === this.increment;
	},
	pageLimit: function() {
		return parseInt(this.params.pageLimit) || this.increment;
	},
	pageSorting: function() {
		return { 'createdAt': -1, '_id': -1 };
	},
	findQuery: function() {
		return { 'targetId': Meteor.userId() };
	},
	userQuery: function() {
		return { 'userId': Meteor.userId() };
	},
	findOptions: function() {
		return { 'sort': this.pageSorting(), 'limit': this.pageLimit() };
	},
	getAuthor: function() {
		return this.authorId ? this.authorId : 'userId';
	},
	nextPath: function() {
		var routeName = Router.current().route.getName();
		return Router.routes[routeName].path({ 'pageLimit': this.pageLimit() + this.increment });
	}
});

// PAGINATOR LISTS

PaginatorController = PaginatorBaseController.extend({
	onAfterAction: function() {
		// triggers the notification reset
		if(this.viewAction) {
			Bisia.Notification.resetNotify(this.viewAction);
		}
	},
	subscriptions: function() {
		if (Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, {}, this.findOptions(), this.getAuthor(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		}
	},
	items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},
	data: function() {
		var hasMore = this.items().count() === this.pageLimit();

		return {
			authorId: this.getAuthor(),
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			// pageReady: Bisia.Ui.getPageReady(),
			pageReady: this.pageReady.ready(),
			viewTemplate: this.viewTemplate,
			topLink: this.toplink ? this.toplink : false,
			title: this.title,
		}
	}
});

// NEWS FROM FRIENDS

NotifyController = PaginatorController.extend({
	viewAction: 'note',
	collection: 'notifications',
	subsTo: 'newsList',
	title: 'Notifiche',
	viewTemplate: 'newsEventList',
	findQuery: function() {
		return { 'action': this.viewAction, 'isBroadcasted': true };
	}
});

// NEWS FROM FRIENDS

NewsController = PaginatorController.extend({
	viewAction: 'news',
	collection: 'notifications',
	subsTo: 'newsList',
	title: 'Ultime novità',
	viewTemplate: 'newsEventList',
	findQuery: function() {
		return { 'action': this.viewAction, 'isBroadcasted': true };
	}
});

// FRIENDS THEY KNOW YOU

FriendsController = PaginatorController.extend({
	viewAction: 'friend',
	collection: 'friends',
	subsTo: 'friendsList',
	title: 'Ti conoscono',
	viewTemplate: 'friendUser'
});

// FRIENDS YOU KNOW

YourFriendsController = PaginatorController.extend({
	collection: 'friends',
	subsTo: 'friendsList',
	title: 'Le tue conoscenze',
	viewTemplate: 'yourFriendUser',
	authorId: 'targetId',
	findQuery: function() {
		return this.userQuery();
	}
});

// VISITS YOU GET

VisitsController = PaginatorController.extend({
	viewAction: 'visit',
	collection: 'notifications',
	subsTo: 'visitsList',
	title: 'Visite ricevute',
	viewTemplate: 'visitUser',
	findQuery: function() {
		return { 'action': this.viewAction };
	}
});

// VOTES YOU COLLECT

VotesController = PaginatorController.extend({
	viewAction: 'vote',
	collection: 'votes',
	subsTo: 'votesList',
	title: 'Voti ricevuti',
	viewTemplate: 'voteUser'
});

// BIRTHDAYS TODAY

BirthdayController = PaginatorController.extend({
	subsTo: 'birthdayList',
	title: 'Compleanni di oggi',
	viewTemplate: 'birthdayToday',
	pageSorting: function() {
		return { 'profile.birthday': -1, '_id': -1 };
	},
	findQuery: function() {
		return { 'profile.birthday': Bisia.Time.getTodayBirthday() };
	},
	subscriptions: function() {
		if (Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.findOptions(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		}
	},
	items: function() {
		return Users.find(this.findQuery(), this.findOptions());
	}
});