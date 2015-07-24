// On Meteor Startup - CLIENT SIDE
Meteor.startup(function() {
	// Check the connection status
	Bisia.Session.connectionStatus();
});

// Autorun hearthbeat when Meteor.userId()
// Otherwise clear hearthbeat interval
Tracker.autorun(function () {
	// Track hearthBeat
	Bisia.Session.hearthBeat();
	// Force Unlog by the server
	// Bisia.Login.forceUnlogged();
	// Show New User Hints
	Bisia.Notification.showNewUserHint();
});