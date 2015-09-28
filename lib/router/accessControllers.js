// ACCESS CONTROLLER
AccessController = RouteController.extend({
	getEventId: function() {
		return this.params.eventId;
	},
	getUserId: function() {
		return this.params.userId;
	},
	subscriptions: function() {
		this.pageReady = Meteor.subscribe('accessCheck', this.getEventId(), this.getUserId());
	},
	data: function() {
		var parent = this;
		if (this.pageReady.ready()) {
			var user = Users.findOne(this.getUserId());
			var event = Access.findOne({ 'eventId': this.getEventId() });
			if (event && user) {
				var status, message, icon;
				var joiner = _.findWhere(event.joiners, {
					'_id': parent.getUserId()
				});

				if (joiner) {
					var loggedSince = moment().diff(joiner.joinedAt, 'seconds');
					// joiner signup since 10 seconds
					if (user && loggedSince <= 10) {
						status = 'green';
						icon = 'fa-check';
						message = user.username;
					} else if (user && joiner && loggedSince > 10) {
						status = 'yellow';
						icon = 'fa-question';
						message = user.username + '<br>utente già presente';
					}
				} else {
					status = 'red';
					icon = 'fa-times';
					message = 'utente non valido';
				}

			} else {
				status = 'red';
				icon = 'fa-times';
				message = 'utente non valido';
			}

			return {
				user: user,
				icon: icon,
				event: event,
				status: status,
				message: message
			};
		}
	}
});