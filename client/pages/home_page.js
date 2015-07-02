Template.homePage.helpers({
	getEvent: function(eventId) {
		return Events.findOne(eventId);
	},
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
	getPosition: function(placeId) {
		return Places.findOne(placeId);
	}
});

Template.homePage.events({
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '.list', 'bottom-show');
	}
});

Template.mostPlaceList.events({
	'click [data-action=open]': function(e, t) {
		e.preventDefault();
		var position = {
			lat: this.lat,
			lng: this.lng,
			location: this.location || '',
			tag: this.tag,
			justName: true
		};
		Bisia.Map.triggerMapCreation('map-wrapper', false, position, false);
	},
})