Template.messagesList.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '.list', 'bottom-show');
	}
});

Template.messagesBlock.helpers({
	joinWithChatAuthor: function() {
		var item = this;
		var authorId = _.without(this.ownerIds, Meteor.userId())[0];
		var user = Users.findOne({ '_id': authorId }, { 'fields': {
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
		var limit = Bisia.getController('params')['pageLimit'];
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
	}
});