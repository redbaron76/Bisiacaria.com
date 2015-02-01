
// Notification

Bisia.Notification = {

	timeLimitFlood: 3,

	notify: null,

	notifyId: null,

	notifyTrack: [],

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Check time last action to avoid flood
	 * @param  {String} targetId
	 * @return {Boolean}
	 */
	afterAmountOfTime: function(targetId) {
		// Get the first tracked visit to that targetId
		var visit = _.first(_.where(this.notifyTrack, {
			targetId: targetId
		}));

		// If any
		if(!_.isEmpty(visit)) {
			// add time to past tracked date
			var datePast = moment(visit.createdAt).add(this.timeLimitFlood, 'minutes');
			var dateNow = moment();
			// If it's bigger than now (less than time limit)
			if(datePast > dateNow) {
				return false;
			} else {
				// remove tracked date from track list
				this.notifyTrack = _.without(this.notifyTrack, visit);
				return true;
			}
		}
		return true;
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