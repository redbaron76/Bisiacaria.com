// Describe homepage overview
// every 15 minutes

// Headers degli eventi di oggi (se presenti)
// 5 Blog in evidenza (più recenti e con più commenti)
// 5 più votati di ieri
// 5 più visitati di ieri
// Ultimi 10 iscritti


Bisia.Homepage = {

	mm15: 15 * 60 * 1000,

	gg7: 7 * 24 * 60 * 60 * 1000,

	authorIds: [],
	eventIds: [],
	postIds: [],
	placeIds: [],

	init: function() {

	},

	/**
	 * Build the HomePage object
	 * @return {Void}
	 */
	build: function() {
		// Reset authorIds
		this.authorIds = [];
		this.eventIds = [];
		this.postIds = [];
		// Get partials data
		var todayEvents = this.pickTodayEvents();
		var tomorrowEvents = this.pickTomorrowEvents();
		var blogSelection = this.pickBlogPosts();
		var mostVoted = this.pickMostVoted();
		var mostVisited = this.pickMostVisited();
		var lastSignupUsers = this.pickLastSignupUsers();
		var lastGeoTags = this.pickLastGeoTags();
		var mostPlaces = this.pickMostPlaces();

		var hpObj = {
			createdAt: new Date(),
			todayEvents: todayEvents,
			tomorrowEvents: tomorrowEvents,
			blogSelection: blogSelection,
			mostVoted: mostVoted,
			mostVisited: mostVisited,
			lastSignupUsers: lastSignupUsers,
			lastGeoTags: lastGeoTags,
			mostPlaces: mostPlaces
		};

		// Insert in collection
		Homepage.insert(hpObj);

		// Remove homepages older than 1 hour
		Homepage.remove({
			'createdAt': { '$lte': Bisia.Time.timeAgo(this.mm15 * 4) }
		});
	},

	pickTodayEvents: function() {
		var parent = this;
		var todayEvents = [];
		var events = Events.find({
			'dateTimeEvent': { '$gte': Bisia.Time.todayStart(), '$lte': Bisia.Time.todayEnd() }
		}, {
			'sort': { 'dateTimeEvent': 1, 'createdAt': 1, '_id': -1 }
		}).forEach(function(event) {
			parent.authorIds.push(event.authorId);
			parent.eventIds.push(event._id);
			todayEvents.push(event._id);
		});
		return todayEvents;
	},

	pickTomorrowEvents: function() {
		var parent = this;
		var tomorrowEvents = [];
		var events = Events.find({
			'dateTimeEvent': { '$gte': Bisia.Time.daysFutureStart(1), '$lte': Bisia.Time.daysFutureEnd(1) }
		}, {
			'sort': { 'dateTimeEvent': 1, 'createdAt': 1, '_id': -1 }
		}).forEach(function(event) {
			parent.authorIds.push(event.authorId);
			parent.eventIds.push(event._id);
			tomorrowEvents.push(event._id);
		});
		return tomorrowEvents;
	},

	pickBlogPosts: function() {
		var parent = this;
		var randomPosts = [];
		// Get most recent 20 posts
		var recentPosts = Posts.find({
			'text': { '$ne': null },
			'createdAt': { '$gt': Bisia.Time.timeAgo(this.mm15) },
			'dateTimePost': { '$lt': Bisia.Time.now() }
		}, {
			'limit': 20
		}).forEach(function(post) {
			parent.authorIds.push(post.authorId);
			randomPosts.push(post._id);
		});
		// Get most rated 20 posts between 1week ago and now - 15mins
		var ratedPosts = Posts.find({
			'text': { '$ne': null },
			'createdAt': {
				'$gt': Bisia.Time.daysAgoStart(7),
				'$lt': Bisia.Time.timeAgo(this.mm15)
			},
			'dateTimePost': { '$lt': Bisia.Time.now() },
			'likesRating': { '$gte': 0 }
		}, {
			'sort': { 'likesRating': -1, 'commentsCount': -1 },
			'limit': 20
		}).forEach(function(post) {
			parent.authorIds.push(post.authorId);
			randomPosts.push(post._id);
		});

		// Randomize pick
		var random = _.sample(randomPosts, 20);
		// set postIds as randoms
		this.postIds = random;
		// Bisia.log('random', random);
		return random;
	},

	pickMostVoted: function() {
		var parent = this;
		var totals = {};
		var users = [];
		var yesterdayVotes = Votes.find({
			'createdAt': {
				'$gte': Bisia.Time.daysAgoStart(1),
				'$lte': Bisia.Time.daysAgoEnd(1)
			},
		}).forEach(function(vote) {
			if (totals[vote.targetId]) {
				totals[vote.targetId] = totals[vote.targetId] + 1;
			} else {
				totals[vote.targetId] = 1;
			}
		});

		// Merges arrays together
		this.authorIds = _.union(this.authorIds, _.keys(totals));
		// Loop totals and create single objects
		_.each(totals, function(value, key) {
			users.push({
				userId: key,
				counter: value,
				singular: 'voto',
				plural: 'voti'
			});
		});
		return _.chain(users)
				.sortBy(function(user) {
					return user.counter;
				})
				.reverse()
				.first(5)
				.value();
	},

	pickMostVisited: function() {
		var parent = this;
		var totals = {};
		var users = [];
		var yesterdayVisits = Notifications.find({
			'action': 'visit',
			'createdAt': {
				'$gte': Bisia.Time.daysAgoStart(1),
				'$lte': Bisia.Time.daysAgoEnd(1)
			},
		}).forEach(function(visit) {
			if (totals[visit.targetId]) {
				totals[visit.targetId] = totals[visit.targetId] + 1;
			} else {
				totals[visit.targetId] = 1;
			}
		});
		// Merges arrays together
		this.authorIds = _.union(this.authorIds, _.keys(totals));
		// Loop totals and create single objects
		_.each(totals, function(value, key) {
			users.push({
				userId: key,
				counter: value,
				singular: 'visita',
				plural: 'visite'
			});
		});

		return _.chain(users)
				.sortBy(function(user) {
					return user.counter;
				})
				.reverse()
				.first(5)
				.value();
	},

	pickLastSignupUsers: function() {
		var parent = this;
		var users = [];
		var lastUsers = Users.find({
			'emails': { $elemMatch: { 'verified': true } }
		}, {
			'sort': { 'createdAt': -1 },
			'limit': 5
		}).forEach(function(user) {
			var obj = {};
			parent.authorIds.push(user._id);
			obj.userId = user._id;
			obj.createdAt = user.createdAt;
			users.push(obj);
		});
		return users;
	},

	pickLastGeoTags: function() {
		var parent = this;
		var geotags = [];
		var posts = Posts.find({
			'position.tag': { '$exists': true },
			'position.location': { '$exists': true },
			'createdAt': {
				'$gt': Bisia.Time.daysAgoStart(1),
				'$lt': Bisia.Time.timeAgo(this.mm15)
			},
			'dateTimePost': { '$lt': Bisia.Time.now() },
			'likesRating': { '$gte': 0 }
		}, {
			'sort': { 'createdAt': -1 },
			'limit': 25
		}).fetch();

		var distPosts = _.uniq(posts, true, function(distinct) { return distinct.authorId });
		var lastGeoTags = [];

		_.each(_.first(distPosts, 5), function(post) {
			parent.authorIds.push(post.authorId);
			parent.postIds.push(post._id);
			lastGeoTags.push(post._id);
		});

		return lastGeoTags;
	},

	pickMostPlaces: function() {
		var parent = this;
		var mostPlaces = [];
		var places = Places.find({
			'tag': { '$exists': true },
			'joiners': {
				'$exists': true,
				'$elemMatch': {
					'createdAt': { '$gt': Bisia.Time.daysAgoStart(2) }
				}
			}
		}, {
			'fields': { 'joiners': 0 },
			'sort': { 'joinersCount': -1, 'joiners.$.createdAt': -1 },
			'limit': 100
		}).fetch();

		var distPlaces = _.uniq(places, true, function(distinct) { return distinct.tag })

		_.each(_.first(distPlaces, 7), function (place) {
			parent.placeIds.push(place._id);
			mostPlaces.push(place._id);
		});

		return mostPlaces;
	}

}