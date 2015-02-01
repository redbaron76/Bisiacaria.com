// Non-password protected pages controller
UnloggedController = RouteController.extend({
	onBeforeAction: function() {
		Bisia.Ui.resetFormMessages();
		this.next();
	}
});

// Password-protected pages controller
LoggedController = UnloggedController.extend({
	subscriptions: function() {

	}
});

PaginatorController = RouteController.extend({
	increment: 20,
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
		return { 'action': this.viewAction };
	},
	subscriptions: function() {
		this.pageSub = Meteor.subscribe(this.collection, this.findQuery(), this.findOptions());
	},
	users: function() {
		return Bisia.getCollection(this.collection).find(this.findQuery(), this.findOptions());
	},
	data: function() {
		var hasMore = this.users().count() === this.pageLimit();
		return {
			users: this.users(),
			pageReady: this.pageSub.ready,
			nextPath: hasMore ? this.nextPath() : null
		}
	}
});

VisitsController = PaginatorController.extend({
	viewAction: 'visit',
	collection: 'notifications',
	nextPath: function() {
		return Router.routes.visitsList.path({ 'pageLimit': this.pageLimit() + this.increment });
	}
});

UserProfileController = RouteController.extend({
	subscriptions: function() {
		this.username = this.params.username;
		if (this.username)
			this.userProfileSub = Meteor.subscribe('userProfile', this.username);
	},
	data: function() {
		return Users.findOne({ 'username': this.params.username });
	}
});

UserSettingsController = RouteController.extend({
	subscriptions: function() {
		var userId = Meteor.userId();
		if (userId)
			this.userSub = Meteor.subscribe('user', userId);
	}
});