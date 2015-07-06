
// MESSAGES CONTROLLER

MessageController = PaginatorBaseController.extend({
	onAfterAction: function() {
		// triggers the notification reset
		if(this.viewAction) {
			Bisia.Notification.resetNotify(this.viewAction);
		}
	},
	findQuery: function() {
		return { 'isDelete': { '$nin': [Meteor.userId()] } }
	},
	subscriptions: function() {
		if (!!Meteor.userId()) {
			this.pageReady = Meteor.subscribe(this.subsTo, this.findQuery(), this.findOptions(), this.getAuthor(), function() {
				Bisia.Ui.hideElement('.list', 'bottom-show');
			});
		}
	},
	nextPath: function() {
		var routeName = Router.current().route.getName();
		return Router.routes[routeName].path({ 'pageLimit': this.pageLimit() + this.increment });
	},
	items: function() {
		var messages = Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions()).fetch();
		var distinctMessages = _.uniq(messages, false, function(doc) {
			return doc.chatId;
		});
		return distinctMessages;
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
	collection: 'messages',
	subsTo: 'messagesList',
	pageLimit: function() {
		return 250;
	},
	findQuery: function() {
		var me = Meteor.userId();
		return {
			'$or': [
				{ 'targetId': me },
				{ 'userId': me }
			],
			'isDelete': {
				'$nin': [me]
			}
		};
	},
	title: 'Messaggi privati',
	viewTemplate: 'messagesFrom',
	selected: 'getMessages'
});

// MESSAGE READ

ChatController = PaginatorBaseController.extend({
	increment: 10,
	toplink: [
		{
			path: 'getMessages',
			label: 'Torna ai messaggi'
		}
	],
	onAfterAction: function() {
		// Reset notification for messages
		Bisia.Notification.resetNotify('message');
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
			this.pageReady = Meteor.subscribe('messageAuthor', this.findQuery(), this.findOptions(), this.pageLimit());
		}
	},
	items: function() {
		var messages = Messages.find(this.findQuery(), this.findOptions()).fetch().reverse();
		if (! this.nickname) {
			this.nickname = Bisia.User.inChatWith(messages[0]);
		}
		return messages;
	},
	nextPath: function() {
		return Router.routes.readMessage.path({ 'chatId': this.params.chatId, 'pageLimit': this.pageLimit() + this.increment });
	},
	data: function() {
		var hasMore = this.items().length === this.pageLimit();
		return {
			items: this.items(),
			chatId: this.params.chatId,
			title: 'Chat con ' + this.nickname.username,
			nextPath: hasMore ? this.nextPath() : null,
			pageReady: this.pageReady.ready(),
			topLink: this.toplink ? this.toplink : false
		}
	}
});