Template.messagesFrom.helpers({
	messagePath: function() {
		var countUnread = Counts.get(this._id);
		return _.extend(this, {
			chatId: this._id,
			countUnread: countUnread
		});
	},
/*	formatChatId: function() {
		var chatId = this.chatId ? this.chatId : this._id;
		return _.extend(this, {chatId: chatId});
	},*/
	inOrOut: function() {
		return (this.msgTo == Meteor.userId()) ? 'in-message' : 'out-message';
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