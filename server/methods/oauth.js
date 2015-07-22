Meteor.methods({
	userAddOAuthCredentials: function(token, secret, service) {
		var services = Meteor.user().services;
		var userId = Meteor.userId();

		if (service == 'facebook') {
			var serviceName = "Facebook";
			var data = Package.facebook.Facebook.retrieveCredential(token, secret) || {};
			if (data && data.serviceName == 'facebook' && data.serviceData) {
				services.facebook = data.serviceData;
				var serviceSearch = { 'services.facebook.id': services.facebook.id };

				var alreadyLinked = Meteor.users.findOne(serviceSearch);

				if (alreadyLinked) {
					if (alreadyLinked._id == userId) {
						throw new Meteor.Error(500, "Il tuo account " + serviceName + " è già collegato al tuo profilo.");
					} else {
						throw new Meteor.Error(500, "La sessione di " + serviceName + " attiva appartiene ad un altro utente.<br><br>Fai logout da Facebook e riprova.");
					}
				}

				Users.update(userId, { '$set': { 'services': services } });
				if (data.serviceData.email && ! _.contains(Meteor.user().emails, data.serviceData.email)) {
					Users.update(userId, { '$push': { 'emails': { 'address': data.serviceData.email, verified: true } } } );
				}

				Accounts.addAutopublishFields({
					forLoggedInUser: ['services.facebook'],
					forOtherUsers: ['services.facebook.id', 'services.facebook.username', 'services.facebook.gender']
				});
			}
		}
	},
	userRemoveOAuthCredentials: function() {
		var userId = Meteor.userId();
		Users.update(userId, { '$unset': { 'services.facebook': '' } });
		return true;
	}
});