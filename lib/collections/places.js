// Places
Places = new Mongo.Collection('places');

Places.allow({
	update: function(userId, post, fieldNames, modifier) {
		var allowedFields = ['joiners', 'joinersCount'];
		return _.indexOf(allowedFields, fieldNames[0]) >= 0;
	},
	remove: function(userId, place) {
		return Bisia.User.ownsDocument(userId, place);
	}
});