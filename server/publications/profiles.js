// Publish a user profile in router.js
Meteor.publish('userProfile', function(username) {
	check(username, String);

	// Meteor._sleepForMs(1000);
	var user = Users.find({ 'username': username }, { 'fields': { 'emails': false, 'services': false } });
	var userId = _.pluck(user.fetch(), '_id')[0];

	Counts.publish(this, 'totFriends', Friends.find({ 'userId': userId }), { noReady: true });

	// Return cursor
	return user;
});

// Publish a user profile in router.js
Meteor.publish('userPosts', function(query, options) {
	check(query, Object);
	check(options, {
		sort: Object,
		limit: Number
	});

	var posts = Posts.find(query, options);

	if (posts.count() > 0) {
		// map the authorIds
		var joiners = posts.map(function(doc) {
			var commentAuthors = _.map(doc['comments'], function(value, key) {
				return value['authorId'];
			});
			return _.union(commentAuthors, doc['likes'], doc['unlikes']);
		});

		// get authors of likes and comments
		var authors = Users.find({ '_id': { '$in': joiners[0] }});

		return [posts, authors];
	}

	return posts;
});

// Publish a single post
Meteor.publish('singlePost', function(postId) {
	check(postId, String);

	// Meteor._sleepForMs(500);

	// Get the post
	var post = Posts.find({ '_id': postId });

	// map the authorIds
	var userIds = post.map(function(doc) {
		var commentAuthors = _.map(doc['comments'], function(value, key) {
			return value['authorId'];
		});
		return _.union(commentAuthors, doc['likes'], doc['unlikes']);
	});

	var authorId = post.fetch()[0]['authorId'];

	// Get author's followers
	var followers = _.pick(Users.findOne({ '_id': authorId}), 'friends');
	if (followers) followers = followers.friends;

	// Add authorId to userIds to load
	userIds[0].push(authorId);

	// Unite joiners + followers and set unique
	var userIds = _.unique(_.union(userIds[0], followers));

	// get authors of likes and comments
	var authors = Users.find({ '_id': { '$in': userIds }});

	// Return cursor
	return [post, authors];
});