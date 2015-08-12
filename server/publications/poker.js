Meteor.publish('pokerCurrentStatus', function() {

	// Signup if not
	var pokerPlayer = Pokerplayers.findOne({ 'playerId': this.userId });
	if (! pokerPlayer) {
		Pokerplayers.insert({
			playerId: this.userId,
			credit: Meteor.settings.bispoker.dailyCredit,
			createdAt: Bisia.Time.now()
		});
	}

	// Counters todayPoint totalPoint
	// Counter position calcolata in actionChange Game ad ogni conclusione punto e salvata in Pokerplayers
	// Counts.publish(this, 'weekTotal', Pokerhands.find({ 'playerId': this.userId, 'createdAt': Bisia.Poker.weekGame() }), { countFromField: 'win', noReady: true });
	Counts.publish(this, 'weekTotal', Pokerplayers.find({ 'playerId': this.userId }), { countFromField: 'points', noReady: true });
	Counts.publish(this, 'todayTotal', Pokerhands.find({ 'playerId': this.userId, 'createdAt': Bisia.Poker.dayGame() }), { countFromField: 'win', noReady: true });

	// Publish the user
	var user = Users.find({ '_id': this.userId });
	// Publish today hands
	var hands = Pokerhands.find({ 'playerId': this.userId, 'createdAt': Bisia.Poker.weekGame() });
	// Publish players
	var players = Pokerplayers.find();
	// Meteor._sleepForMs(2000);
	return [user, hands, players];
});

Meteor.publish('pokerCurrentRanking', function(query, options) {
	check(query, Object);
	check(options, Object);

	// Publish players
	var players = Pokerplayers.find(query, options);

	if (players.count() > 0) {
		// map the authorIds
		var userIds = players.map(function(doc) { return doc['playerId'] });
		var authors = Users.find({ '_id': { '$in': userIds }});

		// return cursors
		return [players, authors];
	}
	// Meteor._sleepForMs(2000);
	return players;
});

Meteor.publish('pokerLastWinners', function() {
	// get current year
	var year = parseInt(moment().format('YYYY'));
	var winners = Pokerwinners.find({ 'gameYear': year });
	if (winners.count() > 0) {
		var userIds = [];
		winners.forEach(function(winner) {
			_.each(winner.winners, function(value, index) {
				userIds.push(value['winnerId']);
			});
		});
		var players = Users.find({ '_id': { '$in': userIds }});

		return [winners, players];
	}

	return winners;
});

Meteor.publish('playerHands', function(query, options) {
	check(query, Object);
	check(options, Object);

	console.log(query);

	// get poker hands
	return Pokerhands.find(query, options);
});