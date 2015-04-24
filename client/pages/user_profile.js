Template.userProfile.rendered = function() {
	if(this.data.user._id !== Meteor.userId()) {
		Meteor.call('visitUser', {
			targetId: this.data.user._id
		});
	}
};


Template.userProfile.helpers({
	lastTimeOnline: function() {
		var lastTime = moment(Bisia.User.getProfile("loginSince", this));
		return moment(lastTime).fromNow();
	},
	nextBirthDay: function() {
		var birthday = moment(Bisia.User.getProfile("birthday", this), 'DD-MM-YYYY', true);
		var now = moment();
		var day = birthday.get('date'), month = birthday.get('month'), year = now.get('year');
		return (now.diff([year, month, day], 'days') * -1);
	},
	signupDate: function() {
		var signup = moment(Bisia.User.getUser("createdAt", this));
		return moment(signup).format("DD/MM/YYYY");
	},
	votesCount: function() {
		return (this.profile.votesCount) ? this.profile.votesCount : 0;
	},
	followCount: function() {
		return (this.friends) ? this.friends.length : 0;
	},
	youKnowThis: function() {
		return (this.friends && _.indexOf(this.friends, Meteor.userId()) >= 0) ? 'checked' : '';
	}
});

Template.userProfile.events({
	'click .toggle-info': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleClass('flip', '.flip-container', t);
	},
	'click #new-post-profile': function(e, t) {
		e.preventDefault();
		$('#new-post').trigger('click');
	},
	'click #question-lovehate': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'questionLovehateModal', this);
	},
	'click #write-message': function(e, t) {
		e.preventDefault();
		var userObj = Bisia.Message.getMessageObject(this, 'messagePopup');
		Bisia.Ui.setReactive('popup', userObj);
	},
	'click #send-vote': function(e, t) {
		e.preventDefault();
		Meteor.call('voteUser', {
			targetId: t.data.user._id
		});
	},
	'click #go-messages': function(e) {
		e.preventDefault();
		Router.go('getMessages');
	},
	'click #go-settings': function(e) {
		e.preventDefault();
		Router.go('userSettings');
	},
	'change #toggle-know': function(e, t) {
		e.preventDefault();
		Meteor.call('knowUser', {
			targetId: t.data.user._id,
			check: e.target.checked
		});
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtOffset(e, '#profile', 468, 'top-show');
		Bisia.Ui.toggleAtBottom(e, '#profile', 'bottom-show');
	}
});