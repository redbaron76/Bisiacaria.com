// Events
Events = new Mongo.Collection('events');

Events.allow({
	update: function(userId, post, fieldNames, modifier) {
		var allowedFields = ['joiners', 'visitors'];
		return _.indexOf(allowedFields, fieldNames[0]) >= 0;
	},
	remove: function(userId, event) { return Bisia.User.ownsDocument(userId, event); }
});