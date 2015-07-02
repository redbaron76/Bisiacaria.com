

/*Meteor.setTimeout(function() {
	rebuildFriends();
	rebuildVotes();
}, 10 * 1000);*/

Meteor.methods({
	adminCommand: function(command) {
		var callable = Bisia.Automator[command];
		if (_.isFunction(callable)) {
			callable();
			return "Comando " + command + " eseguito!";
		}

		throw new Meteor.Error("no-command", "Il comando non esiste.");
	}
})