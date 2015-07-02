// Users Methods
Meteor.methods({
	// Perform hearthBeat server side
	hearthBeat: function(firstTime) {
		if (this.userId) {
			var now = new Date();

			var setObj = {
				'profile.online': true
			};

			if (firstTime) {
				setObj['profile.loginSince'] = now;
			}
			Users.update({ '_id': this.userId }, { '$set': setObj });
			Sessions.upsert({ 'userId': this.userId	}, { '$set': { 'loginCheck': now } });

			// Remove expired positions
			Users.update({
				'_id': this.userId,
				'profile.position': { '$exists': true },
				'profile.position.createdAt': { '$lt': Bisia.Time.timeAgo(120 * 60 * 1000) } // older than 2h
			}, {
				'$unset': {
					'loc': '',
					'profile.position': ''
				}
			});

			Bisia.Time.serverTime = now;
			return now;
		}
	}
});