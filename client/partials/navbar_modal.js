Template.navbarModal.helpers({
	checkItsMe: function() {
		if (this.avoidToMe && this.data._id == Meteor.userId()) return;
		return this;
	}
});

Template.navbarModal.events({
	'click .md-close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e);
	},
	'click .send-thumbs-up': function(e, t) {
		e.preventDefault();

		var voteObj = {	targetId: this.data._id };
		var gender = this.data.profile.gender;
		var parent = this;

		Meteor.call('voteUser', voteObj, gender, function(error, result) {
			Bisia.Ui.runAfter(function() {
				Bisia.Ui.setReactive('bubble', {
					template: 'voteBubble',
					user: parent.data,
					message: error ? error : result
				});
			}, function() {
				Bisia.Ui.unsetReactive('bubble');
			}, 3);
		});
	}
});