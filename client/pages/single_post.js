Template.singlePost.onRendered(function() {
	this.$('.autosize').textareaAutoSize();
});

Template.singlePost.helpers({
	postWithAuthor: function() {
		var author = Users.findOne({ '_id': this.post.authorId }, { 'fields': { 'username': true, 'profile': true, 'online': true } });
		var post = _.extend(this.post, _.omit(author, '_id'));
		return _.extend(post, {
			totLikes: post.likes.length,
			totUnlikes: post.unlikes.length,
			totComments: post.comments.length
		});
	},
	commentWithAuthor: function() {
		var author = Users.findOne({ '_id': this.authorId }, { 'fields': { 'username': true, 'profile': true, 'online': true } });
		return _.extend(this, author);
	}
});

Template.singlePost.events({
	'click .location': function(e, t) {
		e.preventDefault();
		Bisia.Map.triggerMapCreation('map-wrapper', false, this.position);
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
	'click #unlike-this': function(e, t) {
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