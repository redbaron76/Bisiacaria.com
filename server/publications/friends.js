// Publish friends
Meteor.publish('friendsList', function(query, options, authorId) {
	// check(this.userId, String);
	check(authorId, String);
	check(query, Object);
	check(options, {
		sort: Object,
		limit: Number
	});
	// Get the subject (opposite of authorId)
	var target = Bisia.inverseAuthor(authorId);
	// Build owner subject (the one to get from the query)
	var owner = {};
	owner[target] = this.userId;
	// Extend query object
	query = _.extend(query, owner);
	// get cursors
	var friends = Friends.find(query, options);

	if (friends.count() > 0) {
		// map the authorIds
		var userIds = friends.map(function(doc) { return doc[authorId] });
		var authors = Users.find({ '_id': { '$in': userIds }});

		// Meteor._sleepForMs(1000);
		// return cursors
		return [friends, authors];
	}
});

Meteor.publish('userFriendsList', function(query, options) {
	check(query, Object);
	check(options, Object);

	// get friends
	var friends = Friends.find(query, options);
	var authorId = Bisia.inverseAuthor(_.keys(query)[0]);
	// console.log(query, options);
	if (friends.count() > 0) {
		// map the authorIds
		var userIds = friends.map(function(doc) { return doc[authorId] });
		var authors = Users.find({ '_id': { '$in': userIds }});
		// Meteor._sleepForMs(10000);
		// return cursors
		return [friends, authors];
	}
});

// Publish your friends
Meteor.publish('myFriends', function() {
	// check(this.userId, String);

	// Meteor._sleepForMs(500);

	// Get friends cursor
	var friends = Friends.find({ 'targetId': this.userId });

	if (friends.count() > 0) {
		// map the authorIds
		var userIds = friends.map(function(doc) { return doc['userId'] });
		var authors = Users.find({ '_id': { '$in': userIds }});
		// return cursors
		return [friends, authors];
	}
});

// Subscribe to following posts
Meteor.publish('friendPosts', function(query, options) {
	check(query, Object);
	check(options, {
		sort: Object,
		limit: Number
	});

	//Meteor._sleepForMs(500000);
	if (this.userId) {
		var user = Users.findOne({ '_id': this.userId }, { fields: {following: 1} });
		if (user.following) {
			query = _.extend(query, {
				'authorId': { '$in': user.following }
			});
		}

		var posts = Posts.find(query, options);

		if (posts.count() > 0) {
			// map the authorIds
			var userIds = posts.map(function(doc) { return doc['authorId'] });
			// add me
			userIds.push(this.userId);
			userIds = _.uniq(userIds);
			// get users authors
			var authors = Users.find({ '_id': { '$in': userIds }});
			// return cursors
			return [posts, authors];
		}
	}

});