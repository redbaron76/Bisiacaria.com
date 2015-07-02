// Publish sessions
Meteor.publish('homepage', function() {
	// Meteor._sleepForMs(5 * 1000);
	var homePage = Homepage.find({}, { sort: { createdAt: -1 }, limit: 1 });

	// Get ids to load
	var userIds = _.uniq(Bisia.Homepage.authorIds);
	var eventIds = _.uniq(Bisia.Homepage.eventIds);
	var postIds = _.uniq(Bisia.Homepage.postIds);
	var placeIds = _.uniq(Bisia.Homepage.placeIds);

	// Bisia.log('publish', userIds, eventIds, postIds);

	// Get cursors
	var authors = Users.find({ '_id': { '$in': userIds }});
	var events = Events.find({ '_id': { '$in': eventIds }});
	var posts = Posts.find({ '_id': { '$in': postIds }});
	var places = Places.find({ '_id': { '$in': placeIds }});

	// Return cursors
	return [homePage, authors, events, posts, places];
});