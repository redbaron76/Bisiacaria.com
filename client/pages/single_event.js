Template.singleEvent.onRendered(function() {
	Meteor.call('trackVisitEvent', this.data.event._id);
	this.$('.autosize').textareaAutoSize();
});

Template.joinUser.onRendered(function() {
	if (this.$('.autosize').length > 0) {
		this.$('.autosize').textareaAutoSize();
		// this.$('.emoticonize').emoticonize(Bisia.Config.emoticonizeSettings());
	}
});

Template.singleEvent.helpers({
	formatDate: function(date) {
		var m = moment(date);
		return _.extend(this, {
			weekday: m.format('dddd'),
			number: m.format('DD'),
			month: m.format('MMMM'),
			time: m.format('HH:mm')
		});
	},
	/*counters: function() {
		return {
			visitorsCount: this.visitors ? this.visitors.length: 0,
			joinersCount: this.joiners ? this.joiners.length : 0
		}
	},*/
	youJoinThis: function() {
		var joinersIds = _.pluck(this.joiners, 'authorId');
		return (joinersIds && _.indexOf(joinersIds, Meteor.userId()) >= 0) ? 'checked' : '';
	},
	backJoiners: function() {
		return { joiners: this.joiners.reverse() };
	},
	commentWithAuthor: function() {
		var eventId = Bisia.getController('params')['_id'];
		var author = Users.findOne({ '_id': this.authorId }, { 'fields': {
			'username': 1,
			'profile.city': 1,
			'profile.gender': 1,
			'profile.status': 1,
			'profile.avatar': 1,
			'profile.online': 1
		}});

		var obj = _.extend(_.omit(author, '_id'), {
			authorId: this.authorId,
			eventId: eventId,
			action: 'commentEvent'
		});

		return _.extend(this, obj);
	}
});

Template.singleEvent.events({
	'click .toggle-info': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleClass('flip', '.flip-container', t);
	},
	'click .location': function(e, t) {
		e.preventDefault();
		if (!_.isEmpty(this.position)) {
			var position = Bisia.User.augmentPosition(this.position, this._id, this.titleEvent, this.dateTimeEvent, true);
			Bisia.Map.triggerMapCreation('map-wrapper', false, this.position);
		}
	},
	'change #toggle-join': function(e, t) {
		e.preventDefault();
		Meteor.call('joinEvent', {
			eventId: t.data.event._id,
			eventTitle: t.data.event.titleEvent,
			eventLocation: t.data.event.locationEvent,
			eventDateTime: t.data.event.dateTimeEvent,
			authorId: t.data.event.authorId,
			check: e.target.checked
		});
	},
	'submit #comment-event-form': function(e, t) {
		e.preventDefault();
		$textarea = $(e.target).find('#comment-text');
		var text = $textarea.val();
		if (Bisia.Message.sendCommentEvent(t.data.event._id, text)) {
			$textarea.val('').removeAttr('style');
		}
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtOffset(e, '#helpbars', 248, 'top-show');
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');
	}
});