Template.timeDelete.helpers({
	formatTime: function() {
		var itsMine = (this.data.authorId == Meteor.userId()) ? true : false;
		var format = this.format || 'DD MMM HH:mm';
		var look = this.look || 'createdAt';
		var dateTime = this.data[look];
		var className = 'time';
		var isFuture = false;
		var dataAction = '';

		var beatTime = Bisia.Time.beatTime.get();
		// var now = Bisia.Time.now();
		var m = moment(dateTime)/*.subtract(5, 'seconds')*/;
		var displayDateTime = m.format(format);

		// Back of 2 mins and check it's still fmore of beatTime
		if (m.subtract(2, 'm').isAfter(beatTime)) {
			format = '[uscirà] ' + format;
			displayDateTime = m.add(2, 'm').format(format);
			className = className + ' future';
			isFuture = true;
		}

		if (itsMine) {
			className = className + ' actions';
			dataAction = 'actions';
		}

		//check for not more 24h
		if (!isFuture && dateTime > moment(beatTime).subtract(24, 'hour').toDate()) {
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
	'click [data-action=actions]': function(e, t) {
		e.preventDefault();
		var context = this;

		context.infoTitle = 'Cosa vuoi fare?';
		context.infoText = "Modificare o eliminare definitivamente questo elemento?";

		Bisia.Ui.setReactive('info', {
			template: 'infoActions',
			context: context
		});
	}
});