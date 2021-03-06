Template.chatList.onRendered(function() {
	if (Bisia.User.isLogged()) {
		// set message as isRead = true
		var chatId = Bisia.getController('params')['chatId'];
		if (chatId)
			Meteor.call('messageOpen', chatId);
	}
});

Template.chatList.helpers({
	joinWithAuthor: function() {
		var item = this;
		var authorId = Iron.controller().getAuthor();
		var user = Users.findOne({ '_id': item[authorId] }, { 'fields': {
			'username': 1,
			'profile.city': 1,
			'profile.gender': 1,
			'profile.status': 1,
			'profile.avatar': 1,
			'profile.online': 1
		}});
		return _.extend(item, _.omit(user, '_id'));
	},
	detectFirstPage: function() {
		var increment = Bisia.getController('increment');
		var limit = Bisia.getController('params')['pageLimit'] || null;
		// Don't show spinner by default
		var pageDisplay = true;
		// If we are on the first page...
		if (!limit || limit == increment) {
			// pageDisplay becomes reactive
			pageDisplay = this.pageReady;
		}
		// Add pageDisplay to this
		return _.extend(this, {
			pageDisplay: pageDisplay
		});
	},
	hasMoreLinks: function() {
		if(this.pageReady) {
			return (this.nextPath) ? true : false;
		}
		return true;
	}
});

Template.chatList.events({
	'click .load-more': function() {
		Bisia.Message.goToFirst = true;
		Bisia.Message.goToBottom = false;
	}
});

Template.chatItem.onRendered(function() {
	// this.$('.emoticonize').emoticonize(Bisia.Config.emoticonizeSettings());
	if(Bisia.Message.goToBottom) {
		Bisia.Ui.goBottom();
		// set isRead when received message from other user
		if (this.data.targetId == Meteor.userId()) {
			Meteor.call('messageOpen', this.data.chatId);
		}
	}
});

Template.chatItem.helpers({
	detectMe: function() {
		var itsMe = (this.userId == Meteor.userId()) ? true : false;
		var classMe = (itsMe) ? 'me' : null;

		return _.extend(this, {
			itsMeClass: classMe,
			thisIsMe: itsMe
		});
	},
	isRead: function() {
		return this.isRead ? 'read' : '';
	},
});

Template.replyForm.onRendered(function() {
	// Not focus if tablet or phone
	if (Meteor.Device.isDesktop()) {
		this.$('.autosize').textareaAutoSize().focus();
	}
});

Template.replyForm.events({
	'submit #reply-form': function(e, t) {
		e.preventDefault();
		var chatId = Bisia.getController('params')['chatId'];
		var $textarea = $(e.target).find('#message-reply');
		if(Bisia.Message.sendMessage($textarea.val(), chatId)) {
			$textarea.val('').css({'height': 'auto'});
			Bisia.Ui.waitStop();
		}
	},
	'click #delete-message': function(e, t) {
		e.preventDefault();
		var data = _.extend(this, {
			infoTitle: "Eliminare questa chat?",
			infoText: "Stai per eliminare questa chat!<br>Il tuo interlocutore potrà ad ogni modo rispondere e continuare a scriverti su questa chat."
		});
		Bisia.Ui.confirmDialog('Bisia.Message.deleteMessage', e, data);
	},
	'click #block-user': function(e, t) {
		e.preventDefault();
		var data = _.extend(this, {
			infoTitle: "Bloccare questo utente?",
			infoText: "Stai per bloccare questo utente!<br>Non sarà più in grado di vederti online nè di interagire con te."
		});
		Bisia.Ui.confirmDialog('Bisia.User.blockUser', e, data);
	},
	'keypress #message-reply': function(e, t) {
		if (e.which === 13 && $('#submit-on-enter').prop('checked')) {
			e.preventDefault();
			$('#reply-form').trigger('submit');
		}
	}
});