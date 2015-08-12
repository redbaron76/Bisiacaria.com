Template.navbarTop.events({
	'click h1': function(e, t) {
		Bisia.Ui.goTop(e, '.content');
	},
	'click .toggle-menu': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-left');
	},
	'click .toggle-users': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleSidebar('sidebar-open-right');
	}
});