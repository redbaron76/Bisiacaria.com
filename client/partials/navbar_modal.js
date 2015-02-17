Template.navbarModal.events({
	'click .md-close': function(e, t) {
		e.preventDefault();
		$('.md-modal').removeClass('md-open');
	},
	'click .send-thumbs-up': function(e, t) {
		e.preventDefault();
		Meteor.call('voteUser', {
			targetId: t.data.data.user._id
		});
	}
});