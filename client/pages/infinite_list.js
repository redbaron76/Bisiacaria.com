/*Template.infiniteList.helpers({
});*/

Template.infiniteList.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');
	}
});

Template.infiniteBlock.helpers({
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
	},
	foundUsers: function() {
		return this.searchUsers && this.items.count() > 0;
	}
});

Template.topLinkButton.helpers({
	attributes: function() {
		if (this.path == Bisia.getController('selected')) {
			return { class: 'selected' };
		}
	}
});