// Users Methods
Meteor.methods({
	loginFacebook: function(login) {
		return Bisia.Session.logInOuts(login.userId, login.service, true, headers.methodClientIP(this));
	},
	loginUser: function(login) {
		return Bisia.Session.logInOuts(login.userId, login.service, true, headers.methodClientIP(this));
	},
	logoutUser: function(logout) {
		return Bisia.Session.logInOuts(logout.userId, logout.service, false, headers.methodClientIP(this));
	},
	registerUser: function(userAttr) {
		check(userAttr, {
			username: String,
			email: String,
			password: String,
			passwordConfirmed: String,
			profile: {
				city: String,
				gender: String,
				birthday: String,
				status: String,
				online: Boolean,
				loggedWith: String
			}
		});

		// Extend userAttr with now flags
		var now = new Date();
		_.extend(userAttr, {
			'profile.loginSince': now,
		});

		var errors = Bisia.Validation.validateRegister(userAttr);
		if (Bisia.has(errors))
			throw new Meteor.Error('invalid-register', 'Impossibile completare la registrazione');

		var usernameTaken = Users.findOne({ 'username': userAttr.username });
		if (usernameTaken)
			errors.username = "Questo username è già usato o non disponibile";

		var emailTaken = Users.findOne({ 'emails.address': userAttr.email });
		if(emailTaken)
			errors.email = "Questa e-mail è già usata da un altro utente";

		if (Bisia.has(errors)) return {	errors: errors };

		var userId = Accounts.createUser(userAttr);

		return {
			_id: userId,
			password: userAttr.password
		};
	},
	saveProfileData: function(dataAttr, currentUser) {
		check(dataAttr, {
			username: String,
			profile: {
				bio: String,
				city: String,
				birthday: String,
				status: String
			}
		});

		var errors = Bisia.Validation.validateProfileData(dataAttr);

		var usernameTaken = Users.findOne({ 'username': dataAttr.username, '_id': { $ne: currentUser } });
		if (usernameTaken)
			errors.username = "Questo username è già usato o non disponibile";

		if (Bisia.has(errors)) return {	errors: errors };

		var userId = Users.update(currentUser, { $set: {
			'username': dataAttr.username,
			'profile.bio': dataAttr.profile.bio,
			'profile.birthday': dataAttr.profile.birthday,
			'profile.city': dataAttr.profile.city,
			'profile.status': dataAttr.profile.status,
			'profile.lastUpdate': new Date()
		}});

		return true;
	},
	saveAccountData: function(dataAttr, currentUser) {
		check(dataAttr, {
			email: String,
			password: String,
			passwordConfirmed: String
		});

		var errors = Bisia.Validation.validateAccountData(dataAttr);

		// Check if it's my usual email
		var myEmail = Users.findOne({ '_id': currentUser, 'emails.address': dataAttr.email });
		if (! myEmail) {	// Changed email
			// Check for not used email
			var emailTaken = Users.findOne({ 'emails.address': dataAttr.email, '_id': { $ne: currentUser } });
			if(emailTaken) {
				errors.email = "Questa e-mail è già usata da un altro utente";
			} else {
				Users.update({ '_id': currentUser }, { $set: { 'emails': [{ address: dataAttr.email, 'verified': false }] } });
				// Invia link di verifica nuova mail
				Accounts.sendVerificationEmail(currentUser);
				Meteor.users.update({ '_id': currentUser }, { $set: { "services.resume.loginTokens" : [] } });
			}
		}

		if (Bisia.has(errors)) return {	errors: errors };

		// Check password
		if (Bisia.Validation.notEmpty('password', dataAttr)) {
			Accounts.setPassword(currentUser, dataAttr.password);
			// success.email = "La password è stata modificata!";
		}

		return true;
	},
	saveQuestion: function(questionObj, currentUser) {
		if (questionObj && currentUser) {
			Users.upsert(currentUser, { $set: { 'profile.question': questionObj }});
		}
		return true;
	},
	saveLoveHate: function(questionObj, currentUser) {
		if (questionObj && currentUser) {
			Users.upsert(currentUser, { $set: { 'profile.lovehate': questionObj }});
		}
		return true;
	}
});