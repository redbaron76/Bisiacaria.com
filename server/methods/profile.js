// Profile Methods
Meteor.methods({
	knowUser: function(friendObj) {
		check(this.userId, String);
		check(friendObj, {
			targetId: String,
			check: Boolean
		});

		var parent = this;
		var user = Meteor.user();
		var isFriend = friendObj.check;

		// Remove check field
		friendObj = _.omit(friendObj, 'check');

		if (parent.userId == friendObj.targetId)
			throw new Meteor.Error('error-know', 'Non puoi conoscere te stesso!');

		var friend = _.extend(friendObj, {
			userId: parent.userId,
			createdAt: Bisia.Time.setServerTime()
		});

		// Block if targetId is blocked
		if (Bisia.User.isBlocked(friendObj.targetId))
			return true;

		if (isFriend) {
			// se non siamo già amici
			if (Friends.find({ 'targetId': friendObj.targetId, 'userId': this.userId }).count() == 0) {
				Users.update(friendObj.targetId, { $addToSet: { 'followers': parent.userId } });
				Users.update(parent.userId, { $addToSet: { 'following': friendObj.targetId } });
				friend._id = Friends.insert(friendObj);
				// Notify friendship to target user
				Bisia.Notification.emit('friend', {
					userId: parent.userId,
					targetId: friend.targetId,
					actionId: friend._id
				});
			}
		} else {
			Users.update(friendObj.targetId, { $pull: { 'followers': parent.userId } });
			Users.update(parent.userId, { $pull: { 'following': friendObj.targetId } });
			Friends.remove({ 'userId': parent.userId, 'targetId': friendObj.targetId });
			Notifications.remove({ 'userId': parent.userId, 'targetId': friendObj.targetId, 'isRead': false });
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
			// throw new Meteor.Error('error-visit', 'Sei tornato a visitare troppo velocemente');
			return false;

		var visit = _.extend(visitObj, {
			userId: user._id,
			createdAt: Bisia.Time.setServerTime(),
			message: 'ha visitato il tuo profilo.'
		});

		// Get people blocked
		var blockIds = Bisia.User.getBlockIds(this.userId);

		return Bisia.Notification.emit('visit', visit, blockIds);
	},
	voteUser: function(voteObj, gender) {
		check(this.userId, String);
		check(gender, String);
		check(voteObj, {
			targetId: String
		});

		var user = Meteor.user();

		if (user._id == voteObj.targetId)
			// throw new Meteor.Error('error-vote', 'Non puoi votare te stesso!');
			return;

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
			//throw new Meteor.Error('invalid-vote', 'è già stato votato per oggi!');
			return Bisia.Notification.postVoteMessage(false, gender);

		// Block if targetId is blocked
		if (Bisia.User.isBlocked(voteObj.targetId))
			return;

		var vote = _.extend(voteObj, {
			userId: user._id,
			createdAt: Bisia.Time.setServerTime()
		});

		Users.update(voteObj.targetId, { $inc: { 'profile.votesCount': 1 } });
		vote._id = Votes.insert(vote);

		// Notify vote to target user
		Bisia.Notification.emit('vote', {
			userId: user._id,
			targetId: vote.targetId,
			actionId: vote._id,
			message: 'ti ha inviato un nuovo voto.'
		});

		//return vote._id;
		return Bisia.Notification.postVoteMessage(true, gender);
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