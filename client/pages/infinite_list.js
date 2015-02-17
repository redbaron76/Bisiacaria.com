Template.infiniteList.helpers({
	joinWithAuthor: function() {
		var item = this;
		var authorId = Iron.controller().getAuthor();
		var user = Users.findOne({ '_id': item[authorId] });
		return _.extend(item, _.omit(user, ['_id', 'createdAt']));
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