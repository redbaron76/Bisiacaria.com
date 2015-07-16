Template.nextEventList.helpers({
	formatEvents: function() {
		return {
			data: _.pairs(this)
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