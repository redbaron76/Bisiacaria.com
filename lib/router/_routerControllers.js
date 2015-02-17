// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Ui.resetFormMessages();
		this.next();
	}
});

// Password-protected pages controller
LoggedController = UnloggedController.extend({
	subscriptions: function() {
		if (Meteor.userId()) {
			return Meteor.subscribe('userSettings', Meteor.userId());
		}
	}
});

UserProfileController = LoggedController.extend({
	user: function() {
		return Users.findOne({ 'username': this.params.username });
	},
	subscriptions: function() {
		this.pageLoading = Meteor.subscribe('userProfile', this.params.username);
	},
	data: function() {
		return {
			user: this.user(),
			pageReady: this.pageLoading.ready
		}
	}
});

UserSettingsController = LoggedController.extend({
	user: function() {
		return Users.findOne({'_id': Meteor.userId() });
	},
	subscriptions: function() {
		this.pageLoading = Meteor.subscribe('userSettings', Meteor.userId());
	},
	data: function() {
		return {
			user: this.user(),
			pageReady: this.pageLoading.ready
		}
	}
});

PaginatorController = RouteController.extend({
	increment: 20,
	onAfterAction: function() {
		// triggers the notification
		if(this.viewAction) {
			// Bisia.log('onAfterAction');
			Bisia.Notification.resetNotify(this.viewAction);
		}
	},
	isPaginating: function() {
		return this.pageLimit() !== this.increment;
	},
	pageLimit: function() {
		return parseInt(this.params.pageLimit) || this.increment;
	},
	pageSorting: function() {
		return { 'createdAt': -1, '_id': -1 };
	},
	findQuery: function() {
		return {};
	},
	findOptions: function() {
		return { 'sort': this.pageSorting(), 'limit': this.pageLimit() };
	},
	subscriptions: function() {
		this.state.set('paginating', this.isPaginating());
		this.pageSub = Meteor.subscribe(this.subsTo, this.findQuery(), this.findOptions(), this.getAuthor(), function() {
			Bisia.Ui.hideElement('.list', 'bottom-show');
		});
	},
	items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},
	getAuthor: function() {
		return this.authorId ? this.authorId : 'userId';
	},
	nextPath: function() {
		return Router.routes.visitsList.path({ 'pageLimit': this.pageLimit() + this.increment });
	},
	data: function() {
		var hasMore = this.items().count() === this.pageLimit();
		Bisia.Ui.pageReady = this.pageSub.ready;
		return {
			authorId: this.getAuthor(),
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			pageDisplay: (this.state.get('paginating') || this.pageSub.ready),
			pageReady: this.pageSub.ready,
			viewTemplate: this.viewTemplate,
			topLink: this.toplink ? this.toplink : false,
			title: this.title,
		}
	}
});

GetMessagesController = PaginatorController.extend({
	viewAction: 'message',
	collection: 'messages',
	subsTo: 'messagesList',
	title: 'Messaggi ricevuti',
	viewTemplate: 'messagesFrom',
	selected: 'getMessages',
	prefix: 'da',
	toplink: [
		{
			path: 'getMessages',
			label: 'Messaggi ricevuti'
		},
		{
			path: 'sentMessages',
			label: 'Messaggi inviati'
		}
	],
});

SentMessagesController = PaginatorController.extend({
	collection: 'messages',
	subsTo: 'messagesList',
	title: 'Messaggi inviati',
	viewTemplate: 'messagesFrom',
	authorId: 'targetId',
	selected: 'sentMessages',
	prefix: 'a',
	toplink: [
		{
			path: 'getMessages',
			label: 'Messaggi ricevuti'
		},
		{
			path: 'sentMessages',
			label: 'Messaggi inviati'
		}
	],
});

FriendsController = PaginatorController.extend({
	viewAction: 'friend',
	collection: 'friends',
	subsTo: 'friendsList',
	title: 'Ti conoscono',
	viewTemplate: 'friendUser'
});

YourFriendsController = PaginatorController.extend({
	collection: 'friends',
	subsTo: 'friendsList',
	title: 'Chi conosci?',
	viewTemplate: 'yourFriendUser',
	target: 'targetId'
});

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

VotesController = PaginatorController.extend({
	viewAction: 'vote',
	collection: 'votes',
	subsTo: 'votesList',
	title: 'Voti ricevuti',
	viewTemplate: 'voteUser'
});