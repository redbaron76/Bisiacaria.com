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
		'confirmEmail',
		'accessStatus',
        'unsubscribeUser'
	]
});

// ADMIN COMMANDS

Router.route('/admin/:command', {
	name: 'adminAction',
	controller: AdminCommandController,
	fastRender: false
});

// UNSUBSCRIBE OLD USERS

Router.route('/unsubscribe/:userId', {
    name: 'unsubscribeUser',
    controller: UnsubscribeController,
    fastRender: false
});

// BISIA PASS

Router.route('/access/:eventId/:userId', {
	name: 'accessStatus',
	controller: AccessController,
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
	fastRender: true
});

// NOVITA' DA CHI CONOSCI

Router.route('/novita/:pageLimit?', {
	name: 'newsList',
	template: 'friendPosts',
	controller: NewsController,
	fastRender: true
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
	fastRender: true
});

// MESSAGGI

Router.route('/messaggio/:username/:chatId/:pageLimit?', {
	name: 'readMessage',
	template: 'chatList',
	controller: ChatController,
	fastRender: true
});

Router.route('/messaggi-privati/:pageLimit?', {
	name: 'getMessages',
	template: 'messagesList',
	controller: GetMessagesController,
	fastRender: true
});

// CHAT ROOM

Router.route('/chat-room/:pageLimit?', {
	name: 'chatRoom',
	template: 'chatRoom',
	controller: ChatRoomController,
	fastRender: true
});

// TI CONOSCONO

Router.route('/ti-conoscono/:pageLimit?', {
	name: 'friendsList',
	template: 'infiniteList',
	controller: FriendsController,
	fastRender: true
});

// CHI CONOSCI

Router.route('/le-tue-conoscenze/:pageLimit?', {
	name: 'youKnowList',
	template: 'infiniteList',
	controller: YourFriendsController,
	fastRender: true
});

// VISITE RICEVUTE

Router.route('/visite-ricevute/:pageLimit?', {
	name: 'visitsList',
	template: 'infiniteList',
	controller: VisitsController,
	fastRender: true
});

// VOTI RICEVUTI

Router.route('/voti-ricevuti/:pageLimit?', {
	name: 'votesList',
	template: 'infiniteList',
	controller: VotesController,
	fastRender: true
});

// ULTIMI ISCRITTI

Router.route('/ultimi-iscritti/:pageLimit?', {
	name: 'lastSignupList',
	template: 'infiniteList',
	controller: LastSignupController,
	fastRender: true
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
	fastRender: true
});

// CONOSCONO USERNAME

Router.route('/conoscono/:username/:_id/:pageLimit?', {
	name: 'knowUserList',
	template: 'infiniteList',
	controller: KnowUsernameController,
	fastRender: true
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

// BIS-POKER

Router.route('/bis-poker', {
	name: 'bisPoker',
	controller: BisPokerController,
	fastRender: true
});

Router.route('/bis-poker/classifica/:pageLimit?', {
	name: 'bisPokerRanking',
	controller: PokerRankingController,
	fastRender: true
});

Router.route('/bis-poker/vincitori', {
	name: 'bisPokerWinners',
	controller: PokerWinnersController,
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