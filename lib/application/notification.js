
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
	 * Total counter of notifications
	 * @type {ReactiveVar}
	 */
	total: new ReactiveVar(),

	/**
	 * Object of actions and counters to notify
	 * @type {Object}
	 */
	notifyItems: {
		note: { counter: null, newCount: 'totNotifies', inCounter: true },
		news: { counter: null, newCount: 'lastNews', inCounter: false },
		message: { counter: 'unreadMessages', newCount: 'newMessages', inCounter: true },
		visit: { counter: null, newCount: 'newVisits', inCounter: true },
		friend: { counter: 'totFriends', newCount: 'newFriends', inCounter: true },
		youknow: { counter: 'youKnow', newCount: null, inCounter: true },
		vote: { counter: 'totVotes', newCount: 'newVotes', inCounter: true },
		// event: { counter: 'eventsToday', newCount: null, inCounter: true },
		event: { counter: 'eventsWeek', newCount: null, inCounter: true },
		birthday: { counter: 'birthdayDay', newCount: null, inCounter: true },
		around: { counter: 'totGeoTagged', newCount: 'nearYou', inCounter: false },
		poker: { counter: 'countDailyCredit', newCount: null, inCounter: false },
		chat: { counter: null, newCount: 'countChatUsers', inCounter: false }
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
			var tot = 0;
			var msgIndex;
			var c = 0;
			_.each(this.notifyItems, function(item, index) {
				var counter = (item.counter) ? Counts.get(item.counter) : 0;
				var newCount = (item.newCount) ? Counts.get(item.newCount) : 0;
				// Add to general counter if inCounter true
				if (item.inCounter) {
					tot = tot + newCount;
				}
				// Run custom counter
				if (item.customCount) {
					counter = Bisia.executeFunctionByName(item.customCount, window);
				}

				notifyStatus.push({key: index, counter: counter, newCount: newCount});
				if (index == 'message') msgIndex = c;
				c++;
			});

			// Set ReactiveVar with total
			this.total.set(tot);
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
		var broadcastTime = Bisia.Time.now();
		var createdTime = Bisia.Time.now();
		var blockIds = arguments[2] || [];

		if (arguments[3]) {
			broadcastTime = arguments[3];
			createdTime = broadcastTime;
		}
		this.notify = _.extend(obj, {
			action: action,
			createdAt: createdTime,
			broadcastedAt: broadcastTime,
			isBroadcasted: false,
			isRead: false,
		});
		// Never notify to itself or not blocked or not allowed action with actionKey
		if (this.notify.userId !== this.notify.targetId) {
			if ( ! _.contains(blockIds, this.notify.targetId)) {
				this.notifyId = Notifications.insert(this.notify);
				// Email notification
				if (this.actionsAreMailable(action, obj)) {
					var target = this.shouldSendEmail(this.notify.targetId);
					if (!!target.email && !Bisia.Validation.notValid('email', target)) {
						if (process.env.ROOT_URL !== 'http://localhost:3000/') {
							Meteor.call('queueNotificationMail', target.email, this.notify.targetId);
						}
					}
				}
				return this.notifyId;
			}
			return false;
		}
		return false;
	},

	/**
	 * Select when to send mails
	 * @param  {[type]} action [description]
	 * @param  {[type]} obj [description]
	 * @return {[type]}        [description]
	 */
	actionsAreMailable: function(action, obj) {
		var validActions = ['note', 'message'];
		var validActionKeys = ['join', 'post', 'commentEvent', 'comment'];
		if (action == 'message') {
			return true;
		} else if (obj.actionKey && _.contains(validActions, action)) {
			return _.contains(validActionKeys, obj.actionKey);
		} else {
			return false;
		}
		return false;
	},

	/**
	 * Notify my followers
	 * @param  {String} action        [description]
	 * @param  {String} actionKey     [description]
	 * @param  {Object} obj           [description]
	 * @param  {Object} details       [description]
	 * @return {Void}               [description]
	 */
	notifyMyFollowers: function(action, actionKey, obj, details) {
		var parent = this;
		// get my user
		var user = Meteor.user();
		// get people blocked
		var blockIds = Bisia.User.getBlockIds(user._id);
		// get my followers
		var myFollowers = user['followers'];
		// remove targetId from myFollowers
		myFollowers = _.without(myFollowers, obj.targetId);

		var broadcastTime = arguments[4] ? obj[arguments[4]] : null;

		var actionId;
		switch(actionKey) {
			case 'join':
				actionId = obj['eventId'];
				break;
			default:
				actionId = obj['_id'];
		}

		// abort notification
		if (actionKey == 'geotag' && !details.position.tag && !details.position.location) {
			return;
		}

		//Notify to all followers
		_.each(myFollowers, function(el) {
			Bisia.Notification.emit(action, {
				userId: user._id,
				targetId: el,
				actionId: actionId,
				actionKey: actionKey,
				message: parent.postEventMsg(actionKey, obj, details)
			}, blockIds, broadcastTime);
		});
	},

	/**
	 * Notify cited users
	 * @param  {[type]} action    [description]
	 * @param  {[type]} actionKey [description]
	 * @param  {[type]} obj       [description]
	 * @param  {[type]} detail    [description]
	 * @return {[type]}           [description]
	 */
	notifyCiteUsers: function(action, actionKey, obj, detail) {
		if (obj && obj.text) {
			var userId = Meteor.userId();
			var userIds = this.getCiteUserIds(obj.text);
			if (userIds) {
				// get people blocked
				var blockIds = Bisia.User.getBlockIds(userId);
				//Notify cite users
				_.each(userIds, function(el) {
					Bisia.Notification.emit(action, {
						userId: userId,
						targetId: el,
						actionId: obj._id,
						actionKey: actionKey,
						message: 'ti ha citato in un <strong>' + detail + '</strong>.'
					}, blockIds);
				});
			}
		}
	},

	/**
	 * [notifyCiteInChat description]
	 * @param  {[type]} action    [description]
	 * @param  {[type]} actionKey [description]
	 * @param  {[type]} obj       [description]
	 * @return {[type]}           [description]
	 */
	notifyCiteInChat: function(action, obj) {
		if (obj && obj.text) {
			var userId = Meteor.userId();
			var userIds = this.getCiteUserIds(obj.text);
			if (userIds) {
				// get people blocked
				var blockIds = Bisia.User.getBlockIds(userId);
				//Notify cite users
				_.each(userIds, function(el) {
					Bisia.Notification.emit(action, {
						userId: userId,
						targetId: el,
						actionId: obj._id,
						actionKey: 'chat',
						message: 'ti ha citato in <strong>Bisia-Chat</strong>:<br><cite>' + obj.text + '</cite>'
					}, blockIds);
				});
			}
		}
	},

	getCiteUserIds: function(text) {
		if (text) {
			// var usernames = text.match(/(\s+)?@(.+?)(?=[\r\n\s,:?!]|$)/gmi);
			var usernames = text.match(/\B@[\w\d.]+\b/igm);
			if (!_.isEmpty(usernames)) {
				var idArr = [];
				var nickArr = _.uniq(_.map(usernames, function(name) {
					return name.trim().replace('@', '').toLowerCase();
				}));
				if (! _.isEmpty(nickArr)) {
					_.each(nickArr, function(nick) {
						if (nick.substr(nick.length-1) == '.') {
							nick = nick.substr(0, nick.length-1);
						}
						var user = Users.findOne({ 'username': { '$regex': '^'+nick+'$', '$options': 'i' }});
						if (user) idArr.push(user._id);
					});
					console.log(idArr);
					return idArr;
				}
				return null;
			}
			return null;
		}
	},

	/**
	 * Messages from notifications
	 * @param  {[type]}  actionKey [description]
	 * @param  {[type]}  inputObj  [description]
	 * @param  {Boolean} isOwner   [description]
	 * @return {[type]}            [description]
	 */
	noteMsg: function(actionKey, inputObj, isOwner) {
		var msg = '';
		var isSelf = arguments[3] ? arguments[3] : false;
		var cite, what, isLike = false, isUnlike = false, isComment = false, isShare = false;
		switch(actionKey) {
			case 'like':
				what = '<strong>è d\'accordo</strong> con un tuo <strong>post</strong>';
				isLike = true;
				break;
			case 'unlike':
				what = '<strong>non è d\'accordo</strong> con un tuo <strong>post</strong>';
				isUnlike = true;
				break;
			case 'comment':
				if (isSelf) {
					what = 'ha <strong>commentato</strong> un suo <strong>post</strong>';
				} else {
					what = isOwner ? 'ha <strong>commentato</strong> un tuo <strong>post</strong>' :
									 'ha <strong>commentato</strong> il <strong>post</strong> di <strong>'+ inputObj.authorNick +'</strong>';
				}
				isComment = true;
				break;
			case 'commentEvent':
				what = isOwner ? 'ha <strong>commentato</strong> un <strong>evento</strong> creato da te' :
								 'ha <strong>commentato</strong> un <strong>evento</strong> al quale partecipi anche tu';
				isComment = true;
				break;
			case 'share':
				what = isOwner ? 'ha <strong>inoltrato</strong> il tuo <strong>post</strong> a <strong>' + inputObj.countShares + '</strong> dei suoi contatti' :
								 'ti ha inoltrato un <strong>post</strong> di <strong>' + inputObj.authorNick + '</strong>';
				isShare = true;
				break;
		}

		var spec = '';
		if (!!inputObj.category && actionKey != 'share') {
			if (inputObj.category == 'ha taggato questa posizione') {
				spec = 'quando eri <strong>in questa posizione</strong>';
			} else {
				spec = 'nella categoria <strong>' + inputObj.category + '</strong>'
			}
			return msg + what + ' ' + spec + '.';
		}

		return msg + what + '.';
	},

	/**
	 * Messages for post, geotags and events
	 * @param  {[type]} actionKey [description]
	 * @param  {[type]} inputObj  [description]
	 * @param  {[type]} details   [description]
	 * @return {[type]}           [description]
	 */
	postEventMsg: function(actionKey, inputObj, details) {
		var msg = 'ha pubblicato';

		var cite, what, isPost = false, isEvent = false, isJoin = false, isGeotag = false, isProfile = false;
		switch(actionKey) {
			case 'post':
				what = 'un nuovo <strong>post</strong>';
				isPost = true;
				break;
			case 'event':
				what = 'un nuovo <strong>evento</strong>';
				isEvent = true;
				break;
			case 'join':
				isJoin = true;
				break;
			case 'geotag':
				isGeotag = true;
				break;
			case 'nicknameChanged':
			case 'profileData':
			case 'question':
			case 'loveHate':
				isProfile = true;
				break;
		}

		if (isProfile && actionKey == 'nicknameChanged') {
			return 'è il nuovo nickname di <strong>' + details.nickname + '</strong>';
		}

		if (isPost && !!details.imageUrl) {
			what = 'nel suo post una nuova <strong>immagine</strong>';
			if (inputObj.category == 'ha pubblicato questa immagine') {
				return msg + ' ' + what + '.';
			}
		}

		if (isProfile) {
			msg = 'ha aggiornato';
			if (actionKey == 'profileData') what = 'il suo <strong>profilo</strong>';
			if (actionKey == 'question') what = 'le sue <strong>Domande e Risposte</strong>';
			if (actionKey == 'loveHate') what = 'il suo <strong>Amo e Odio</strong>';
			return msg + ' ' + what + '.';
		}

		if (isGeotag) {
			var location = (details.position.tag) ? details.position.tag : details.position.location;
			msg = 'ha registrato';
			what = 'la sua <strong>posizione</strong> qui:';
			if (details.position.tag && details.position.location) {
				cite = '<cite>' + location + ' - ' + Bisia.Map.getCityFromLocation(details.position.location) + '</cite>';
			} else {
				cite = '<cite>' + location + '</cite>';
			}
			return msg + ' ' + what + ' ' + cite;
		}

		if (isPost && !!details.position && details.position.location && !isGeotag) {
			msg = 'ha segnalato';
			what = 'una nuova <strong>posizione</strong> sulla mappa:';
			cite = '<cite>' + details.position.location + '</cite>';
			return msg + ' ' + what + ' ' + cite;
		}

		var spec = '';
		if (isPost && !!inputObj.category && !isGeotag) {
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

		if (isJoin) {
			var m = moment(inputObj.eventDateTime);
			var weekday = m.format('dddd');
			var number = m.format('DD');
			var month = m.format('MMMM');
			var time = m.format('HH:mm');

			msg = 'parteciperà';
			what = 'all\'evento <strong>' + inputObj.eventTitle + '</strong> che si terrà <strong>' + weekday + ' ' + number + ' ' + month + '</strong> alle ore <strong>' + time + '</strong>';
			cite = 'presso: <strong>' + inputObj.eventLocation + '</strong>';
			return msg + ' ' + what + ' ' + cite;
		}


		return msg + ' ' + what + spec + '.';
	},

	/**
	 * Returns message post vote
	 * @param  {[type]} success [description]
	 * @param  {[type]} gender  [description]
	 * @return {[type]}         [description]
	 */
	postVoteMessage: function(success, gender) {
		if (success) {
			switch (gender) {
				case 'male':
				case 'female':
					return 'ti ringrazia per il tuo voto!';
			}
		} else {
			switch (gender) {
				case 'male':
					return 'è già stato votato per oggi!';
				case 'female':
					return 'è già stata votata per oggi!';
			}
		}
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
		var obj = {
			targetId: targetId,
			action: action,
			isRead: isRead,
			isBroadcasted: true
		};

		if (arguments[3]) {
			obj = _.extend(obj, {
				actionKey: arguments[3]
			});
		}

		return obj;
	},

	/**
	 * Reset an action notification
	 * @param  {String} action
	 * @return {Void}
	 */
	resetNotify: function(action) {
		this.notifyClasses = _.without(this.notifyClasses, action);
		var actionKey = arguments[1] || null;
		var actionId = arguments[2] || null;
		Meteor.call('resetNotification', action, actionKey, actionId, function() {
			Bisia.Audio.justPlayed = false;
		});
	},

	/**
	 * Get email or false if not notifyMail
	 * @param  {String} userId
	 * @return {String|Boolean}
	 */
	shouldSendEmail: function(userId) {
		if (userId != Meteor.userId()) {
			var user = Users.findOne(userId, {'fields': {emails:1, profile:1}});
			if (user && user.profile.notifyMail && !user.profile.online) {
				return {
					email: user.emails[0].address,
					username: Meteor.user()['username']
				};
			}
		}
		return false;
	},

	/**
	 * [showNewUserHint description]
	 * @return {[type]} [description]
	 */
	showNewUserHint: function() {
		if (Meteor.userId()) {
			var parent = this;
			Meteor.setTimeout(function() {
				var user = Meteor.user();
				if (user && user.profile) {
					if (Meteor.userId() && !user.profile.flags || (user.profile.flags && !user.profile.flags.newUserHint)) {
						// get wrapper
						parent.$wrapper = $('.wrapper');
						// if menu not visible
						if (parent.$wrapper.find('.body-wrapper').css('left') == '0px') {
							// Open sidebar
							parent.$wrapper.addClass('sidebar-open-left closing-left');
						}
						// get menu list
						parent.$menuList = $('.menu-list');
						// wait 1 sec.
						Meteor.setTimeout(function() {
							// Scroll bottom and highlight settings
							parent.$menuList.animate({ scrollTop: parent.$menuList[0].scrollHeight })
											.find('.fa-cog')
											.addClass('highlight');
							// Set title for the popup
							var title = (user.profile.gender == 'male') ? 'Benvenuto' : 'Benvenuta';
							title = title + ' in Bisia!';
							// Show popup
							Bisia.Ui.setReactive('info', {
								template: 'welcomeNewUser',
								user: user,
								title: title
							});
						}, 1 * 1000);
					}
				}
			}, 3 * 1000);
		}
	},

	/**
	 * [showChatRoomHint description]
	 * @return {[type]} [description]
	 */
	showChatRoomHint: function() {
		if (Meteor.userId()) {
			var parent = this;
			var user = Meteor.user();
			if (Meteor.userId() && !user.profile.flags || (user.profile.flags && !user.profile.flags.chatRoomHint)) {
				Meteor.setTimeout(function() {
					// Show popup
					Bisia.Ui.setReactive('info', {
						template: 'chatRoomHint',
						title: 'Come usare la Bisia-Chat?'
					});
				}, 3 * 1000);
			}
		}
	}

}