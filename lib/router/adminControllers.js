// ADMIN CONTROLLER
AdminCommandController = LoggedController.extend({
	getCommand: function() {
		return this.params.command;
	},
	onRun: function() {
		Meteor.call('adminCommand', this.getCommand(), function(error, success) {
			if (error) alert(error);
			if (success) alert(success);
		});
	},
	action: function() {
		this.render('homePage');
	}
});