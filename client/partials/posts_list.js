Template.postsList.onCreated(function() {

	// set template instance
	var instance = this;

	instance.increment = 20;

	// initialize the reactive variables
	instance.loaded = new ReactiveVar(0);
	instance.limit = new ReactiveVar(instance.increment);
	instance.ready = new ReactiveVar(false);
	instance.authorId = new ReactiveVar(this.data._id);

	// var options = instance.controller['findOptions']();
	var query, options, authorId = instance.authorId.get();

	instance.autorun(function() {
		var limit = instance.limit.get();
		authorId = instance.authorId.get();

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
		instance.authorId.set(this._id);
		// Don't show spinner by default
		var postDisplay = true;
		// If we are on the first page...
		if (loaded == 0) {
			// postDisplay becomes reactive
			postDisplay = instance.ready.get();
		}
		// Set map owner
		Bisia.Map.owner = this.username;
		// Add postDisplay to this
		return _.extend(this, {
			postDisplay: postDisplay
		});
	},
	joinWithCounters: function() {
		var post = this;
		post = _.extend(post, {
			username: Bisia.getController('params')['username'],
			totLikes: post.likes.length,
			totUnlikes: post.unlikes.length,
			totComments: post.comments.length
		});

		return post;

	},
});

Template.postsList.events({
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'click .load-more': function(e, instance) {
		e.preventDefault();
		var limit = instance.limit.get();
		limit += instance.increment;
		instance.limit.set(limit);
	}
});




Template.postArticle.helpers({
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
	}
});

Template.postArticle.events({
	'click .location': function(e, t) {
		e.preventDefault();
		Bisia.Map.triggerMapCreation('map-wrapper', false, this.position);
	},
	'click .do-comment': function(e, t) {
		e.preventDefault();
		var postObj = Bisia.Message.getCommentObject(this, 'commentPopup');
		Bisia.Ui.setReactive('popup', postObj);
	},
	'click .do-like': function(e, t) {
		e.preventDefault();
		if ( ! Bisia.User.isBlocked(this.authorId)) {
			var result = Posts.update(this._id, { $addToSet: { 'likes': Meteor.userId() } });
			if (result) {
				// remove from unlikes
				Posts.update(this._id, { $pull: { 'unlikes': Meteor.userId() } });
				Bisia.Notification.emit('note', {
					actionId: this._id,
					actionKey: 'like',
					targetId: this.authorId,
					userId: Meteor.userId(),
					message: Bisia.Notification.noteMsg('like', {category: this.category}, false)
				});
			}
		}
	},
	'click .do-unlike': function(e, t) {
		e.preventDefault();
		if ( ! Bisia.User.isBlocked(this.authorId)) {
			var result = Posts.update(this._id, { $addToSet: { 'unlikes': Meteor.userId() } });
			if (result) {
				// remove from likes
				Posts.update(this._id, { $pull: { 'likes': Meteor.userId() } });
				Bisia.Notification.emit('note', {
					actionId: this._id,
					actionKey: 'unlike',
					targetId: this.authorId,
					userId: Meteor.userId(),
					message: Bisia.Notification.noteMsg('unlike', {category: this.category}, false)
				});
			}
		}
	}
});