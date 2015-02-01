Template.userProfile.rendered = function() {
	// Notify visit if this is not my profile
	var visit = {
		targetId: this.data._id
	}

	// No flood!
	if (Bisia.Notification.afterAmountOfTime(visit.targetId)) {
		Meteor.call('visitUser', visit, function() {
			Bisia.Notification.notifyTrack.push({
				targetId: visit.targetId,
				createdAt: new Date
			});
			Bisia.log(Bisia.Notification.notifyTrack);
		});
	}
};


Template.userProfile.helpers({
	lastTimeOnline: function() {
		var lastTime = moment(Bisia.User.getProfile("loginSince", this));
		return moment(lastTime).fromNow();
	},
	nextBirthDay: function() {
		var birthday = moment(Bisia.User.getProfile("birthday", this));
		var now = moment();
		var day = birthday.get('date'), month = birthday.get('month'), year = now.get('year');
		return now.diff([year, month, day], 'days');
	},
	signupDate: function() {
		var signup = moment(Bisia.User.getUser("createdAt", this));
		return moment(signup).format("DD/MM/YYYY");
	},
	votesCount: function() {
		return (this.votesCount) ? this.votesCount : 0;
	},
	followCount: function() {
		return (this.friends) ? this.friends.length : 0;
	},
	youKnowThis: function() {
		return (this.friends && _.indexOf(this.friends, Meteor.userId()) >= 0) ? 'checked' : '';
	},
	pageReady: function() {
		return Bisia.getController('userProfileSub').ready();
	}
});

Template.userProfile.events({
	'click .toggle-info': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleClass('flip', '.flip-container', t);
	},
	'click #question-lovehate': function(e, t) {
		Bisia.Ui.toggleModal(e);
	},
	'click #send-vote': function(e, t) {
		e.preventDefault();
		Meteor.call('voteUser', {
			targetId: t.data._id
		});
	},
	'change #toggle-know': function(e, t) {
		e.preventDefault();
		Meteor.call('knowUser', {
			targetId: t.data._id,
			check: e.target.checked
		});
	}
});