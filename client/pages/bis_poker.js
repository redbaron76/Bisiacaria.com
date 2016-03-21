Template.pokerTab.helpers({
	setSelected: function() {
		var gameSelected, rankingSelected, winnersSelected;
		switch (this.selected) {
			case 'game':
				gameSelected = 'selected';
				break;
			case 'ranking':
				rankingSelected = 'selected';
				break;
			case 'winners':
				winnersSelected = 'selected';
				break;
		}
		return {
			gameSelected: gameSelected,
			rankingSelected: rankingSelected,
			winnersSelected: winnersSelected
		};
	}
});

Template.pokerCounters.onCreated(function() {
	// Init
	var instance = this;
	// Ranking
	instance.weekPosition = new ReactiveVar(null);
});

Template.pokerCounters.helpers({
	weekPosition: function() {
		var instance = Template.instance();
		var weekTotal = Counts.get('weekTotal');
		Meteor.call('getRankingPosition', weekTotal, function(e, weekPosition) {
			instance.weekPosition.set(weekPosition);
		});
		return instance.weekPosition.get();
	}
})


Template.bisPoker.onCreated(function() {
	// Init
	var instance = this;
	// Cards
	instance.card0value = new ReactiveVar(null);
	instance.card0status = new ReactiveVar(false);
	instance.card1value = new ReactiveVar(null);
	instance.card1status = new ReactiveVar(false);
	instance.card2value = new ReactiveVar(null);
	instance.card2status = new ReactiveVar(false);
	instance.card3value = new ReactiveVar(null);
	instance.card3status = new ReactiveVar(false);
	instance.card4value = new ReactiveVar(null);
	instance.card4status = new ReactiveVar(false);
	// Messages
	instance.winMessage = new ReactiveVar(null);
	instance.statusMessage = new ReactiveVar(null);
	// Status
	instance.statusPlay = new ReactiveVar();

	// populate initial data from controller
	instance.populateInitialData = function(data) {
		instance.card0value.set(data.deck[0]);
		instance.card1value.set(data.deck[1]);
		instance.card2value.set(data.deck[2]);
		instance.card3value.set(data.deck[3]);
		instance.card4value.set(data.deck[4]);
		instance.winMessage.set(data.winMessage);
		instance.statusMessage.set(data.statusMessage);
		instance.statusPlay.set(data.statusPlay);
		if (data.statusPlay == 'cambia' && data.bet && data.handId) {
			Bisia.Poker.handId = data.handId;
			Bisia.Poker.currentHandBet = data.bet;
			Bisia.Poker.firstHand = data.firstHand;
			$('#value'+ data.bet).prop('checked', true);
			Bisia.Poker.buildChangeDeck(data.deck, instance);
		}
	};

});

Template.bisPoker.onRendered(function() {
	// Init
	var instance = this;

	instance.autorun(function() {

		for (i = 0; i < 5; i++) {
			instance['$card' + i] = $('#card' + i);
			instance['$card' + i].prop('checked', instance['card' + i + 'status'].get());
			instance['$card' + i].val(instance['card' + i + 'value'].get());
		}

	});

	// Init data from controller (status of play)
	// console.log(instance.data);
	instance.populateInitialData(instance.data);

});

Template.bisPoker.helpers({
	deckValues: function() {
		var instance = Template.instance();
		instance.dailyCredit = Counts.get('countDailyCredit');
		return {
			card0: instance.card0value.get(),
			card1: instance.card1value.get(),
			card2: instance.card2value.get(),
			card3: instance.card3value.get(),
			card4: instance.card4value.get(),
			winMessage: instance.winMessage.get(),
			statusMessage: instance.statusMessage.get(),
			statusPlay: instance.statusPlay.get()
		}
	},
	allowCredits: function(credit) {
		var instance = Template.instance();
		var dailyCredit = instance.dailyCredit;
		var status = instance.statusPlay.get();
		if (parseInt(credit) > dailyCredit) {
			return 'disabled';
		}
	},
	outOfCredit: function() {
		var instance = Template.instance();
		var status = instance.statusPlay.get();
		var credit = instance.dailyCredit;
		return credit == 0 && status == 'apri';
	},
	isDisabled: function() {
		var instance = Template.instance();
		var status = instance.statusPlay.get();
		if (status == 'apri') return 'disabled';
	},
	printNextCredits: function() {
		var credit = Bisia.Poker.credit;
		var midDay = moment().set('hour', 12).set('minute', 0).set('second', 0);
		if (moment().isBefore(midDay)) {
			return 'Ne riceverai ulteriori <strong>'+credit+'</strong> alle ore 12:00';
		} else {
			return 'Riceverai nuovi <strong>'+credit+'</strong> crediti a mezzanotte.';
		}
	}
});

Template.bisPoker.events({
	'click .card[data-value]': function(e, instance) {
		e.preventDefault();
		// get the card
		var $card = $(e.currentTarget);
		// toggle the class
		$card.toggleClass('open');
		// get parameters
		var cardId = $card.data('control');
		var cardChecked = $card.hasClass('open');
		// set status
		instance[cardId + 'status'].set(cardChecked);
	},
	'click [name=bet]': function(e, instance) {
		$('#play').removeAttr('disabled');
	},
	'submit #poker-form': function(e, instance) {
		e.preventDefault();
		var $target = $(e.target);

		var formObject = Bisia.Form.getFields($target, null, {
			'card0': 'cards.card0',
			'card1': 'cards.card1',
			'card2': 'cards.card2',
			'card3': 'cards.card3',
			'card4': 'cards.card4',
		});

		if (formObject.play.length > 0) {

			switch (formObject.play) {
				case 'apri':
					Bisia.Poker.actionPlayGame(formObject, instance);
					break;
				case 'cambia':
					Bisia.Poker.actionChangeGame(formObject, instance);
					break;
				case 'gioca':
					Bisia.Poker.actionResetGame(instance);
					break;
				default:
					alert('game not valid');
			}

		} else {
			alert('game not valid');
		}
	}
});

Template.playerItem.onRendered(function() {
	var rankingInstance = this.parentTemplate();
	if (rankingInstance.$('.ranking[data-value='+this.data.ranking+']').length > 1) {
		rankingInstance.$('.ranking[data-value='+this.data.ranking+']').not().eq(1).hide();
	}
	return this;
});

Template.playerItem.events({
	'click [data-view=hands]': function(e, t) {
		Bisia.Ui.toggleModal(e, 'playerHandsModal', this);
	}
});

Template.bisPokerRanking.helpers({
	generateRankings: function() {
		var ranking = {};
		var counter = 1;
		_.each(this.items.fetch(), function(player) {
			if (!ranking[player.points]) {
				ranking[player.points] = counter;
				counter ++;
			}
		});
		this.ranking = ranking;
		return this;
	},
	getPlayer: function(obj, ranking) {
		var instance = Template.instance();
		var user = Users.findOne({ '_id': obj.playerId }, { 'fields': {
			'username': 1,
			'profile.city': 1,
			'profile.gender': 1,
			'profile.status': 1,
			'profile.avatar': 1,
			'profile.online': 1,
			'profile.birthday': 1
		}});

		// add ranking to the first of ranking position
		// if (!Bisia.Poker.ranking[this.points]) {
			user.ranking = ranking[this.points];
			// Bisia.Poker.ranking[this.points] = ranking[this.points];
		// }

		return _.extend(this, user);
	},
	detectFirstPage: function() {
		var increment = Bisia.getController('increment');
		var limit = Bisia.getController('params')['pageLimit'];
		// Don't show spinner by default
		var pageDisplay = true;
		// If we are on the first page...
		if (!limit || limit == increment) {
			// pageDisplay becomes reactive
			pageDisplay = this.pageReady;
		}
		// Add pageDisplay to this
		return _.extend(this, {
			pageDisplay: pageDisplay
		});
	},
	weekNumber: function() {
		return moment().format('w');
	},
	weekStart: function() {
		return Bisia.Poker.weekStart('dddd DD');
	},
	weekStop: function() {
		return Bisia.Poker.weekStop('dddd DD MMMM YYYY');
	}
});

Template.bisPokerRanking.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');
	}
});

Template.winnerItem.helpers({
	getPlayer: function(obj) {
		var user = Users.findOne({ '_id': obj.winnerId }, { 'fields': {
			'username': 1,
			'profile.city': 1,
			'profile.gender': 1,
			'profile.status': 1,
			'profile.avatar': 1,
			'profile.online': 1,
			'profile.birthday': 1
		}});
		return _.extend(this, user);
	},
});

Template.playerHandsModal.onCreated(function() {
	var instance = this;
	// run paginator
	Bisia.Paginator.init(instance, {
		subsTo: 'playerHands',
		collection: 'pokerhands',
		query: {
			'playerId': '_id',
			'status': 'finish'
		}
	});
});

Template.playerHandsModal.helpers({
	getTitle: function() {
		return {
			title: "Le mani di " + this.username
		}
	},
	formatDeck: function() {
		return {
			createdAt: this.createdAt,
			bet: this.bet,
			win: this.win,
			winning: this.winMessage.replace('Hai', 'Ha').replace('hai', 'ha'),
			card0: this.changeDeck[0],
			card1: this.changeDeck[1],
			card2: this.changeDeck[2],
			card3: this.changeDeck[3],
			card4: this.changeDeck[4]
		};
	},
	playerHands: function() {
		return Template.instance().getData();
	},
	hasMoreData: function() {
		return Template.instance().hasMoreData.get();
	},
	pageReady: function() {
		return Template.instance().ready.get();
	}
});

Template.playerHandsModal.events({
	'scroll .content': function(e, t) {
		Bisia.Paginator.triggerBottom(e);
	}
});

Template.cardItem.helpers({
	allCards: function() {
		var cards = [];
		for (var i = 0; i < 54; i++) {
			cards.push(i);
		}
		return cards;
	},
	newTime: function() {
		return '?t=' + new Date().getTime();
	},
	showCard: function(currentCard, selectedCard) {
		return (currentCard == selectedCard) ? 'show-card' : '';
	}
});