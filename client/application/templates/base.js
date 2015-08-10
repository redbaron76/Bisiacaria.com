Template.base.helpers({
	isLogged: function() {
		if (Bisia.User.isLogged()) {
			return 'logged';
		} else {
			return 'unlogged';
		}
	}
});

/**
 * Template Events
 */
Template.base.events({
	'click .md-overlay': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar();
	},
	'click [data-animation=loading]': function(e, t) {
		Bisia.Ui.loadingAdd(e);
	},
	'click [type=submit]': function(e, t) {
		Bisia.Ui.waitStart(e);
	},
	'click [data-action=close]': function(e, t) {
		Bisia.Ui.toggleSidebar();
	},
	'click [data-target]': function(e, t) {
		e.preventDefault();
		Bisia.Form.triggerSubmit(e);
	},
	'click [data-img]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.triggerFullScreenImage(e);
	}
});

Template.deviceSwitcher.events({
	'click [data-device]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar().changeDevice(e);
	}
});

Template.modalWrapper.helpers({
	hasModal: function() {
		return Bisia.Ui.modal.get();
	}
});