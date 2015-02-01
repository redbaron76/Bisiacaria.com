
// Time

Bisia.Time = {

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
		return new Date();
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