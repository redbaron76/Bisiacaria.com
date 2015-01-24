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
	}
});