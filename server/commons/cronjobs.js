// Cron Jobs

// Delete users with scheduledDelete set on profile
SyncedCron.add({
	name: 'deleteUser',
	schedule: function(parser) {
		return parser.text('at 05:30');
	},
	job: function() {
		return Bisia.Automator.deleteUsersFromBisia();
	}
});

// Delete notifications read older than a week
SyncedCron.add({
	name: 'deleteNotifications',
	schedule: function(parser) {
		return parser.text('at 05:45');
	},
	job: function() {
		return Bisia.Automator.deleteOldNotifications();
	}
});

// Send notification email messages
SyncedCron.add({
	name: 'sendEmail',
	schedule: function(parser) {
		// return parser.text('every 2 hours');
		return parser.text('at 07:45 and 12:35 and 18:45 and 22:45');
	},
	job: function() {
		return Bisia.Automator.emailNotifications();
	}
});

// Send notification you miss since 15 days
SyncedCron.add({
	name: 'sendYouMissFromBisia',
	schedule: function(parser) {
		return parser.text('on Monday at 06:30');
	},
	job: function() {
		return Bisia.Automator.emailRecall();
	}
});

// Chat Room Ban
SyncedCron.add({
	name: 'chatRoomBan',
	schedule: function(parser) {
		return parser.text('every 3 minutes');
	},
	job: function() {
		return Bisia.Automator.chatRoomBanUsers();
	}
});

// recharge poker credits every day at 00:00:05 except on Monday
SyncedCron.add({
	name: 'rechargePokerCredits',
	schedule: function(parser) {
		return parser.text('at 00:01 and 12:01');
	},
	job: function() {
		return Bisia.Poker.rechargeCredits();
	}
});

// reset poker week
SyncedCron.add({
	name: 'resetPokerWeek',
	schedule: function(parser) {
		return parser.text('on Monday at 00:01');
	},
	job: function() {
		return Bisia.Poker.resetPokerWeek();
	}
});