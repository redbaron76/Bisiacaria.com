Template.navbarModal.events({
	'click .md-close': function(e, t) {
		e.preventDefault();
		$('.md-modal').removeClass('md-open');
	},
	'click .send-thumbs-up': function(e, t) {
		e.preventDefault();

		var vote = {
			targetId: t.data.data._id
		};

		Meteor.call('voteUser', vote, function(error, result) {
			Bisia.log(error);
			Bisia.log(result);
		});
	}
});