// Cron Jobs

// Delete users with scheduledDelete set on profile
SyncedCron.add({
	name: 'deleteUser',
	schedule: function(parser) {
		return parser.text('at 05:15 am');
	},
	job: function() {
		return Bisia.Automator.deleteUsersFromBisia();
	}
});

// Delete notifications read older than a week
SyncedCron.add({
	name: 'deleteNotifications',
	schedule: function(parser) {
		return parser.text('at 05:00 am');
	},
	job: function() {
		var olderThan = Bisia.Time.msWeek;
		Notifications.remove({
			'isBroadcasted': true,
			'isRead': true,
			'broadcastedAt': { '$lt': moment().subtract(7, 'days').toDate() }
		});
	}
});

// Send notification email messages
SyncedCron.add({
	name: 'sendEmail',
	schedule: function(parser) {
		return parser.text('every 10 minutes');
	},
	job: function() {
		return Bisia.Automator.emailNotifications();
	}
});

// Build homepage
/*SyncedCron.add({
	name: 'buildHomepage',
	schedule: function(parser) {
		return parser.text('every 15 minutes');
	},
	job: function() {
		return Bisia.Automator.homePageBuilder();
	}
});*/

// recharge poker credits every day at 00:00:05
SyncedCron.add({
	name: 'rechargePokerCredits',
	schedule: function(parser) {
		return parser.text('at 00:01 am');
	},
	job: function() {
		return Bisia.Poker.rechargeCredits();
	}
});