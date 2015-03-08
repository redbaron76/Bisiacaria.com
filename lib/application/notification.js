
// Notification

Bisia.Notification = {

	/**
	 * Gap in minutes anti flooding
	 * @type {Number}
	 */
	timeLimitFlood: 3,

	/**
	 * enableFloodProtect
	 * @type {Boolean}
	 */
	enableFloodProtect: true,

	/**
	 * [Notification object]
	 * @type {Object}
	 */
	notify: null,

	/**
	 * The notifications _id
	 * @type {String}
	 */
	notifyId: null,

	/**
	 * Object of actions and counters to notify
	 * @type {Object}
	 */
	notifyItems: {
		message: { counter: 'unreadMessages', newCount: 'newMessages'},
		visit: { counter: null, newCount: 'newVisits'},
		friend: { counter: 'totFriends', newCount: 'newFriends'},
		youknow: { counter: 'youKnow', newCount: null },
		vote: { counter: 'totVotes', newCount: 'newVotes' },
		event: { counter: 'birthdayDay', newCount: null },
		birthday: { counter: 'birthdayDay', newCount: null }
	},

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Calculate the notification object - REACTIVE DATA SOURCE
	 * @return {Object}
	 */
	compute: function() {
		if(Meteor.userId()) {
			var parent = this;
			var notifyStatus = [];
			_.each(this.notifyItems, function(item, index) {
				var counter = (item.counter) ? Counts.get(item.counter) : 0;
				var newCount = (item.newCount) ? Counts.get(item.newCount): 0;
				notifyStatus.push({key: index, counter: counter, newCount: newCount});
			});
			return notifyStatus;
		}
	},

	/**
	 * Get total number of notifications
	 * @return {Int}
	 */
	countTotal: function() {
		return _.reduce(this.compute(), function(memo, item) {
			return memo + item.newCount;
		}, 0);
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
	resetNotify: function(action) {
		this.notifyClasses = _.without(this.notifyClasses, action);
		Meteor.call('resetNotification', action);
	}

};