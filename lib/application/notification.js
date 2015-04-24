
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
		news: { counter: null, newCount: 'news'},
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
				var newCount = (item.newCount) ? Counts.get(item.newCount) : 0;
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
		}, 0) + Counts.get('totNotifies');
	},

	/**
	 * Create a notification entry by action
	 * @param  {String} action
	 * @param  {Object} obj
	 * @return {String}
	 */
	emit: function(action, obj) {
		var parent = this;
		var broadcastTime = Bisia.Time.now();
		var createdTime = Bisia.Time.now();
		var blockIds = arguments[2] || [];

		if (arguments[2]) {
			broadcastTime = arguments[2];
			createdTime = broadcastTime;
		}
		this.notify = _.extend(obj, {
			action: action,
			createdAt: createdTime,
			broadcastedAt: broadcastTime,
			isBroadcasted: false,
			isRead: false,
		});

		Bisia.log('blockIds', blockIds);

		// Never notify to itself or not blocked
		if (this.notify.userId !== this.notify.targetId) {
			if ( ! _.contains(blockIds, this.notify.targetId)) {
				this.notifyId = Notifications.insert(this.notify);
				return true;
			}
		}
		return false;
	},

	noteMsg: function(actionKey, inputObj, isOwner) {
		// ['like', 'unlike', 'comment', 'share']
		var msg = '';

		var cite, what, isLike = false, isUnlike = false, isComment = false, isShare = false;
		switch(actionKey) {
			case 'like':
				what = 'dice di essere <strong>in accordo</strong> con un tuo <strong>post</strong>';
				isLike = true;
				break;
			case 'unlike':
				what = 'dice di essere <strong>in disaccordo</strong> con un tuo <strong>post</strong>';
				isUnlike = true;
				break;
			case 'comment':
				what = isOwner ? 'ha <strong>commentato</strong> un tuo <strong>post</strong>' :
								 'ha <strong>commentato</strong> il <strong>post</strong> di <strong>'+ inputObj.authorNick +'</strong>';
				isComment = true;
				break;
			case 'share':
				what = isOwner ? 'ha <strong>condiviso</strong> il tuo <strong>post</strong> con <strong>' + inputObj.countShares + '</strong> dei suoi contatti' :
								 'vuole condividere con te un <strong>post</strong> di <strong>' + inputObj.authorNick + '</strong>';
				isShare = true;
				break;
		}

		var spec = '';
		if (!!inputObj.category && actionKey != 'share') {
			spec = 'nella categoria <strong>' + inputObj.category + '</strong>'
			return msg + what + ' ' + spec + '.';
		}

		return msg + what + '.';


	},

	postEventMsg: function(actionKey, inputObj, details) {
		var msg = 'ha pubblicato';

		var cite, what, isPost = false, isEvent = false;
		switch(actionKey) {
			case 'post':
				what = 'un nuovo <strong>post</strong>';
				isPost = true;
				break;
			case 'event':
				what = 'un nuovo <strong>evento</strong>';
				isEvent = true;
				break;
		}

		if (isPost && !!details.imageUrl) {
			what = 'nel suo post una nuova <strong>immagine</strong>';
		}

		if (isPost && !!details.position.loc) {
			msg = 'ha segnalato';
			what = 'una nuova <strong>posizione</strong> sulla mappa:';
			cite = '<cite>' + details.position.loc + '</cite>';
			return msg + ' ' + what + ' ' + cite;
		}

		var spec = '';
		if (isPost && !!inputObj.category) {
			spec = 'nella categoria <strong>' + inputObj.category + '</strong>'
			return msg + ' ' + what + ' ' + spec + '.';
		}

		if (isEvent) {
			if (!!inputObj.titleEvent)
				spec += ' dal titolo <strong>' + inputObj.titleEvent + '</strong> ';
			if (!!inputObj.dateTimeEvent)
				spec += ' che si terrà <strong>' + moment(inputObj.dateTimeEvent).format('dddd DD MMMM') + '</strong> ';
			if (!!inputObj.locationEvent)
				spec += ' presso <strong>' + inputObj.locationEvent + '</strong>';
		}

		return msg + ' ' + what + spec + '.';
	},

	/**
	 * Build object for count publication
	 * @param  {String} targetId
	 * @param  {String} action
	 * @return {Object}
	 */
	getPublishObject: function(targetId, action) {
		var isRead = arguments[2] || false;
		if (_.isArray(action)) {
			action = { '$in': action };
		}
		return {
			targetId: targetId,
			action: action,
			isRead: isRead,
			isBroadcasted: true
		};
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