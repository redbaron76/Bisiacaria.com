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


Template.bisPoker.onCreated(function() {
	// Init
	var instance = this;
	// Totals
	instance.weekPosition = new ReactiveVar(null);
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
		instance.weekPosition.set(data.weekPosition);
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
			$('#play').removeAttr('disabled');
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

		// get week position
		var weekTotal = Counts.get('weekTotal');
		var weekPosition = Meteor.call('getRankingPosition', weekTotal, function(e, weekPosition) {
			instance.weekPosition.set(weekPosition);
		});


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
			weekPosition: instance.weekPosition.get(),
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
		var credit = instance.dailyCredit
		return credit == 0 && status == 'apri';
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

Template.bisPokerRanking.onCreated(function() {
	var instance = this;
	instance.rankingToHide = {};
})

Template.playerItem.onCreated(function() {
	var rankingInstance = this.parentTemplate();
	if (!rankingInstance.rankingToHide[this.data.ranking]) {
		rankingInstance.rankingToHide[this.data.ranking] = true;
		return this;
	}
	this.data.ranking = null;
	return this;
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
	}
});

Template.bisPokerRanking.events({
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');
	}
});

Template.playerItem.helpers({
	showRanking: function(rankings, points) {
		return rankings[points];
	}
})