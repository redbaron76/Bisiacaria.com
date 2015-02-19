
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
		return {};
	},
	findOptions: function() {
		return { 'sort': this.pageSorting(), 'limit': this.pageLimit() };
	},
	getAuthor: function() {
		return this.authorId ? this.authorId : 'userId';
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
		Bisia.log('subscriptions', 'PaginatorController');
		this.pageSub = Meteor.subscribe(this.subsTo, this.findQuery(), this.findOptions(), this.getAuthor(), function() {
			Bisia.Ui.hideElement('.list', 'bottom-show');
		});
	},
	items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
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
			pageReady: this.pageSub.ready,
			viewTemplate: this.viewTemplate,
			topLink: this.toplink ? this.toplink : false,
			title: this.title,
		}
	}
});

// MESSAGES RECEIVED

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

// MESSAGES SENT

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
	title: 'Chi conosci?',
	viewTemplate: 'yourFriendUser',
	target: 'targetId'
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

// MESSAGE READ

ViewMessageController = PaginatorBaseController.extend({
	title: 'Messaggio',
	collection: 'messages',
	pageSorting: function() {
		return { 'createdAt': 1 };
	},
	findQuery: function() {
		return { '$or': [{ '_id': this.params.chatId }, { 'chatId': this.params.chatId }] };
	},
	subscriptions: function() {
		this.pageSub = Meteor.subscribe('messageAuthor', this.findQuery(), this.findOptions(), function() {
			// Bisia.Ui.hideElement('.list', 'bottom-show');
		});
	},
	items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},
	nextPath: function() {
		return Router.routes.visitsList.path({ 'chatId': this.params.chatId, 'pageLimit': this.pageLimit() + this.increment });
	}
});