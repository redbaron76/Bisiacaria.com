
// MESSAGES CONTROLLER

MessageController = PaginatorBaseController.extend({
	onAfterAction: function() {
		// triggers the notification reset
		/*if(this.viewAction) {
			Bisia.Notification.resetNotify(this.viewAction);
		}*/
	},
	findQuery: function() {
		return { 'isDelete': { '$nin': [Meteor.userId()] } }
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.findQuery(), this.findOptions(), this.getAuthor(), function() {
				Bisia.Ui.hideElement('#helpbars', 'bottom-show');
			});
		}
	},
	nextPath: function() {
		var routeName = Router.current().route.getName();
		return Router.routes[routeName].path({ 'pageLimit': this.pageLimit() + this.increment });
	},
	items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},
	data: function() {
		var hasMore = this.items().length === this.pageLimit();
		return {
			authorId: this.getAuthor(),
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			pageReady: this.pageReady.ready(),
			viewTemplate: this.viewTemplate,
			topLink: this.toplink ? this.toplink : false,
			title: this.title,
		}
	}
});

// MESSAGES RECEIVED

GetMessagesController = MessageController.extend({
	viewAction: 'message',
	collection: 'chats',
	subsTo: 'messagesList',
	pageLimit: function() {
		return 250;
	},
	findQuery: function() {
		var me = Meteor.userId();
		return {
			'ownerIds': {
				'$in': [me]
			},
			'isDelete': {
				'$nin': [me]
			}
		};
	},
	title: 'Messaggi privati',
	viewTemplate: 'messagesFrom',
	selected: 'getMessages'
});

// CHAT ROOM CONTROLLER

ChatController = PaginatorBaseController.extend({
	increment: 10,
	toplink: [
		{
			path: 'getMessages',
			label: 'Torna ai messaggi'
		}
	],
	onAfterAction: function() {
		// enable go bottom on single item after page ready
		if (this.pageReady.ready()) {
			Bisia.Message.openChatPage();
		}
	},
	findQuery: function() {
		return { 'chatId': this.params.chatId, 'isDelete': { '$nin': [Meteor.userId()] } };
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe('messageAuthor', this.findQuery(), this.findOptions());
		}
	},
	items: function() {
		return Messages.find(this.findQuery(), this.findOptions()).fetch().reverse();
	},
	nextPath: function() {
		return Router.routes.readMessage.path({ 'chatId': this.params.chatId, 'username': this.params.username, 'pageLimit': this.pageLimit() + this.increment });
	},
	data: function() {
		var hasMore = this.items().length === this.pageLimit();
		return {
			items: this.items(),
			chatId: this.params.chatId,
			title: 'Chat con ' + this.params.username,
			nextPath: hasMore ? this.nextPath() : null,
			pageReady: this.pageReady.ready(),
			topLink: this.toplink ? this.toplink : false
		}
	}
});