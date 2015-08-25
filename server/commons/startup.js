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
});