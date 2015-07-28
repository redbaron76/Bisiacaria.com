Template.userProfile.onRendered(function() {
	if(this.data.user._id !== Meteor.userId()) {
		Meteor.call('visitUser', {
			targetId: this.data.user._id
		});
	}
});


Template.userProfile.helpers({
	lastTimeOnline: function() {
		var lastTime = moment(Bisia.User.getProfile("loginSince", this));
		return moment(lastTime).fromNow();
	},
	nextBirthDay: function() {
		var birthday = moment(Bisia.User.getProfile("birthday", this), 'DD-MM-YYYY', true);
		var now = moment();
		var day = birthday.get('date'), month = birthday.get('month'), year = now.get('year');
		var thisYearBirthday = moment([year, month, day]);

		if (!thisYearBirthday.isValid()) return '??';

		if (now.isAfter(thisYearBirthday)) {
			return now.diff(thisYearBirthday.add(1, 'y'), 'days') * -1;
		} else {
			return now.diff(thisYearBirthday, 'days') * -1;
		}
	},
	birthdayIsToday: function() {
		var birthday = moment(Bisia.User.getProfile("birthday", this), 'DD-MM-YYYY', true);
		var now = moment();
		var day = birthday.get('date'), month = birthday.get('month'), year = now.get('year');
		var thisYearBirthday = moment([year, month, day]);
		return (now.isSame(thisYearBirthday, 'day')) ? true : false;
	},
	signupDate: function() {
		var memberFrom = Bisia.User.getProfile("memberFrom", this);
		var signup = moment(Bisia.User.getUser("createdAt", this));
		if (memberFrom !== undefined) {
			memberFrom = moment(memberFrom);
		}
		var date = memberFrom ? memberFrom : signup;
		return moment(date).format("DD/MM/YYYY");
	},
	votesCount: function() {
		return (this.profile.votesCount) ? this.profile.votesCount : 0;
	},
	// Da quanti son seguito
	followersCount: function() {
		return (this.followers) ? this.followers.length : 0;
	},
	// Quanti seguo
	followingCount: function() {
		return (this.following) ? this.following.length : 0;
	},
	youKnowThis: function() {
		return (this.followers && _.indexOf(this.followers, Meteor.userId()) >= 0) ? 'checked' : '';
	}
});

Template.userProfile.events({
	'click #switch-evaluates': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleClass('stats', '.front', t);
		$(e.currentTarget).find('.fa').toggleClass('fa-align-left fa-times');
	},
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
		// e.preventDefault();
		Bisia.Ui.waitStart(e);

		var voteObj = {	targetId: t.data.user._id };
		var gender = t.data.user.profile.gender;

		Meteor.call('voteUser', voteObj, gender, function(error, result) {
			Bisia.Ui.runAfter(function() {
				Bisia.Ui.setReactive('bubble', {
					template: 'voteBubble',
					user: t.data.user,
					message: error ? error : result
				}).waitStop();
			}, function() {
				Bisia.Ui.unsetReactive('bubble');
			}, 3);
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
	'click #user-know': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'userKnowModal', this);
	},
	'click #know-user': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'knowUserModal', this);
	},
	'click #evaluate-user': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'evaluateUserModal', this);
	},
	'change #toggle-know': function(e, t) {
		e.preventDefault();
		var checked = e.target.checked;
		var targetId = t.data.user._id;
		Meteor.call('knowUser', {
			targetId: targetId,
			check: checked
		});
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtOffset(e, '#helpbars', 468, 'top-show');
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');

		var instance = t.posts;
		var el = e.currentTarget;
		var limit = instance.limit.get();
		limit += instance.increment;
		var offsetTop = el.offsetHeight + el.scrollTop;
		if (offsetTop == el.scrollHeight && (!instance.ready.get() || instance.posts().count() >= instance.limit.get())) {
			instance.limit.set(limit);
		}
	}
});

Template.evaluations.helpers({
	getEvaluatesData: function() {
		var user = this
		var values = [];
		_.each(user.profile.totalEvaluates.totals, function(value, label) {
			var obj = {};
			obj.label = label;
			obj.value = value;
			values.push(obj);
		});
		return {
			values: values,
			user: user
		};
	},
	totalUsers: function() {
		return this.profile.totalEvaluates.totalUsers;
	}
});

Template.evaluationItem.events({
	'click [data-view]': function(e, t) {
		if (this.user._id == Meteor.userId()) {
			Bisia.Ui.toggleModal(e, 'viewEvaluationUserModal', this);
		}
	}
})