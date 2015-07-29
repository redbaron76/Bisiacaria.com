// Router
Router.configure({
	layoutTemplate: 'base',
	loadingTemplate: 'loading',
	notFoundTemplate: 'notFound',
	waitOn: function() {
		return Meteor.subscribe('countUsers');
	}
});

// Require login to all routes, except...
Router.onBeforeAction(Bisia.Login.requireLogin, {
	except: [
		'loginUser',
		'loginUser1',
		'registerUser',
		'recoverPassword',
		'resetPassword',
		'confirmEmail'
	]
});

// ADMIN COMMANDS

Router.route('/admin/:command', {
	name: 'adminAction',
	controller: AdminCommandController,
	fastRender: false
});

// MAIL ROUTES

Router.route('/reset-password/:token', {
	name: 'resetPassword',
	data: function() {
		return {
			token: this.params.token
		}
	},
	fastRender: false
});

Router.route('/conferma-email/:token?', {
	name: 'confirmEmail',
	data: function() {
		return {
			token: this.params.token
		}
	},
	fastRender: false
});

// NOTIFICHE

Router.route('/notifiche/:pageLimit?', {
	name: 'notificationList',
	template: 'infiniteList',
	controller: NotifyController,
	fastRender: false
});

// NOVITA' DA CHI CONOSCI

Router.route('/novita/:pageLimit?', {
	name: 'newsList',
	template: 'friendPosts',
	controller: NewsController,
	fastRender: false
});

// EVENTI DELLA SETTIMANA

Router.route('/eventi-della-settimana', {
	name: 'eventList',
	template: 'nextEventList',
	controller: eventListController,
	fastRender: true
});

// COMPLEANNI DI OGGI

Router.route('/compleanni-di-oggi/:pageLimit?', {
	name: 'birthdayList',
	template: 'infiniteList',
	controller: BirthdayController,
	fastRender: false
});

// MESSAGGI

Router.route('/messaggio/:username/:chatId/:pageLimit?', {
	name: 'readMessage',
	template: 'chatList',
	controller: ChatController,
	fastRender: false
});

Router.route('/messaggi-privati/:pageLimit?', {
	name: 'getMessages',
	template: 'messagesList',
	controller: GetMessagesController,
	fastRender: false
});

// TI CONOSCONO

Router.route('/ti-conoscono/:pageLimit?', {
	name: 'friendsList',
	template: 'infiniteList',
	controller: FriendsController,
	fastRender: false
});

// CHI CONOSCI

Router.route('/le-tue-conoscenze/:pageLimit?', {
	name: 'youKnowList',
	template: 'infiniteList',
	controller: YourFriendsController,
	fastRender: false
});

// VISITE RICEVUTE

Router.route('/visite-ricevute/:pageLimit?', {
	name: 'visitsList',
	template: 'infiniteList',
	controller: VisitsController,
	fastRender: false
});

// VOTI RICEVUTI

Router.route('/voti-ricevuti/:pageLimit?', {
	name: 'votesList',
	template: 'infiniteList',
	controller: VotesController,
	fastRender: false
});

// ULTIMI ISCRITTI

Router.route('/ultimi-iscritti/:pageLimit?', {
	name: 'lastSignupList',
	template: 'infiniteList',
	controller: LastSignupController,
	fastRender: false
});

// SERCH USERS

Router.route('/cerca-utenti/:pageLimit?', {
	name: 'searchUsers',
	template: 'infiniteList',
	controller: SearchUsersController,
	fastRender: true
});

// USERNAME CONOSCE

Router.route('/:username/conosce/:_id/:pageLimit?', {
	name: 'userKnowList',
	template: 'infiniteList',
	controller: UsernameKnowController,
	fastRender: false
});

// CONOSCONO USERNAME

Router.route('/conoscono/:username/:_id/:pageLimit?', {
	name: 'knowUserList',
	template: 'infiniteList',
	controller: KnowUsernameController,
	fastRender: false
});

// SINGLE EVENT

Router.route('/evento/:_id', {
	name: 'singleEvent',
	controller: SingleEventController,
	fastRender: true
});

// IMPOSTAZIONI UTENTE

Router.route('/profilo/impostazioni', {
	name: 'userSettings',
	controller: UserSettingsController,
	fastRender: true
});

// RECUPERA PASSWORD

Router.route('/recupera-password', {
	name: 'recoverPassword',
	controller: UnloggedController,
	fastRender: true
});

// REGISTRATI

Router.route('/registrati', {
	name: 'registerUser',
	controller: UnloggedController,
	fastRender: true
});

// LOGIN

Router.route('/login', {
	name: 'loginUser',
	controller: UnloggedController,
	fastRender: true
});

Router.route('/login1', {
	name: 'loginUser1',
	controller: UnloggedController,
	fastRender: true
});

// OFFLINE

Router.route('/offline', {
	name: 'loading',
	fastRender: true
});

// SINGLE POST

Router.route('/post/:_id', {
	name: 'singlePost',
	controller: SinglePostController,
	fastRender: true
});

// PROFILO

Router.route('/:username', {
	name: 'userProfile',
	controller: UserProfileController,
	fastRender: true
});

// HOME PAGE

Router.route('/', {
	name: 'homePage',
	controller: HomePageController,
	fastRender: true
});