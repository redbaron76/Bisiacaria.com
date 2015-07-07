Template.singlePost.onRendered(function() {
	this.$('.autosize').textareaAutoSize();
	// this.$('.emoticonize').emoticonize(Bisia.Config.emoticonizeSettings());
});

Template.singlePost.helpers({
	postWithAuthor: function() {
		if (this.post) {
			var author = Users.findOne({ '_id': this.post.authorId }, { 'fields': { 'username': true, 'profile': true, 'online': true } });
			var post = _.extend(this.post, _.omit(author, '_id'));
			return _.extend(post, {
				totLikes: post.likes.length,
				totUnlikes: post.unlikes.length,
				totComments: post.comments.length,
				delete: 'post'
			});
		}
	},
	commentWithAuthor: function() {
		var postId = Bisia.getController('params')['_id'];
		if (this.authorId) {
			var author = Users.findOne({ '_id': this.authorId }, { 'fields': { 'username': true, 'profile': true, 'online': true } });
			var obj = _.extend(_.omit(author, '_id'), {
				authorId: this.authorId,
				postId: postId,
				delete: 'comment'
			});
			return _.extend(this, obj);
		}
	},
	iLike: function() {
		return _.contains(this.likes, Meteor.userId()) ? 'me-too' : null;
	},
	iUnlike: function() {
		return _.contains(this.unlikes, Meteor.userId()) ? 'me-too' : null;
	}
});

Template.singlePost.events({
	'click .location': function(e, t) {
		e.preventDefault();
		var username = this.usern || this.username;
		var position = Bisia.User.augmentPosition(this.position, this.authorId, username, this.createdAt);
		Bisia.Map.triggerMapCreation('map-wrapper', false, position);
	},
	'submit #comment-post-form': function(e, t) {
		e.preventDefault();
		$textarea = $(e.target).find('#comment-text');
		var text = $textarea.val();
		var commentObj = Bisia.Message.getCommentObject(this);
		if (Bisia.Message.sendComment(text, commentObj)) {
			$textarea.val('').removeAttr('style');
			Bisia.Ui.goBottom();
		}
	},
	'click #like-this': function(e, t) {
		// e.preventDefault();
		Bisia.Ui.waitStart(e);
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
	'click #unlike-this': function(e, t) {
		// e.preventDefault();
		Bisia.Ui.waitStart(e);
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
	},
	'click .me-too': function(e, t) {
		Bisia.Ui.waitStart(e);
		console.log($(e.currentTarget).attr('id'));
		Meteor.call('resetLikeUnlike', $(e.currentTarget).attr('id'), function(error, success) {
			//Bisia.Ui.waitStop();
		});
	},
	'click #info-this': function(e, t) {
		e.preventDefault();
		var likers = Users.find({ '_id': { '$in': this.likes }}, {'fields': {'username': true, 'profile': true}});
		var unlikers = Users.find({ '_id': { '$in': this.unlikes }}, {'fields': {'username': true, 'profile': true}});
		Bisia.Ui.setReactive('info', {
			template: 'likeUnlikeList',
			hasLikers: likers.count(),
			likers: likers,
			hasUnlikers: unlikers.count(),
			unlikers: unlikers,
			noOpinion: !likers.count() > 0 && !unlikers.count() > 0
		});
	},
	'click #share-this': function(e, t) {
		e.preventDefault();
		Bisia.Ui.toggleModal(e, 'sharePostModal', t.data);
	},
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtOffset(e, '#profile', 468, 'top-show');
		Bisia.Ui.toggleAtBottom(e, '#profile', 'bottom-show');
	}
});