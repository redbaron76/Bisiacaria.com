// Publish sessions
Meteor.publish('sessions', function() {
	var fields = {
		'userId': true,
		'loginCheck': true
	};

	return Sessions.find({}, {	fields: fields	});
});