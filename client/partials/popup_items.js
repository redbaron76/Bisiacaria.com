// MESSAGE

Template.messagePopup.helpers({
	targetUser: function() {
		return Bisia.Ui.popup.get();
	}
});

Template.messagePopup.rendered = function() {
	parent.$('#message-text').textareaAutoSize().focus();
};

Template.messagePopup.events({
	'submit #message-form': function(e, t) {
		e.preventDefault();
		var text = $(e.target).find('#message-text').val();
		Bisia.Message.sendMessage(text, true);
	},
	'click .md-popup .close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('popup');
	},
});

// COMMENT

Template.commentPopup.helpers({
	targetPost: function() {
		return Bisia.Ui.popup.get();
	}
});

Template.commentPopup.rendered = function() {
	parent.$('#comment-text').textareaAutoSize().focus();
};

Template.commentPopup.events({
	'submit #comment-form': function(e, t) {
		e.preventDefault();
		var text = $(e.target).find('#comment-text').val();
		Bisia.Message.sendComment(text);
	},
	'click .md-popup .close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('popup');
	},
});