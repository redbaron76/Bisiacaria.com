// Profile Methods
Meteor.methods({
	knowUser: function(friendObj) {
		check(this.userId, String);
		check(friendObj, {
			targetId: String,
			check: Boolean
		});

		var user = Meteor.user();
		var isFriend = friendObj.check;

		// Remove check field
		friendObj = _.omit(friendObj, 'check');

		if (user._id == friendObj.targetId)
			throw new Meteor.Error('error-know', 'Non puoi conoscere te stesso!');

		var friend = _.extend(friendObj, {
			userId: user._id,
			createdAt: Bisia.Time.serverTime
		});

		// Block if targetId is blocked
		if (Bisia.User.isBlocked(friendObj.targetId))
			return true;

		if (isFriend) {
			Users.update(friendObj.targetId, { $addToSet: { 'friends': user._id } });
			friend._id = Friends.insert(friendObj);
			// Notify friendship to target user
			Bisia.Notification.emit('friend', {
				userId: user._id,
				targetId: friend.targetId,
				actionId: friend._id
			});
		} else {
			Users.update(friendObj.targetId, { $pull: { 'friends': user._id } });
			Friends.remove({ 'userId': user._id, 'targetId': friendObj.targetId });
			Notifications.remove({ 'userId': user._id, 'targetId': friendObj.targetId, 'isRead': false });
		}

	},
	visitUser: function(visitObj) {
		check(this.userId, String);
		check(visitObj, {
			targetId: String
		});

		var user = Meteor.user();

		if (user._id == visitObj.targetId)
			return;

		var flooding = Notifications.findOne({
			'action': 'visit',
			'userId': user._id,
			'targetId': visitObj.targetId,
			'createdAt': {
        		$gt: Bisia.Time.timeAgo(Bisia.Notification.timeLimitFlood * 60 * 1000)		// <
			}
		});

		if (flooding && Bisia.Notification.enableFloodProtect)
			throw new Meteor.Error('error-visit', 'Sei tornato a visitare troppo velocemente');

		var visit = _.extend(visitObj, {
			userId: user._id,
			createdAt: Bisia.Time.serverTime
		});

		// Get people blocked
		var blockIds = Bisia.User.getBlockIds(this.userId);

		return Bisia.Notification.emit('visit', visit, blockIds);
	},
	voteUser: function(voteObj) {
		check(this.userId, String);
		check(voteObj, {
			targetId: String
		});

		var user = Meteor.user();

		if (user._id == voteObj.targetId)
			throw new Meteor.Error('error-vote', 'Non puoi votare te stesso!');

		// Already voted for today
		var alreadyVotedToday = Votes.findOne({
			'userId': user._id,
			'targetId': voteObj.targetId,
			'createdAt': {
				$gte: Bisia.Time.todayStart(),	// >
        		$lte: Bisia.Time.todayEnd()		// <
			}
		});

		if (alreadyVotedToday)
			throw new Meteor.Error('invalid-vote', 'Oggi hai già votato questo utente!');

		// Block if targetId is blocked
		if (Bisia.User.isBlocked(voteObj.targetId))
			return true;

		var vote = _.extend(voteObj, {
			userId: user._id,
			createdAt: Bisia.Time.serverTime
		});

		Users.update(voteObj.targetId, { $inc: { 'profile.votesCount': 1 } });
		vote._id = Votes.insert(vote);

		// Notify vote to target user
		Bisia.Notification.emit('vote', {
			userId: user._id,
			targetId: vote.targetId,
			actionId: vote._id
		});

		return vote._id;
	},
	saveNewPost: function(formObj, myFollowers) {
		check(this.userId, String);
		check(formObj, {
			text: String,
			category: String,
			dateTimePost: Date,
			imageUrl: String,
			position: Object
		});

		var user = Meteor.user();
		var postObj = _.extend(formObj, {
			authorId: user._id,
			createdAt: Bisia.Time.serverTime
		});

		var errors = Bisia.Validation.validateNewPost(postObj);

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		// add category if any and not present
		if (!!postObj.category)
			Users.update(user._id, { $addToSet: { 'profile.categories': postObj.category } });

		// add counter arrays
		postObj = _.extend(postObj, {
			likes: [],
			unlikes: [],
			comments: []
		});

		// Insert into collection
		postObj._id = Posts.insert(postObj);

		var details = {
			imageUrl: postObj.imageUrl,
			position: postObj.position
		};

		//Notify to all followers
		_.each(myFollowers, function(el) {
			Bisia.Notification.emit('news', {
				userId: user._id,
				targetId: el,
				actionId: postObj._id,
				actionKey: 'post',
				message: Bisia.Notification.postEventMsg('post', postObj, details)
			}, postObj.dateTimePost);
		});

		return true;
	},
	saveNewEvent: function(formObj, myFollowers) {
		check(this.userId, String);
		check(formObj, {
			text: String,
			titleEvent: String,
			locationEvent: String,
			dateTimeEvent: Date,
			imageUrl: String,
			position: Object
		});

		var user = Meteor.user();
		var eventObj = _.extend(formObj, {
			authorId: user._id,
			createdAt: Bisia.Time.serverTime,
			joins: [],
			comments: []
		});

		var errors = Bisia.Validation.validateNewEvent(eventObj, 'SERVER');

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		// Insert into collection
		eventObj._id = Events.insert(eventObj);

		var details = {
			text: eventObj.text,
			imageUrl: eventObj.imageUrl,
			position: eventObj.position
		};

		//Notify to all followers
		_.each(myFollowers, function(el) {
			Bisia.Notification.emit('news', {
				userId: user._id,
				targetId: el,
				actionId: eventObj._id,
				actionKey: 'event',
				message: Bisia.Notification.postEventMsg('event', eventObj, details)
			});
		});

		return true;
	},
	newsletterSignup: function(email) {
		check(this.userId, String);
		check(email, String);
		if (email) {
			var mailingLists = new MailChimpLists();
			var params = {
				id: Meteor.settings.private.MailChimp.listId,
				email: {
					email: email
				},
				merge_vars: {
					'QUESTION': 'SI'
				}
			};

			mailingLists.subscribe(params);
			return true;
		}
	}
});