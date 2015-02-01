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
			username: user.username,
			profile: {
				gender: user.profile.gender,
				avatar: user.profile.avatar,
				status: user.profile.status,
			},
			createdAt: Bisia.Time.now()
		});

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

		var visit = _.extend(visitObj, {
			userId: user._id,
			username: user.username,
			profile: {
				gender: user.profile.gender,
				avatar: user.profile.avatar,
				status: user.profile.status,
			},
			createdAt: Bisia.Time.now()
		});

		return Bisia.Notification.emit('visit', visit);
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

		var vote = _.extend(voteObj, {
			userId: user._id,
			username: user.username,
			profile: {
				gender: user.profile.gender,
				avatar: user.profile.avatar,
				status: user.profile.status,
			},
			createdAt: Bisia.Time.now()
		});

		Users.update(voteObj.targetId, { $inc: { votesCount: 1 } });
		vote._id = Votes.insert(vote);

		// Notify vote to target user
		Bisia.Notification.emit('vote', {
			userId: user._id,
			targetId: vote.targetId,
			actionId: vote._id
		});

		return vote._id;
	}
});