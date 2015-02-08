Template.infiniteList.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '.item-list > li:last', '.list', 'bottom-show');
	}
});