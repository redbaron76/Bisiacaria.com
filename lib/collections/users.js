// Mimic a normal collection
Users = Meteor.users;

Users.allow({
	update: function(userId, post) { return Bisia.User.ownsDocument(userId, post); },
	remove: function(userId, post) { return Bisia.User.ownsDocument(userId, post); }
});