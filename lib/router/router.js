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

// MESSAGGI

Router.route('/messaggio/:chatId/:pageLimit?', {
	name: 'readMessage',
	template: 'infiniteList',
	controller: ViewMessageController
});

Router.route('/messaggi-ricevuti/:pageLimit?', {
	name: 'getMessages',
	template: 'infiniteList',
	controller: GetMessagesController
});

Router.route('/messaggi-inviati/:pageLimit?', {
	name: 'sentMessages',
	template: 'infiniteList',
	controller: SentMessagesController
});

// TI CONOSCONO

Router.route('/dicono-di-conoscerti/:pageLimit?', {
	name: 'friendsList',
	template: 'infiniteList',
	controller: FriendsController
});

// VISITE RICEVUTE

Router.route('/visite-ricevute/:pageLimit?', {
	name: 'visitsList',
	template: 'infiniteList',
	controller: VisitsController
});

// VOTI RICEVUTI

Router.route('/voti-ricevuti/:pageLimit?', {
	name: 'votesList',
	template: 'infiniteList',
	controller: VotesController
});

// CHI CONOSCI

Router.route('/chi-dici-di-conoscere/:pageLimit?', {
	name: 'youKnowList',
	template: 'infiniteList',
	controller: YourFriendsController
});

// IMPOSTAZIONI UTENTE

Router.route('/profilo/impostazioni', {
	name: 'userSettings',
	controller: UserSettingsController
});

// RECUPERA PASSWORD

Router.route('/recupera-password', {
	name: 'recoverPassword',
	controller: UnloggedController
});

// REGISTRATI

Router.route('/registrati', {
	name: 'registerUser',
	controller: UnloggedController
});

// LOGIN

Router.route('/login', {
	name: 'loginUser',
	controller: UnloggedController
});

// PROFILO

Router.route('/:username', {
	name: 'userProfile',
	controller: UserProfileController
});

// HOME PAGE

Router.route('/', {
	name: 'homePage',
	controller: LoggedController
});