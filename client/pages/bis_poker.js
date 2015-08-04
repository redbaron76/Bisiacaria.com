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
		if (parseInt(credit) > dailyCredit) return 'disabled';
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
})