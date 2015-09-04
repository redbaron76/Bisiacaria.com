Meteor.startup(function () {
	// Init Config in /lib/application/config.js
	Bisia.Config.init();
	// Run the ghost users cleaner
	Bisia.Session.ghostsCleaner();
	// Init Mail in /server/commons/mail.js
	Bisia.Mail.init();
	// Init Automator
	Bisia.Automator.init();
	// Init Winston logger
	Bisia.Log.init();
	// Enabled in settings.json
	Bisia.Login.basicAuthProtect();

	// Ensure Indexes
	ensureIndexesOnStartup();
});

var ensureIndexesOnStartup = function() {
	Chats._ensureIndex({ 'ownerIds': 1 });
	Friends._ensureIndex({ 'targetId': 1, 'userId': 1 });
	Messages._ensureIndex({ 'chatId': 1, 'targetId': 1, 'userId': 1, 'createdAt': 1 });
	Notifications._ensureIndex({ 'targetId': 1, 'userId': 1, 'broadcastedAt': 1 });
	Pokerhands._ensureIndex({ 'playerId': 1 });
	Pokerplayers._ensureIndex({ 'playerId': 1 }, { unique: true });
	Users._ensureIndex({ 'username': 1}, { unique: true });
	Votes._ensureIndex({ 'targetId': 1, 'userId': 1 });
}