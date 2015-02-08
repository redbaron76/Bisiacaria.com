// Router
Router.configure({
	layoutTemplate: 'base',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',
	waitOn: function() {
		return Meteor.subscribe('countUsers');
	}
});

Router.route('/reset-password/:token', {
	name: 'resetPassword',
	data: function() {
		return {
			token: this.params.token
		}
	}
});

Router.route('/conferma-email/:token', {
	name: 'confirmEmail',
	data: function() {
		return {
			token: this.params.token
		}
	}
});

Router.route('/profilo/impostazioni', {
	name: 'userSettings',
	controller: UserSettingsController
});

Router.route('/dicono-di-conoscerti/:pageLimit?', {
	name: 'friendsList',
	template: 'infiniteList',
	controller: FriendsController
});

Router.route('/visite-ricevute/:pageLimit?', {
	name: 'visitsList',
	template: 'infiniteList',
	controller: VisitsController
});

Router.route('/voti-ricevuti/:pageLimit?', {
	name: 'votesList',
	template: 'infiniteList',
	controller: VotesController
});

Router.route('/recupera-password', {
	name: 'recoverPassword',
	controller: UnloggedController
});

Router.route('/registrati', {
	name: 'registerUser',
	controller: UnloggedController
});

Router.route('/login', {
	name: 'loginUser',
	controller: UnloggedController
});

Router.route('/:username', {
	name: 'userProfile',
	controller: UserProfileController
});

Router.route('/', {
	name: 'homePage',
	controller: LoggedController
});