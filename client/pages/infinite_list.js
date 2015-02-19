Template.infiniteList.helpers({
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
	firstPage: function() {
		var increment = Bisia.getController('increment');
		var limit = Bisia.getController('params')['pageLimit'];

		var pageDisplay = true;
		if (!limit || limit == increment) {
			// first page
			pageDisplay = this.pageReady;
		}

		return _.extend(this, {
			pageDisplay: pageDisplay
		});
	}
});

Template.infiniteList.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '.item-list > li:last', '.list', 'bottom-show');
	}
});

Template.topLinkButton.helpers({
	attributes: function() {
		if (this.path == Bisia.getController('selected')) {
			return { class: 'selected' };
		}
	}
});

Template.paginator.helpers({
	hasMoreLinks: function() {
		if(this.pageReady()) {
			return (this.nextPath) ? true : false;
		}
		return true;
	}
});

Template.paginator.events({
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'click .load-more': function(e, t) {
		e.preventDefault();
		if (this.nextPath) {
			Router.go(this.nextPath);
		}
	}
});