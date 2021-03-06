// Publish a user profile in router.js
Meteor.publish('userProfile', function(username) {
	check(username, String);

	// Meteor._sleepForMs(1000);
	// var user = Users.find({ 'username': username }, { 'fields': { 'emails': false, 'services': false } });
	var user = Users.find({ 'username': { '$regex': '^'+username+'$', '$options': 'i' }}, { 'fields': { 'emails': false, 'services': false } });
	if (user.count() > 0) {
		var targetId = user.fetch()[0]._id;
		var myEvaluations = Evaluations.find({'targetId': targetId, 'userId': this.userId});
		var myVotes = Votes.find({ 'targetId': targetId });
		return [user, myEvaluations, myVotes];
	}
	return user;
});

// Publish a user profile in router.js
Meteor.publish('userPosts', function(query, options) {
	check(query, Object);
	check(options, {
		sort: Object,
		limit: Number
	});

	// Meteor._sleepForMs(500000);

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

	if (post.count() > 0) {
		// map the authorIds
		var userIds = post.map(function(doc) {
			var commentAuthors = _.map(doc['comments'], function(value, key) {
				return value['authorId'];
			});
			return _.union(commentAuthors, doc['likes'], doc['unlikes']);
		});

		var authorId = post.fetch()[0]['authorId'];
		var authors = {};

		if (authorId) {
			// Get author's followers
			var user = _.pick(Users.findOne({ '_id': authorId}), 'followers');
			if (user) followers = user.followers;

			// Add authorId to userIds to load
			userIds[0].push(authorId);

			// Unite joiners + followers and set unique
			var userIds = _.unique(_.union(userIds[0], followers));

			// get authors of likes and comments
			var authors = Users.find({ '_id': { '$in': userIds }});
		}

		// Return cursor
		return [post, authors];
	}
	return posts;
});

// Publish evaluations for target user
Meteor.publish('userEvaluationList', function(query, options) {
	check(query, Object);
	check(options, Object);

	// get evaluations
	var evaluations = Evaluations.find(query, options);
	var authorId = Bisia.inverseAuthor(_.keys(query)[0]);
	// console.log(query, options);
	if (evaluations.count() > 0) {
		// map the authorIds
		var userIds = evaluations.map(function(doc) { return doc[authorId] });
		var authors = Users.find({ '_id': { '$in': userIds }});
		// Meteor._sleepForMs(10000);
		// return cursors
		return [evaluations, authors];
	}
	return evaluations;
});