
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
		Bisia.Ui.pageReady = Meteor.subscribe(this.subsTo, this.findQuery(), this.findOptions(), this.getAuthor(), function() {
			Bisia.Ui.hideElement('.list', 'bottom-show');
		});
	},
	nextPath: function() {
		var template = this.viewTemplate;
		return Router.routes[template].path({ 'pageLimit': this.pageLimit() + this.increment });
	},
	items: function() {
		var messages = Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions()).fetch();
		var distinctMessages = _.uniq(messages, false, function(doc) {
			return doc.chatId;
		});
		// Bisia.log(_.pluck(distinctMessages, 'chatId'));
		return distinctMessages;
	},
	data: function() {
		var hasMore = this.items().length === this.pageLimit();
		return {
			authorId: this.getAuthor(),
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			pageReady: Bisia.Ui.getPageReady(),
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
	findQuery: function() {
		return { 'targetId': Meteor.userId(), 'isDelete': { '$nin': [Meteor.userId()] } }
	},
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
	]
});

// MESSAGES SENT

SentMessagesController = MessageController.extend({
	collection: 'messages',
	subsTo: 'messagesList',
	findQuery: function() {
		return this.userQuery();
	},
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
	]
});

// MESSAGE READ

ChatController = PaginatorBaseController.extend({
	increment: 8,
	toplink: [
		{
			path: 'getMessages',
			label: 'Messaggi ricevuti'
		}
	],
	onAfterAction: function() {
		// Reset notification for messages
		Bisia.Notification.resetNotify('message');
		// set message as isRead = true
		Meteor.call('messageOpen', this.params.chatId);
		// enable go bottom on single item after page ready
		if (Bisia.Ui.getPageReady()) {
			Bisia.Message.openChatPage();
		}
	},
	findQuery: function() {
		return { 'chatId': this.params.chatId, 'isDelete': { '$nin': [Meteor.userId()] } };
	},
	subscriptions: function() {
		Bisia.Ui.pageReady = Meteor.subscribe('messageAuthor', this.findQuery(), this.findOptions(), this.pageLimit());
	},
	items: function() {
		return Messages.find(this.findQuery(), this.findOptions()).fetch().reverse();
	},
	nextPath: function() {
		return Router.routes.readMessage.path({ 'chatId': this.params.chatId, 'pageLimit': this.pageLimit() + this.increment });
	},
	data: function() {
		var hasMore = this.items().length === this.pageLimit();
		return {
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			pageReady: Bisia.Ui.getPageReady(),
			topLink: this.toplink ? this.toplink : false
		}
	}
});