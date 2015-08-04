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
	Counts.publish(this, 'weekTotal', Pokerhands.find({ 'playerId': this.userId, 'closedAt': Bisia.Poker.weekGame() }), { countFromField: 'win', noReady: true });
	Counts.publish(this, 'todayTotal', Pokerhands.find({ 'playerId': this.userId, 'closedAt': Bisia.Poker.dayGame() }), { countFromField: 'win', noReady: true });

	// Publish the user
	var user = Users.find({ '_id': this.userId });
	// Publish today hands
	var hands = Pokerhands.find({ 'playerId': this.userId, 'createdAt': Bisia.Poker.weekGame() });

	return [user, hands];
});