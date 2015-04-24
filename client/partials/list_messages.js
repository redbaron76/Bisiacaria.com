Template.messagesFrom.helpers({
	messagePath: function() {
		var chatId = (this.chatId) ? this.chatId : this._id;
		var countUnread = Counts.get(chatId);
		return _.extend(this, {
			chatId: chatId,
			countUnread: countUnread
		});
	},
	ada: function() {
		return Bisia.getController('prefix');
	},
	formatChatId: function() {
		var chatId = this.chatId ? this.chatId : this._id;
		return _.extend(this, {chatId: chatId});
	},
	getIcon: function() {
		return this.isRead ? 'fa-folder-open' : 'fa-folder';
	},
	isSent: function() {
		return Bisia.getController('selected') !== 'getMessages';
	},
	setOpenClose: function() {
		if (Bisia.getController('selected') == 'getMessages') {
			if (this._id && this._id !== Meteor.userId()) {
				return "open";
			} else {
				return "close";
			}
		}
	}
});

Template.messagesFrom.events({
	'click [data-action=open]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.swipeUserListItem(e, 'li', 'tools-open');
	},
	'click #delete-message': function(e, t) {
		e.preventDefault();
		Bisia.Ui.confirmDialog('Bisia.Message.deleteMessage', e, this);
	},
});