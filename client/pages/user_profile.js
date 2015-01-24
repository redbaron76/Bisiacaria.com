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
});