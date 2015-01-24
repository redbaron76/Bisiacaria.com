Template.navbarTop.events({
	'click .toggle-menu': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-left');
	},
	'click .toggle-users': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-right');
	}
});

Template.navbarTop.helpers({

});