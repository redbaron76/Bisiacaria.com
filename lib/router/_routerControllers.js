// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Ui.resetFormMessages();
		this.next();
	}
});

// Password-protected pages controller
LoggedController = UnloggedController.extend({

});

UserProfileController = LoggedController.extend({
	user: function() {
		return Users.findOne({ 'username': this.params.username });
	},
	subscriptions: function() {
		this.pageLoading = Meteor.subscribe('userProfile', this.params.username);
	},
	data: function() {
		return {
			user: this.user(),
			pageReady: this.pageLoading.ready
		}
	}
});

UserSettingsController = LoggedController.extend({
	user: function() {
		return Users.findOne({'_id': Meteor.userId() });
	},
	subscriptions: function() {
		this.pageLoading = Meteor.subscribe('userSettings');
	},
	data: function() {
		return {
			user: this.user(),
			pageReady: this.pageLoading.ready
		}
	}
});

PaginatorController = RouteController.extend({
	increment: 20,
	onAfterAction: function() {
		// triggers the notification
		Bisia.Notification.reset(this.viewAction);
	},
	isPaginating: function() {
		return this.pageLimit() !== this.increment;
	},
	pageLimit: function() {
		return parseInt(this.params.pageLimit) || this.increment;
	},
	pageSorting: function() {
		return { 'createdAt': -1, '_id': -1 };
	},
	findOptions: function() {
		return { 'sort': this.pageSorting(), 'limit': this.pageLimit() };
	},
	findQuery: function() {
		return (this.collection == 'notifications') ? { 'action': this.viewAction } : {};
	},
	subscriptions: function() {
		this.state.set('paginating', this.isPaginating());
		this.pageSub = Meteor.subscribe(this.collection, this.findQuery(), this.findOptions(), function() {
			Bisia.Ui.hideElement('.list', 'bottom-show');
		});
	},
	items: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},
	nextPath: function() {
		return Router.routes.visitsList.path({ 'pageLimit': this.pageLimit() + this.increment });
	},
	data: function() {
		var hasMore = this.items().count() === this.pageLimit();
		Bisia.Ui.pageReady = this.pageSub.ready;
		return {
			items: this.items(),
			nextPath: hasMore ? this.nextPath() : null,
			pageDisplay: (this.state.get('paginating') || this.pageSub.ready),
			pageReady: this.pageSub.ready,
			viewTemplate: this.viewTemplate,
			title: this.title
		}
	}
});

FriendsController = PaginatorController.extend({
	viewAction: 'friend',
	collection: 'friends',
	title: 'Ti conoscono',
	viewTemplate: 'visitUser'
});

VisitsController = PaginatorController.extend({
	viewAction: 'visit',
	collection: 'notifications',
	title: 'Visite ricevute',
	viewTemplate: 'visitUser'
});

VotesController = PaginatorController.extend({
	viewAction: 'vote',
	collection: 'votes',
	title: 'Voti ricevuti',
	viewTemplate: 'voteUser'
});