Template.overlayWrapper.helpers({
	hasPopup: function() {
		return 	Bisia.Message.target.get()/* ||
				Bisia.ALTRO.target.get()*/
				;
	}
});





Template.popupWrapper.helpers({
	targetUser: function() {
		return Bisia.Message.target.get();
	}
});

Template.popupWrapper.rendered = function() {
	parent.$('#message-text').autosize({ append: '' });
};

Template.popupWrapper.events({
	'submit #message-form': function(e, t) {
		e.preventDefault();
		var text = $(e.target).find('#message-text').val();
		Bisia.Message.sendMessage(text);
	},
	'click .md-popup .close': function(e, t) {
		e.preventDefault();
		Bisia.Message.unsetTarget();
	},
});