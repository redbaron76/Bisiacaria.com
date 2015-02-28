Template.messagePopup.helpers({
	targetUser: function() {
		return Bisia.Ui.popup.get();
	}
});

Template.messagePopup.rendered = function() {
	parent.$('#message-text').autosize({ append: '' });
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