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