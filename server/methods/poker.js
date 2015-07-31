Meteor.methods({
	getDailyCreditLeft: function() {
		var config = Bisia.Poker.config;
		
		return config.dailyCredit;
	}
});