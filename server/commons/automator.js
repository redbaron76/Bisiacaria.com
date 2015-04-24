
Bisia.Automator = {

	/**
	 * Container for interval handlers
	 * @type {Object}
	 */
	automators: {},

	/**
	 * Interval seconds object
	 * @type {Object}
	 */
	timers: Meteor.settings.automator,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		this.startProcess('broadcastNotifications');
	},

	/**
	 * Delete broadcasted Notifications
	 * @param {Integer} olderThan
	 * @return {Void}
	 */
	deleteNotifications: function(olderThan) {
		// Remove visit greater than a week ago
		Notifications.remove({ 'isBroadcasted': true, 'isRead': true, 'createdAt': { '$lt': Bisia.Time.timeAgo(olderThan) } });
	},

	/**
	 * Broadcast notifications
	 * @return {Integer} N. of modified records
	 */
	broadcastNotifications: function() {

		// delete broadcasted notifications
		this.deleteNotifications(Bisia.Time.msWeek);

		// Update multiple notifications when are isBroadcasted
		return Notifications.update({
			'broadcastedAt': Bisia.Time.nowStart(),
			'isBroadcasted': false,
			'isRead': false
		}, {
			$set: {
				'broadcastedAt': Bisia.Time.now(),
				'isBroadcasted': true
			}
		}, true);
	},

	/**
	 * Start a recursive process every interval seconds
	 * @param  {String} method
	 * @return {Bisia.Automator}
	 */
	startProcess: function(method) {
		var parent = this;
		parent[method]();
		var process = Meteor.setInterval(function() {
			parent[method]();
		}, this.timers[method] * 1000);
		if (!!this.automators[method]) {
			Meteor.clearInterval(this.automators[method]);
		}
		this.automators[method] = process;
		return this;
	}

};