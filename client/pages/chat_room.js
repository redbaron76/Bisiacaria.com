Template.chatRoom.onRendered(function() {

	var instance = this;

	if (Meteor.userId()) {
		Meteor.call('chatRoomEnter', function(error, banned) {
			if (banned) {
				var message = "Il tuo profilo è stato bannato per 24 ORE dalla Bisia-Chat a causa del tuo comportamento ritenuto non idoneo da parte della maggioranza degli altri utenti presenti in chat.";
				return Bisia.Ui.submitError(message, 'Ingresso negato!');
			}
		});
	}

	instance.autorun(function() {
		console.log(Bisia.Message.chatIsBanned());
		if (Bisia.Message.chatIsBanned()) {
			Router.go('homePage');
		}
	});

	Bisia.Ui.goBottom();
});

Template.chatRoom.onDestroyed(function() {
	if (Meteor.userId()) {
		Meteor.call('chatRoomExit');
	}
});

Template.chatRoom.helpers({
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

Template.chatRoom.events({
	'click .load-more': function() {
		Bisia.Message.goToFirst = true;
		Bisia.Message.goToBottom = false;
	}
});

Template.chatRoomItem.onRendered(function() {
	// this.$('.emoticonize').emoticonize(Bisia.Config.emoticonizeSettings());
	if(Bisia.Message.goToBottom) {
		Bisia.Ui.goBottom();
	}
});

Template.chatRoomItem.helpers({
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

Template.chatRoomItem.events({
	'click [data-action=ban]': function(e, t) {
		e.preventDefault();
		var data = _.extend(this, {
			infoTitle: "Bannare questo utente?",
			infoText: "Stai per proporre il ban di questo utente per condotta in chat non consona. " +
					  "L'utente verrà bannato non appena altri utenti confermeranno la stessa scelta.<br><br>" +
					  "Ti preghiamo di usare BUON SENSO nel prendere questa decisione. Grazie."
		});
		Bisia.Ui.confirmDialog('Bisia.Message.chatBanThisUser', e, data);
	}
});

Template.replyChatForm.onRendered(function() {
	// Not focus if tablet or phone
	if (Meteor.Device.isDesktop()) {
		this.$('.autosize').textareaAutoSize().focus();
	}
});

Template.replyChatForm.events({
	'submit #reply-form': function(e, t) {
		e.preventDefault();
		var $textarea = $(e.target).find('#chat-reply');
		if(Bisia.Message.sendChatMessage($textarea.val())) {
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
	'keypress #chat-reply': function(e, t) {
		if (e.which === 13 && $('#submit-on-enter').prop('checked')) {
			e.preventDefault();
			$('#reply-form').trigger('submit');
		}
	}
});