Template.voteUser.events({
	'click .send-vote': function(e, t) {
		e.preventDefault();

		var voteObj = {	targetId: t.data.userId };
		var gender = t.data.profile.gender;

		Meteor.call('voteUser', voteObj, gender, function(error, result) {
			Bisia.Ui.runAfter(function() {
				Bisia.Ui.setReactive('bubble', {
					template: 'voteBubble',
					user: t.data,
					message: error ? error : result
				});
			}, function() {
				Bisia.Ui.unsetReactive('bubble');
			}, 3);
		});
	}
});