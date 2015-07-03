Template.messagesFrom.helpers({
	messagePath: function() {
		var chatId = (this.chatId) ? this.chatId : this._id;
		var countUnread = Counts.get(chatId);
		return _.extend(this, {
			chatId: chatId,
			countUnread: countUnread
		});
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
	inOrOut: function() {
		return (this.targetId == Meteor.userId()) ? 'in-message' : 'out-message';
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
	'click #delete-message': function(e, t) {
		e.preventDefault();
		var data = _.extend(this, {
			infoTitle: "Eliminare questa chat?",
			infoText: "Stai per eliminare questa chat!<br>Il tuo interlocutore potrà ad ogni modo rispondere e continuare a scriverti su questa chat."
		});
		Bisia.Ui.confirmDialog('Bisia.Message.deleteMessage', e, data);
	}
});