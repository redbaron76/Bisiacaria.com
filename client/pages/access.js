Template.accessStatus.onCreated(function() {

});

Template.accessStatus.helpers({
	eventTime: function() {
		if (this.event && this.event.scheduledAt) {
			return moment(this.event.scheduledAt).format('dddd DD MMMM YYYY');
		}
	}
});