// Publish sessions
Meteor.publish('nearPlaces', function(lat, lng, distance) {
	// Meteor._sleepForMs(5 * 1000);
	var max = distance || 500;
	var places = Places.find({
		'loc': {
			'$near': {
				'$geometry': { 'type': 'Point', 'coordinates': [ parseFloat(lat), parseFloat(lng) ] },
				'$minDistance': 0,
				'$maxDistance': max
			}
		}
	}, { 'fields': { 'joiners': 0, 'keywords': 0 }, 'limit': 20 });
	// console.log(places.count());
	// Return cursors
	return places;
});

// Publish people around you
// Subscribed by recordLastPosition - user.js
Meteor.publish('nearYou', function(position, distance) {
	check(position, Object);
	// build query
	var nearYouQuery = {
		'_id': { '$ne': this.userId },
		'profile.position': { '$exists': true },
		'loc': {
			'$near': {
				'$geometry': {
					'type': 'Point',
					'coordinates': [ parseFloat(position.lat), parseFloat(position.lng) ]
				},
				'$minDistance': 0,
				'$maxDistance': 1000
			}
		}
	};

	var users = Users.find(nearYouQuery);
	// console.log('nearYou register', this.userId, users.count());
	// Count hom many near to you
	// Counts.publish(this, 'nearYou', users, { noReady: false });
	// return cursor
	return users;
});