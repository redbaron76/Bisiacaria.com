
// Poker

Bisia.Poker = {

	/**
	 * [config description]
	 * @type {[type]}
	 */
	config: Meteor.settings.bispoker,

	/**
	 * Reactive var for DailyCreditLeft
	 * @type {Object}
	 */
	dailyCreditLeft: new ReactiveVar(0),

	/**
	 * [countDailyCreditLeft description]
	 * @return {[type]} [description]
	 */
	countDailyCreditLeft: function() {
		var parent = this;
		Meteor.call('getDailyCreditLeft', function(error, counter) {
			parent.dailyCreditLeft.set(counter);
		});
		return this.dailyCreditLeft.get();
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