// Posts
Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post, fieldNames, modifier) {
		var allowedFields = ['comments', 'likes', 'unlikes'];
		return _.indexOf(allowedFields, fieldNames[0]) >= 0;
	},
	remove: function(userId, post) { return Bisia.User.ownsDocument(userId, post); }
});

/*Posts.deny({
	// User is blocked
	update: function() { }
});*/