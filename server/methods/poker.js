Meteor.methods({
	actionPlayGame: function(handObj) {
		check(handObj, {
			bet: Number,
			play: String
		});

		var userId = Meteor.userId();
		var handResp = {
			// todayTotal: null,
			// weekTotal: null,
			// weekPosition: null,
			// deck: [null, null, null, null, null],
			// winMessage: null,
			// statusMessage: null,
			// statusPlay: 'gioca',
		};

		// decrement credit from Pokerplayers
		Pokerplayers.update({ 'playerId': userId }, { '$inc': { 'credit': handObj.bet * -1 } });
		// generate a new deck
		handResp.deck = Bisia.Poker.generateNewDeck();
		// detect point and set winMessage
		var point = Bisia.Poker.detectHandPoint(handResp.deck, handObj.bet, false);
		handResp.winMessage = point.message;
		// change status of the play
		handResp.statusMessage = 'Seleziona le carte da scartare';
		handResp.statusPlay = 'cambia';

		// insert new deck in Pokerhands
		var handId = Pokerhands.insert({
			playerId: userId,
			playDeck: handResp.deck,
			bet: handObj.bet,
			win: 0,
			createdAt: new Date,
			status: 'running',
		});

		// save handId
		handResp.handId = handId;


		return handResp;
	},
	actionChangeGame: function(handObj) {
		check(handObj, {
			bet: Number,
			play: String,
			cards: Object,
			handId: String,
			firstHand: Array
		});

		// Get card index to keep
		var cardsToKeep = _.keys(handObj.cards);
		for(var i = 0; i < cardsToKeep.length; i ++) {
			cardsToKeep[i] = parseInt(cardsToKeep[i].replace(/card/g, ''));
		}

		var userId = Meteor.userId();
		var handResp = {};

		// generate a change deck
		handResp.deck = Bisia.Poker.generateChangeDeck(handObj.firstHand, cardsToKeep);
		// detect point and set winMessage
		var point = Bisia.Poker.detectHandPoint(handResp.deck, handObj.bet, true);
		handResp.winMessage = point.message;

		handResp.statusMessage = 'Hai vinto <strong>' + point.win + '</strong> punti!';
		handResp.statusPlay = 'gioca';

		// update and close poker hand
		if (handObj.handId) {
			// close hand
			Pokerhands.update({
				'_id': handObj.handId,
				'playerId': userId
			}, {
				'$set': {
					changeDeck: handResp.deck,
					win: point.win,
					closedAt: new Date,
					status: 'finish'
				}
			});
			// increment total points in the week
			Pokerplayers.update({ 'playerId': userId }, { '$inc': { 'points': point.win }});
		} else {
			throw new Meteor.Error("invalid-hand", "Id della giocata non presente");
		}

		// Calcola posizione in base al punteggio

		return handResp;
	},
	getRankingPosition: function(points) {
		var rankings = {};
		if (points > 0) {
			var players = Pokerplayers.find({ 'points': { '$gt': points }}, { 'sort': { 'points': -1 } });
			players.forEach(function(player) {
				if (!rankings[player.points]) {
					rankings[player.points] = 1;
				} else {
					rankings[player.points] ++;
				}
			});
			return _.keys(rankings).length + 1;
		}
		return '-';
	}
});