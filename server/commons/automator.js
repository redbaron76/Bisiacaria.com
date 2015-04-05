
Bisia.Automator = {

	automators: {},

	timers: Meteor.settings.automator,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {
		this.startProcess('broadcastNotifications');
	},

	/**
	 * Broadcast notifications
	 * @return {Integer} N. of modified records
	 */
	broadcastNotifications: function() {
		return Notifications.update({
			'broadcastedAt': { $lte: Bisia.Time.now() },
			'isBroadcasted': false,
			'isRead': false
		}, {
			$set: {
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