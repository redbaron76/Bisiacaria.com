// On Meteor Startup - CLIENT SIDE
Meteor.startup(function() {
	// Set an empty formErrors object in Session
	Session.set('formErrors', {});
	// Set an empty formSuccess object in Session
	Session.set('formSuccess', {});
});

// Autorun hearthbeat when Meteor.userId()
// Otherwise clear hearthbeat interval
Tracker.autorun(function () {
	// Track hearthBeat
	Bisia.Session.hearthBeat();
	// Force Unlog by the server
	Bisia.Login.forceUnlogged();
});