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

/**
 * Get the parent template instance
 * @param {Number} [levels] How many levels to go up. Default is 1
 * @returns {Blaze.TemplateInstance}
 */

Blaze.TemplateInstance.prototype.parentTemplate = function (levels) {
    var view = Blaze.currentView;
    if (typeof levels === "undefined") {
        levels = 1;
    }
    while (view) {
        if (view.name.substring(0, 9) === "Template." && !(levels--)) {
            return view.templateInstance();
        }
        view = view.parentView;
    }
};