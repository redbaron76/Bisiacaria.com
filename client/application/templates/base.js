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
	'click [data-action=close]': function(e, t) {
		Bisia.Ui.toggleSidebar();
	},
	'click [data-target]': function(e, t) {
		e.preventDefault();
		Bisia.Form.triggerSubmit(e);
	}
});

Template.device.events({
	'click [data-device]': function(e, t) {
		e.preventDefault();
		Bisia.Ui.changeDevice(e);
	}
});