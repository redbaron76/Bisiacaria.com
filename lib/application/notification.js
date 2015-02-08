
// Notification

Bisia.Notification = {

	timeLimitFlood: 3,

	notify: null,

	notifyId: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Create a notification entry by action
	 * @param  {String} action
	 * @param  {Object} obj
	 * @return {String}
	 */
	emit: function(action, obj) {
		var parent = this;

		this.notify = _.extend(obj, {
			action: action,
			createdAt: Bisia.Time.now(),
			isRead: false
		});

		// Never notify to itself and not flooding
		if (this.notify.userId !== this.notify.targetId) {
			this.notifyId = Notifications.insert(this.notify);
		}

		return this.notifyId;
	},

	/**
	 * Reset an action notification
	 * @param  {String} action
	 * @return {Void}
	 */
	reset: function(action) {
		Meteor.call('resetNotification', action);
	}

};