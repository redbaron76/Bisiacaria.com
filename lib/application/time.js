
// Time

Bisia.Time = {

	beatTime: null,

	//Set serverTimeOffset in past
	serverTimeOffset: 5 * 1000,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Get now date time
	 * @return {Object}
	 */
	now: function() {
		if(this.beatTime && arguments[0] == 'server')
			return moment(this.beatTime).subtract(this.serverTimeOffset, 'ms');
		return new Date();
	},

	/**
	 * Get a time ago date
	 * @param  {int} milliseconds
	 * @return {Date}
	 */
	timeAgo: function(ms) {
		return moment().subtract(ms, 'ms').toDate();
	},

	/**
	 * Get the start of today
	 * @return {Object}
	 */
	todayStart: function() {
		var now = this.now();
		now.setHours(0,0,0,0);
		return new Date(now);
	},

	/**
	 * Get the end of today
	 * @return {Object}
	 */
	todayEnd: function(key) {
		var now = this.now();
		now.setHours(23,59,59,9999);
		return new Date(now);
	}
};