Template.timeDelete.helpers({
	formatTime: function() {
		var itsMine = (this.data.authorId == Meteor.userId()) ? true : false;
		var format = this.format || 'ddd DD MMM HH:mm';
		var look = this.look || 'createdAt';
		var dateTime = this.data[look];
		var className = 'time';
		var isFuture = false;
		var dataAction = '';

		var beatTime = Bisia.Time.beatTime.get();
		var now = Bisia.Time.now();
		var m = moment(dateTime);

		var displayDateTime = m.format(format);

		if (itsMine) {
			className = 'time delete';
			dataAction = 'delete';
		}

		if (m.isAfter(now)) {
			format = '[uscirà] ' + format;
			displayDateTime = m.format(format);
			className = className + ' future';
			isFuture = true;
		}

		//check for not more 24h
		if (!isFuture && dateTime > moment(now).subtract(24, 'hour').toDate()) {
			displayDateTime = m.from(beatTime);
		}

		return {
			context: this,
			itsMine: itsMine,
			className: className,
			dataAction: dataAction,
			displayTime: displayDateTime
		}

	}
});

Template.timeDelete.events({
	'click [data-action=delete]': function(e, t) {
		e.preventDefault();
		var item;

		switch (this.context.data.delete) {
			case 'post':
				item = 'post';
				break;
			case 'comment':
			case 'commentEvent':
				item = 'commento'
				break;
		}

		var obj = _.extend(this.context.data, {
			infoTitle: "Eliminare questo "+item+"?",
			infoText: "Il "+item+" da te inserito verrà definitivamente eliminato e non sarà più recuperabile."
		});

		switch (obj.delete) {
			case 'post':
				Bisia.Ui.confirmDialog('Bisia.Delete.post', e, obj);
				break;
			case 'comment':
				Bisia.Ui.confirmDialog('Bisia.Delete.postComment', e, obj);
				break;
			case 'commentEvent':
				Bisia.Ui.confirmDialog('Bisia.Delete.eventComment', e, obj);
				break;
		}
	}
});