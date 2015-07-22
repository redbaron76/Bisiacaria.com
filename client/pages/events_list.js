Template.nextEventList.helpers({
	formatNextEvents: function() {
		return {
			data: _.pairs(this.nextEvents)
		};
	},
	formatYourEvents: function() {
		return {
			data: _.pairs(this.yourEvents)
		};
	},
	formatDay: function() {
		return {
			day: this[0],
			eventObj: this[1]
		}
	},
	getEventDay: function(day) {
		if (Bisia.Time.isToday(day))
			return 'Oggi';
		if (Bisia.Time.isTomorrow(day))
			return 'Domani';
		return moment(day, 'YYYYMMDD', true).format('dddd, DD MMMM');
	}
});

Template.nextEventList.events({
	'click .go-top': function(e, t) {
		Bisia.Ui.goTop(e);
	},
	'scroll .content': function(e, t) {
		Bisia.Ui.toggleAtBottom(e, '#helpbars', 'bottom-show');
	}
});

Template.eventItem.helpers({
	getEventTime: function(dt) {
		return moment(dt).format('HH:mm');
	}
});

Template.eventYour.helpers({
	getEventShortDate: function(dt) {
		return moment(dt).format('DD/MM');
	}
});

Template.eventYour.events({
	'click [data-action=actions]': function(e, t) {
		e.preventDefault();
		var context = this;

		context.infoTitle = 'Cosa vuoi fare?';
		context.infoText = "Modificare o eliminare definitivamente questo evento?";

		Bisia.Ui.setReactive('info', {
			template: 'infoActions',
			context: context
		});
	}
});