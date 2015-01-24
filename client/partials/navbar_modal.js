Template.navbarModal.events({
	'click .md-close': function(e, t) {
		e.preventDefault();
		$('.md-modal').removeClass('md-open');
	}
});