// Users Methods
Meteor.methods({
	// Perform hearthBeat server side
	hearthBeat: function() {
		if (this.userId) {
			var now = new Date();
			Sessions.upsert({ 'userId': this.userId
			},{	$set: {	'loginCheck': now }});
			// Bisia.log('loginCheck', moment(now).toDate());
		}
	}
});