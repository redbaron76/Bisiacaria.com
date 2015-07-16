Template.friendPosts.onCreated(function() {
	Bisia.Notification.resetNotify('note', 'post');
})

Template.friendPosts.helpers({
	getPost: function(postId) {
		var post = Posts.findOne(postId);
		if (post) {
			var user = Users.findOne({ '_id': post.authorId }, { 'fields': {
				'username': 1,
				'profile.city': 1,
				'profile.gender': 1,
				'profile.status': 1,
				'profile.avatar': 1,
				'profile.online': 1,
				'profile.birthday': 1
			}});
			post.showHeader = true;
			post.usern = user.username;
			post.profile = user.profile;
			return post;
		}
	},
	detectFirstPage: function() {
		var increment = Bisia.getController('increment');
		var limit = Bisia.getController('params')['pageLimit'];
		// Don't show spinner by default
		var pageDisplay = true;
		// If we are on the first page...
		if (!limit || limit == increment) {
			// pageDisplay becomes reactive
			pageDisplay = this.pageReady;
		}
		// Add pageDisplay to this
		return _.extend(this, {
			pageDisplay: pageDisplay
		});
	}
});

Template.friendPosts.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');
	}
});