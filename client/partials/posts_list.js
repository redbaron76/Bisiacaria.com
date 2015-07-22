Template.postsList.onCreated(function() {

	// set template instance
	var instance = this;

	instance.increment = 20;

	// initialize the reactive variables
	instance.loaded = new ReactiveVar(0);
	instance.limit = new ReactiveVar(instance.increment);
	instance.ready = new ReactiveVar(false);
	instance.authorId = new ReactiveVar(this.data._id);

	// Set this instance to profile
	var profile = instance.parentTemplate();
	profile.posts = this;

	// console.log(instance.profile);

	// var options = instance.controller['findOptions']();
	// var query, options, authorId = instance.authorId.get();
	var query, options, authorId = profile.data.user._id;

	instance.autorun(function() {
		var limit = instance.limit.get();
		// authorId = instance.authorId.get();

		query = {
			'authorId': authorId
		};

		options = { 'sort': { 'dateTimePost': -1, 'createdAt': -1, '_id': -1 }, 'limit': limit };

		var subscription = Meteor.subscribe('userPosts', query, options);

		if (subscription.ready()) {
			instance.loaded.set(limit);
			instance.ready.set(true);
		} else {
			instance.ready.set(false);
		}
	});

	instance.posts = function() {
		if (authorId !== Meteor.userId()) {
			query = _.extend(query, {
				'dateTimePost': Bisia.Time.nowStart(Bisia.Time.beatTime.get())
			});
		}
		return Posts.find(query, options);
	}
});

Template.postsList.helpers({
	posts: function() {
		return Template.instance().posts();
	},
	pageReady: function() {
		return Template.instance().ready.get();
	},
	hasMoreLinks: function () {
		return !Template.instance().ready.get() || Template.instance().posts().count() >= Template.instance().limit.get();
	},
	detectFirstBlock: function() {
		var instance = Template.instance();
		var increment = instance.increment;
		var loaded = instance.loaded.get();
		// update the authorId to load posts from
		// instance.authorId.set(this._id);
		// Don't show spinner by default
		var postDisplay = true;
		// If we are on the first page...
		if (loaded == 0) {
			// postDisplay becomes reactive
			postDisplay = instance.ready.get();
		}
		// Set map owner
		//Bisia.Map.owner = this.usern || this.username;
		// Add postDisplay to this
		return _.extend(this, {
			postDisplay: postDisplay
		});
	}
});

Template.postsList.events({
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	}
});


Template.postArticle.onRendered(function() {
	// this.$('.emoticonize').emoticonize(Bisia.Config.emoticonizeSettings());
});

Template.postArticle.helpers({
	joinWithCounters: function() {
		var post = this;
		post = _.extend(post, {
			username: Bisia.getController('params')['username'],
			totLikes: post.likes.length,
			totUnlikes: post.unlikes.length,
			totComments: post.comments.length,
			action: 'post'
		});

		return post;

	},
	postedTime: function() {
		var dateTime = moment(this.dateTimePost);
		var now = moment(Bisia.Time.beatTime.get());
		var format = 'ddd DD MMMM YYYY [alle] HH:mm';
		var classTime = 'time';

		dt = dateTime.from(now);

		if(dateTime.isAfter(now)) {
			classTime = 'time future';
			format = '[uscirà] ' + format;
			dt = dateTime.format(format);
		}

		// past date
		if (dateTime.isBefore(now.subtract(24, 'hour'))) {
			dt = dateTime.format(format);
		}
		return {
			postTime: dt,
			classTime: classTime
		}
	},
	iLike: function() {
		return _.contains(this.likes, Meteor.userId()) ? 'me-too' : null;
	},
	iUnlike: function() {
		return _.contains(this.unlikes, Meteor.userId()) ? 'me-too' : null;
	}
});

Template.postArticle.events({
	'click .location': function(e, t) {
		e.preventDefault();
		var username = this.usern || this.username;
		var position = Bisia.User.augmentPosition(this.position, this.authorId, username, this.createdAt);
		Bisia.Map.triggerMapCreation('map-wrapper', false, position);
	},
	'click .do-comment': function(e, t) {
		e.preventDefault();
		var postObj = Bisia.Message.getCommentObject(this, 'commentPopup');
		Bisia.Ui.setReactive('popup', postObj);
	},
	'click .me-too': function(e, t) {
		Bisia.Ui.waitStart(e, 'auto');
		e.stopImmediatePropagation();
		var action = $(e.currentTarget).attr('class');
		if (action.indexOf('unlike') > -1) {
			Posts.update(this._id, { $pull: { 'unlikes': Meteor.userId() } });
		} else {
			Posts.update(this._id, { $pull: { 'likes': Meteor.userId() }, $inc: { 'likesRating': -1 } });
		}
		Bisia.Ui.waitStop();
	},
	'click .do-like': function(e, t) {
		// e.preventDefault();
		Bisia.Ui.waitStart(e, 'auto');
		if ( ! Bisia.User.isBlocked(this.authorId)) {
			var result = Posts.update(this._id, { $addToSet: { 'likes': Meteor.userId() }, $inc: { 'likesRating': 1 } });
			if (result) {
				// remove from unlikes
				Posts.update(this._id, { $pull: { 'unlikes': Meteor.userId() } });
				Meteor.call('likeUnlike', 'note', {
					actionId: this._id,
					actionKey: 'like',
					targetId: this.authorId,
					userId: Meteor.userId(),
					message: Bisia.Notification.noteMsg('like', {category: this.category}, false)
				}, function(error, success) {
					Bisia.Ui.waitStop();
				});
			}
		}
	},
	'click .do-unlike': function(e, t) {
		// e.preventDefault();
		Bisia.Ui.waitStart(e, 'auto');
		if ( ! Bisia.User.isBlocked(this.authorId)) {
			var result = Posts.update(this._id, { $addToSet: { 'unlikes': Meteor.userId() }, $inc: { 'likesRating': -1 } });
			if (result) {
				// remove from likes
				Posts.update(this._id, { $pull: { 'likes': Meteor.userId() } });
				Meteor.call('likeUnlike', 'note', {
					actionId: this._id,
					actionKey: 'unlike',
					targetId: this.authorId,
					userId: Meteor.userId(),
					message: Bisia.Notification.noteMsg('unlike', {category: this.category}, false)
				}, function(error, success) {
					Bisia.Ui.waitStop();
				});
			}
		}
	}
});