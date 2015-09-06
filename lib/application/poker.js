
// Poker

Bisia.Poker = {

	/**
	 * [config description]
	 * @type {[type]}
	 */
	config: Meteor.settings.bispoker,

	/**
	 * Bet per hand
	 * @type {Int}
	 */
	currentHandBet: null,

	/**
	 * discard cards for each hand
	 * do not show again in the hand
	 * @type {Array}
	 */
	discardCards: [],

	/**
	 * First deck
	 * @type {Array}
	 */
	firstHand: [],

	/**
	 * the Hand Id
	 * @type {String}
	 */
	handId: null,

	/**
	 * Reactive var for DailyCreditLeft
	 * @type {Object}
	 */
	rankingPosition: new ReactiveVar(0),

	/**
	 * [ranking description]
	 * @type {Object}
	 */
	ranking: {},

	/**
	 * [actionPlayGame description]
	 * @param  {[type]} handObj  [description]
	 * @param  {[type]} instance [description]
	 * @return {[type]}          [description]
	 */
	actionPlayGame: function(handObj, instance) {
		var parent = this;
		var obj = this.mapCards(handObj);
		obj.bet = parseInt(handObj.bet);
		parent.currentHandBet = obj.bet;
		Meteor.call('actionPlayGame', obj, function(error, handResp) {
			// save first hand
			parent.firstHand = handResp.deck;
			// set handId
			parent.handId = handResp.handId;
			// get new cards deck
			parent.buildNewDeck(handResp.deck, instance);
			// change status message and status play button
			instance.statusMessage.set(handResp.statusMessage);
			instance.statusPlay.set(handResp.statusPlay);
			// trigger winning message
			Meteor.setTimeout(function() {
				instance.winMessage.set(handResp.winMessage);
			}, 300);
			// disable click on bet buttons
			$('.button-bet label').css('pointer-events', 'none');
			// waitStop;
			Bisia.Ui.waitStop();
		});
	},

	/**
	 * [buildNewDeck description]
	 * @param  {[type]} deckArr  [description]
	 * @param  {[type]} instance [description]
	 * @return {[type]}          [description]
	 */
	buildNewDeck: function(deckArr, instance) {
		if (deckArr.length == 5) {
			_.each(deckArr, function(value, i) {
				instance['card' + i + 'value'].set(value);
				instance['card' + i + 'status'].set(true);
			});
			Meteor.setTimeout(function() {
				$('.card').addClass('open');
			}, 100);
		}
	},

	/**
	 * [actionChangeGame description]
	 * @param  {[type]} handObj  [description]
	 * @param  {[type]} instance [description]
	 * @return {[type]}          [description]
	 */
	actionChangeGame: function(handObj, instance) {
		var parent = this;
		handObj.handId = parent.handId;
		handObj.firstHand = parent.firstHand;
		handObj.bet = parseInt(parent.currentHandBet);
		Meteor.call('actionChangeGame', handObj, function(error, handResp) {
			// get new cards deck
			// console.log('changeDeck', handResp.deck);
			parent.buildChangeDeck(handResp.deck, instance);
			// change status message and status play button
			instance.statusPlay.set(handResp.statusPlay);
			Meteor.setTimeout(function() {
				instance.statusMessage.set(handResp.statusMessage);
				instance.winMessage.set(handResp.winMessage);
			}, 500);
			Bisia.Ui.waitStop();
		});
	},

	/**
	 * [buildChangeDeck description]
	 * @param  {[type]} deckArr  [description]
	 * @param  {[type]} instance [description]
	 * @return {[type]}          [description]
	 */
	buildChangeDeck: function(deckArr, instance) {
		if (deckArr.length == 5) {
			_.each(deckArr, function(value, i) {
				instance['card' + i + 'value'].set(value);
				instance['card' + i + 'status'].set(true);
				Meteor.setTimeout(function() {
					$('.card[data-control=card' + i + ']').addClass('open');
				}, 100);
			});
			Meteor.setTimeout(function() {
				$('.card[data-control]').removeAttr('data-value');
			}, 100);
		}
	},

	/**
	 * [actionResetGame description]
	 * @param  {[type]} instance [description]
	 * @return {[type]}          [description]
	 */
	actionResetGame: function(instance) {
		this.firstHand = [];
		this.closeDeck(instance);
		instance.statusMessage.set('Punta per giocare');
		instance.statusPlay.set('apri');
		// disable play button
		$('#play').attr('disabled', true);
		instance.winMessage.set(null);
		// enable click on bet buttons
		$('.button-bet label').css('pointer-events', 'auto')
							  .prev('input').prop('checked', false);
		Bisia.Ui.waitStop();
	},

	/**
	 * [closeDeck description]
	 * @param  {[type]} instance [description]
	 * @return {[type]}          [description]
	 */
	closeDeck: function(instance) {
		for (var i = 0; i < 5; i ++) {
			instance['card' + i + 'value'].set(null);
			instance['card' + i + 'status'].set(false);
			$('.card[data-control=card' + i + ']').removeClass('open')
												  .removeAttr('data-value');

			instance['$card' + i] = $('#card' + i);
			instance['$card' + i].val(null);
			instance['$card' + i].prop('checked', false);
		}
	},

	/**
	 * Count n of cards in a hand
	 * @param  {Array} valueArr
	 * @return {Int}
	 */
	countCards: function(valueArr, n) {
		var count = 0;
		_.each(valueArr, function(value) {
			if (value == n) count ++;
		});
		return count;
	},

	/**
	 * Detect point accordingly with hand array
	 * @param  {Array} handArr
	 * @return {Object}
	 */
	detectHandPoint: function(handArr, bet, closing) {
		var parent = this;
		// moltiplicatore vincente
		var win = 0;
		var check = 0;
		var point = 0;
		var message = 'Non hai punti validi';
		var prefix = '';
		// moltiplicatori punti
		var winCoppia = 1, winDoppiaCoppia = 2, winTris = 3, winScala = 4;
		var winColore = 5, winFullHouse = 8, winPoker = 20;
		var winScalaColore = 40, winPokerissimo = 80, winScalaReale = 100;
		// init state game
		var coppia = false, doppiaCoppia = false, tris = false, scala = false;
		var colore = false, fullHouse = false, poker = false, scalaColore = false;
		var pokerissimo = false, scalaReale = false;
		// array of values
		var valueArr = [], signArr = [];
		// populate valueArr
		_.each(handArr, function(value) {
			valueArr.push(parent.mapCardNumbers(value));
		});
		// sort array
		valueArr = valueArr.sort(function (a, b) {
			return a > b ? 1 : a < b ? -1 : 0;
		});
		// populate signArr
		_.each(handArr, function(value) {
			signArr.push(parent.mapCardSign(value));
		});
		// sort array
		signArr = signArr.sort();
		// console.log(handArr, valueArr, signArr);

		// TEST debug
		// valueArr = [2, 3, 7, 14, 15];	// 5,53,51,32,24 dà scala
		// valueArr = [5, 8, 8, 9, 15];
		// valueArr = [2, 8, 9, 14, 15];
		// valueArr = [2, 3, 4, 5, 6];
		// valueArr = [2, 3, 4, 5, 14];
		// valueArr = [2, 3, 4, 5, 15];
		// valueArr = [2, 3, 5, 6, 15];
		// valueArr = [2, 3, 6, 15, 15];
		// valueArr = [2, 4, 6, 15, 15];
		// valueArr = [2, 3, 4, 14, 15];
		// valueArr = [2, 3, 14, 15, 15];
		// valueArr = [2, 3, 4, 15, 15];
		// valueArr = [3, 4, 5, 14, 15];
		// valueArr = [10, 12, 13, 14, 15];
		// valueArr = [8, 9, 10, 11, 12];
		// valueArr = [10, 11, 13, 14, 15];
		// valueArr = [10, 11, 12, 13, 14];
		// signArr = ['C', 'C', 'C', 'C', 'C'];

		// signArr = ['Q', 'J', 'Q', 'Q', 'Q'];

		// valueArr = [2, 4, 5, 6, 15];
		// signArr = ['Q', 'J', 'Q', 'Q', 'Q'];

		// valueArr = [3, 4, 11, 14, 15];

		// signArr = ['C', 'C', 'F', 'J', 'C'];
		// signArr = ['C', 'C', 'C', 'J', 'C'];
		// signArr = ['J', 'C', 'C', 'J', 'C'];
		// signArr = ['C', 'J', 'C', 'J', 'C'];
		// signArr = ['C', 'C', 'C', 'C', 'J'];
		// signArr = ['C', 'C', 'C', 'J', 'J'];
		// signArr = ['C', 'C', 'C', 'C', 'C'];
		// signArr = ['C', 'C', 'C', 'C', 'F'];
		// signArr = ['C', 'C', 'C', 'F', 'J'];

		// check same numbers (coppia, doppia, tris, full, poker, pokerissimo)
		check = this.detectSameNumbers(valueArr);
		// we have a point!
		if (check.point > 1) {
			point = check.point;
			// coppia
			if (check.point == 2) coppia = true;
			// tris
			if (check.point == 3) tris = true;
			// poker
			if (check.point == 4) poker = true;
			// pokerissimo
			if (check.point == 5) pokerissimo = true;
			// if remain has point (below poker)
			if (check.point < 4) {
				var check2 = this.detectSameNumbers(check.remain);
				// doppia coppia
				if (coppia && check2.point == 2) doppiaCoppia = true;
				// full house
				if (tris && check2.point == 2) fullHouse = true;
			}
		}

		// check colore
		check = this.detectSameSign(signArr);
		if (check) colore = true;

		// check scala
		check = this.detectStraight(valueArr);
		if (check.isStraight) scala = true;
		if (scala && colore) scalaColore = true;
		if (scalaColore && check.isRoyal) scalaReale = true;

		switch (true) {
			case scalaReale:
				win = bet * winScalaReale;
				message = 'una <strong>scala reale</strong>';
				break;
			case pokerissimo:
				win = bet * winPokerissimo;
				message = 'un <strong>pokerissimo</strong>';
				break;
			case scalaColore:
				win = bet * winScalaColore;
				message = 'una <strong>scala colore</strong>';
				break;
			case poker:
				win = bet * winPoker;
				message = 'un <strong>poker</strong>';
				break;
			case fullHouse:
				win = bet * winFullHouse;
				message = 'un <strong>full</strong>';
				break;
			case colore:
				win = bet * winColore;
				message = 'un <strong>colore</strong>';
				break;
			case scala:
				win = bet * winScala;
				message = 'una <strong>scala</strong>';
				break;
			case tris:
				win = bet * winTris;
				message = 'un <strong>tris</strong>';
				break;
			case doppiaCoppia:
				win = bet * winDoppiaCoppia;
				message = 'una <strong>doppia coppia</strong>';
				break;
			case coppia:
				win = bet * winCoppia;
				message = 'una <strong>coppia</strong>';
				break;
		}

		// var prefix
		if (message && win > 0) {
			prefix = closing ? 'Hai realizzato ' : 'Stai realizzando ';
		}

		return {
			win: win,
			message: prefix + message
		};
	},

	/**
	 * Detects coppia, tris, poker, pokerissimo
	 * @param  {Array} valueArr
	 * @return {Object}
	 */
	detectSameNumbers: function(valueArr) {
		var n = {};
		var jokers = 0;
		var arr = valueArr;

		// sum times point appear
		_.each(arr, function(num) {
			if (!n[num]) n[num] = 0;
			// detect jokers
			if (num == 15) {
				jokers = jokers + 1;
			} else {
				n[num] = n[num] + 1;
			}
		});

		// get max counter
		var max = _.max(n);
		var maxJokers = max + jokers;
		// remove jokers
		arr = _.without(arr, 15);

		var found = false;
		_.each(n, function(value, index) {
			if (max == value && !found) {
				arr = _.without(arr, parseInt(index));
				found = true;
			}
		});

		return {
			point: maxJokers,
			remain: arr
		}
	},

	/**
	 * Detects colore
	 * signArr = ['C', 'C', 'F', 'J', 'C'];
	 * @param  {Array} signArr
	 * @return {Bool}
	 */
	detectSameSign: function(signArr) {
		var testA, testB, isColor = true;
		_.each(signArr, function(value, index) {
			if (testA) {
				testB = value;
				if (testA != testB && testB != 'J') isColor = false;
				// if (testB == 'J') isColor = true;
			} else {
				testA = value;
				if (value == 'J') testA = null;
			}
		});
		return isColor;
	},

	/**
	 * Detect a straight
	 * @param  {Array} valueArr
	 * @return {Object}
	 */
	detectStraight: function(valueArr) {
		var isStraight = false;
		var isRoyal = false;
		var hasAce = false;
		var ok = 0;
		// sort array min max
		var prev, hand = valueArr;
		// count aces
		var countAces = this.countCards(hand, 14);
		// 2 aces -> fail
		if (countAces > 1) {
			return {
				isStraight: false,
				isRoyal: false
			}
		}

		// count jokers
		var countJokers = this.countCards(hand, 15);
		var tmpJokers = countJokers;
		// if 1 ace and first is 2
		if (countAces == 1 && hand[0] == 2) {
			// remove ace
			hand = _.without(hand, 14);
			// add 1 at the beginning
			hand.unshift(1);
		}
		// if 1 ace and joker and first is 3
		if (countAces == 1 && hand[0] == 3 && hand[4] == 15) {
			// remove ace
			hand = _.without(hand, 14);
			// remove joker
			hand = _.without(hand, 15);
			countJokers = 0;
			// add 2 at the beginning
			hand.unshift(2);
			// add 1 at the beginning
			hand.unshift(1);
		}
		// remove jokers from hand
		if (countJokers >= 1) hand = _.without(hand, 15);

		// console.log('clean hand', hand);
		// console.log(_.unique(hand).length,  hand.length);

		// check duplicates length
		if (_.unique(hand).length !== hand.length) {
			return {
				isStraight: false,
				isRoyal: false
			}
		}

		// loop array
		_.each(hand, function(value, index) {
			// set init value
			if (!prev && index == 0) {
				prev = value;
				ok ++;
			} else {
				// if value = previous + 1
				if (value == prev + 1) {
					ok ++;
				} else {
					//if (tmpJokers > 0 && value != prev) {
					if (tmpJokers > 0 && value != prev && (value == prev + tmpJokers || value == prev + tmpJokers + 1)) {
						ok ++;
						// remove available jokers
						tmpJokers --;
						// fill the gap
						prev ++;
					}
				}
				// increment previous first
				prev ++;
			}
			// console.log(prev);
		});

		// console.log(ok, countJokers);

		// detect point
		if (ok == 5 || ok + countJokers == 5) isStraight = true;

		// detect royal flush - straight without jollies
		if (hand[0] == 10 && hand[1] == 11 && hand[2] == 12 && hand[3] == 13 && hand[4] == 14) isRoyal = true;

		return {
			isStraight: isStraight,
			isRoyal: isRoyal
		};
	},

	/**
	 * Generate a fresh new deck
	 * @return {Array}
	 */
	generateNewDeck: function(avoidArray) {
		var deck = [];
		// if (!avoidArray) avoidArray = [];
		while(deck.length < 5){

			var alreadyPresent = false;
			var rndNumber = parseInt(_.random(1, 53)); // 1 = 1 Jolly - 0 = 2 Jolly

			for (var i = 0; i < deck.length; i++) {
				if (deck[i] == rndNumber) {
					alreadyPresent = true;
					break;
				}
				/*if (avoidArray) {
					if (_.contains(avoidArray, rndNumber)) {
						alreadyPresent = true;
						break;
					}
				}*/
			}

			if (avoidArray) {
				for (var p = 0; p < avoidArray.length; p++) {
					if (parseInt(avoidArray[p]) == rndNumber) {
						alreadyPresent = true;
						break;
					}
				}
			}

			if (!alreadyPresent) {
				deck[deck.length] = rndNumber;
			}
		}
		// console.log('avoidArray', avoidArray);
		// console.log('deck', deck);
		return deck;
	},

	/**
	 * Replace discarded card with brand new ones
	 * @param  {Array} firstHand
	 * @param  {Array} cardsToKeep
	 * @return {Array}
	 */
	generateChangeDeck: function(firstHand, cardsToKeep) {
		// if change all cards
		if (_.isEmpty(cardsToKeep)) {
			return this.generateNewDeck(firstHand);
		} else {
			var newDeck = this.generateNewDeck(firstHand);
			// loop cardsToKeep indexes
			_.each(cardsToKeep, function(value, index) {
				// replace new deck index with firstHand index
				newDeck[value] = firstHand[value];
			});
			return newDeck;
		}
	},

	/**
	 * [mapCards description]
	 * @param  {[type]} handObj [description]
	 * @return {[type]}         [description]
	 */
	mapCards: function(handObj) {
		if (handObj.cards) {
			var cards = {};
			var hasValues = false;
			_.each(handObj.cards, function(value, label) {
				cards[label] = (value) ? parseInt(value) : null;
				if (value) hasValues = true;
			});
			delete handObj.cards;
			if (hasValues) {
				handObj.cards = cards;
			}
		}
		return handObj;
	},

	/**
	 * map card entity to card value
	 * @return {Int}
	 */
	mapCardNumbers: function(num) {
		switch (num) {
			case 32:
			case 50:
			case 42:
			case 27:
				return 2;
				break;
			case 51:
			case 26:
			case  6:
			case 35:
				return 3;
				break;
			case  9:
			case 43:
			case 37:
			case 45:
				return 4;
				break;
			case 49:
			case 36:
			case 16:
			case  7:
				return 5;
				break;
			case 20:
			case  8:
			case 44:
			case 25:
				return 6;
				break;
			case 52:
			case  3:
			case 24:
			case 17:
				return 7;
				break;
			case 19:
			case 33:
			case 10:
			case 34:
				return 8;
				break;
			case 38:
			case 46:
			case 41:
			case 29:
				return 9;
				break;
			case  4:
			case 15:
			case 21:
			case  2:
				return 10;
				break;
			case 28:
			case 48:
			case  1:
			case 40:
				return 11;
				break;
			case 14:
			case 22:
			case 30:
			case 11:
				return 12;
				break;
			case 47:
			case 13:
			case 39:
			case 31:
				return 13;
				break;
			case  5:
			case 23:
			case 12:
			case 18:
				return 14;
				break;
			case  0:
			case 53:
				return 15;
				break;
		}
	},

	mapCardSign: function(num) {
		switch (num) {
			case 32:
			case 51:
			case  9:
			case 49:
			case 20:
			case 52:
			case 19:
			case 38:
			case  4:
			case 28:
			case 14:
			case 47:
			case  5:
				return 'P';
				break;
			case 50:
			case 26:
			case 43:
			case 36:
			case  8:
			case  3:
			case 33:
			case 46:
			case 15:
			case 48:
			case 22:
			case 13:
			case 23:
				return 'F';
				break;
			case 42:
			case  6:
			case 37:
			case 16:
			case 44:
			case 24:
			case 10:
			case 41:
			case 21:
			case  1:
			case 30:
			case 39:
			case 12:
				return 'Q';
				break;
			case 27:
			case 35:
			case 45:
			case  7:
			case 25:
			case 17:
			case 34:
			case 29:
			case  2:
			case 40:
			case 11:
			case 31:
			case 18:
				return 'C';
				break;
			case  0:
			case 53:
				return 'J';
				break;
		}
	},

	dayGame: function() {
		return {
			'$gte': Bisia.Time.todayStart(),
			'$lte': Bisia.Time.todayEnd()
		};
	},

	/**
	 * Recharge daily credits to all players
	 * Run by cronjob
	 * @return {Void}
	 */
	rechargeDailyCredits: function() {
		Pokerplayers.update({}, {
			'$set': { 'credit': Meteor.settings.bispoker.dailyCredit }
		}, {
			'multi': true
		});
	},

	rechargeHourlyCredits: function() {
		Pokerplayers.update({}, {
			'$set': { 'credit': Meteor.settings.bispoker.hourlyCredit }
		}, {
			'multi': true
		});
	},

	/**
	 * Reset the poker week of play
	 * @return {Void}
	 */
	resetPokerWeek: function() {
		// get current week of the year
		var weekOfTheYear = parseInt(moment().format('w'));
		// winners array
		var winners = [];
		// select top 3 players in ranking
		var players = Pokerplayers.find({}, { 'sort': { 'points': -1, 'hands': 1 }, 'limit': 3 });
		// save each winner
		players.forEach(function(winner, index) {
			var player = {};
			player.winnerId = winner.playerId;
			player.position = index + 1,
			player.points = winner.points;
			player.hands = winner.hands;
			winners.push(player);
		});
		// insert winner object
		Pokerwinners.insert({
			gameYear: parseInt(moment().format('YYYY')),
			gameWeek: weekOfTheYear - 1,
			gameStart: moment().startOf('week').subtract(7, 'd').toDate(),
			gameStop: moment().endOf('week').subtract(7, 'd').toDate(),
			winners: winners,
			playersCount:players.count()
		});
		// reset players
		Pokerplayers.update({}, {
			'$set': {
				'hands': 0,
				'points': 0,
				'credit': Meteor.settings.bispoker.hourlyCredit,
				'gameWeek': weekOfTheYear
			}
		}, {
			'multi': true
		});
		// remove all hands
		Pokerhands.remove({});
		// drop index
		Pokerhands._dropIndex({ 'playerId': 1 });
		// ensure index
		Pokerhands._ensureIndex({ 'playerId': 1 });
	},

	weekGame: function() {
		return {
			'$gte': Bisia.Time.pokerWeekStart(),
			'$lte': Bisia.Time.pokerWeekStop()
		};
	},

	weekStart: function(format) {
		return moment().startOf('week').format(format);
	},

	weekStop: function(format) {
		return moment().endOf('week').format(format);
	},

	weekGameStart: function() {
		return {
			'$gte': Bisia.Time.pokerWeekStart()
		};
	},

	weekGameStop: function() {
		return {
			'$lte': Bisia.Time.pokerWeekStop()
		};
	}
}