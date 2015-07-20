
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
	hasMoreLinks: function() {
		if (this.itemsCount === this.pageLimit()) {
			return true;
		}
		return false;
	},
	getAuthor: function() {
		return this.authorId ? this.authorId : 'userId';
	},
	getUsername: function() {
		return this.params.username || null;
	},
	nextPath: function() {
		var routeName = Router.current().route.getName();
		return Router.routes[routeName].path({ 'pageLimit': this.pageLimit() + this.increment });
	},
	pageIsReady: function() {
		return (this.pageReady) ? this.pageReady.ready() : false;
	}
});

// PAGINATOR LISTS

PaginatorController = PaginatorBaseController.extend({
	onAfterAction: function() {
		// triggers the notification reset
		/*if(this.viewAction) {
			Bisia.Notification.resetNotify(this.viewAction);
		}*/
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.findQuery(), this.findOptions(), this.getAuthor(), function() {
				Bisia.Ui.hideElement('#helpbars', 'bottom-show');
			});
		}
	},
	items: function() {
		if (this.pageIsReady()) {
			var items = Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
			this.itemsBackup = items;
			this.itemsCount = items.count();
			return items;
		} else {
			return this.itemsBackup;
		}
	},
	data: function() {
		var parent = this;
		var hasMore = this.hasMoreLinks();
		return {
			authorId: this.getAuthor(),
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			pageReady: this.pageIsReady(),
			viewTemplate: this.viewTemplate,
			topLink: this.toplink ? this.toplink : false,
			searchUsers: this.searchUsers ? true : false,
			title: function() {
				if (parent.getUsername() && parent.title.indexOf(':username') > -1) {
					return parent.title.replace(':username', parent.getUsername())
				} else {
					return parent.title;
				}
			},
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
		return { 'targetId': Meteor.userId(), 'action': this.viewAction, 'isBroadcasted': true };
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

// USER KNOW

UsernameKnowController = PaginatorController.extend({
	collection: 'friends',
	subsTo: 'userFriendsList',
	title: ':username conosce...',
	viewTemplate: 'yourFriendUser',
	authorId: 'targetId',
	nextPath: function() {
		var routeName = Router.current().route.getName();
		return Router.routes[routeName].path({ 'username': this.params.username, '_id': this.params._id, 'pageLimit': this.pageLimit() + this.increment });
	},
	findQuery: function() {
		return { 'userId': this.params._id };
	}
});

// KNOW USER

KnowUsernameController = PaginatorController.extend({
	collection: 'friends',
	subsTo: 'userFriendsList',
	title: 'Conoscono :username...',
	viewTemplate: 'yourFriendUser',
	authorId: 'userId',
	nextPath: function() {
		var routeName = Router.current().route.getName();
		return Router.routes[routeName].path({ 'username': this.params.username, '_id': this.params._id, 'pageLimit': this.pageLimit() + this.increment });
	},
	/*items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},*/
	findQuery: function() {
		return { 'targetId': this.params._id };
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
		return { 'targetId': Meteor.userId(), 'action': this.viewAction };
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

// NEWS FROM FRIENDS

NewsController = PaginatorController.extend({
	viewAction: 'news',
	collection: 'posts',
	subsTo: 'friendPosts',
	title: 'Ultime novità',
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, {}, this.findOptions(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		}
	},
	findQuery: function() {
		if (!!Meteor.userId()) {
			var user = Users.findOne({ '_id': Meteor.userId() }, { fields: { following: 1 } });
			var following = user.following || [];
			return {
				'dateTimePost': {
					'$lt': Bisia.Time.now()
				},
				'authorId': {
					'$in': following
				}
			};
		}
	},
});

// BIRTHDAYS TODAY

BirthdayController = PaginatorController.extend({
	collection: 'users',
	subsTo: 'users',
	title: 'Compleanni di oggi',
	viewTemplate: 'birthdayToday',
	pageSorting: function() {
		return { 'profile.birthday': -1, '_id': -1 };
	},
	findQuery: function() {
		return { 'profile.birthday': Bisia.Time.getTodayBirthday() };
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.findOptions(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		}
	}
});

// LAST SIGNUP

LastSignupController = PaginatorController.extend({
	collection: 'users',
	subsTo: 'users',
	title: 'Ultimi iscritti',
	viewTemplate: 'lastSignupList',
	findQuery: function() {
		return { 'emails': { $elemMatch: { 'verified': true } } };
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.findOptions(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		}
	}
});

// SERCH USERS

SearchUsersController = PaginatorController.extend({
	collection: 'users',
	subsTo: 'searchUsers',
	title: 'Cerca utenti',
	viewTemplate: 'lastSignupList',
	searchObject: {},
	searchUsers: true,
	getSearchObject: function() {
		var searchObject = this.state.get('searchObject');
		if (searchObject)
			return Bisia.User.formatSearchUsers(searchObject);
		return searchObject;
	},
	pageSorting: function() {
		return { 'profile.birthdate': -1, '_id': -1 };
	},
	findQuery: function() {
		return this.getSearchObject();
	},
	subscriptions: function() {
		if (!!Meteor.userId() && this.getSearchObject()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.getSearchObject(), this.findOptions(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		} else {
			this.pageReady.ready = function() {
				return true;
			}
		}
	}
});