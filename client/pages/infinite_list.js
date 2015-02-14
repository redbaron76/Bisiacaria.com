Template.infiniteList.helpers({
	joinWithAuthor: function() {
		var item = this;
		var user = Users.findOne({ '_id': item.userId });
		return _.extend(item, _.omit(user, ['_id', 'createdAt']));
	}
});

Template.infiniteList.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '.item-list > li:last', '.list', 'bottom-show');
	}
});