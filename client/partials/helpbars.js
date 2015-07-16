Template.helpbars.helpers({
	manageTitle: function() {
		return {
			data: this.data.user || this.data,
			title: this.title || null,
			loadmore: this.loadmore || false,
			gotop: this.gotop || false
		}
	},
	detectFirstPage: function() {
		var increment = Bisia.getController('increment');
		var limit = Bisia.getController('params')['pageLimit'];
		var context = this.data;

		// Don't show spinner by default
		var pageDisplay = true;
		// If we are on the first page...
		if (!limit || limit == increment) {
			// pageDisplay becomes reactive
			pageDisplay = this.pageReady;
		}

		// If loading, set as hasMoreLinks = true (show button)
		if (!context.pageReady) context.nextPath = true;

		// Add pageDisplay to this
		return _.extend(context, {
			pageDisplay: pageDisplay,
			hasMoreLinks: !!context.nextPath ? true : false
		});
	},
});

Template.helpbars.events({
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