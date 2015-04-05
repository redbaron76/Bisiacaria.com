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
		userAttr['profile']['loginSince'] = Bisia.Time.now();

		var errors = Bisia.Validation.validateRegister(userAttr);

		var usernameTaken = Users.findOne({ 'username': userAttr.username });
		if (usernameTaken)
			errors.username = Bisia.Login.messages.nicknameInUse + "|exc";

		var emailTaken = Users.findOne({ 'emails.address': userAttr.email });
		if(emailTaken)
			errors.email = Bisia.Login.messages.emailInUse + "|exc";

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		var userId = Accounts.createUser(userAttr);

		return true;
	},
	saveProfileData: function(dataAttr) {
		check(dataAttr, {
			username: String,
			profile: {
				bio: String,
				city: String,
				birthday: String,
				status: String
			}
		});

		// Bisia.log('dataAttr', dataAttr);

		var currentUser = Meteor.userId();
		var errors = Bisia.Validation.validateProfileData(dataAttr);

		var usernameTaken = Users.findOne({ 'username': dataAttr.username, '_id': { $ne: currentUser } });
		if (usernameTaken)
			errors.username = Bisia.Login.messages.nicknameInUse + "|exc";

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		var userId = Users.update(currentUser, { $set: {
			'username': dataAttr.username,
			'profile.bio': dataAttr.profile.bio,
			'profile.birthday': dataAttr.profile.birthday,
			'profile.city': dataAttr.profile.city,
			'profile.status': dataAttr.profile.status,
			'profile.lastUpdate': new Date()
		} });

		return true;
	},
	saveAccountData: function(dataAttr) {
		check(dataAttr, {
			email: String,
			password: String,
			passwordConfirmed: String
		});

		var currentUser = Meteor.userId();
		var errors = Bisia.Validation.validateAccountData(dataAttr);

		// Check if it's my usual email
		var myEmail = Users.findOne({ '_id': currentUser, 'emails.address': dataAttr.email });
		if (! myEmail) {	// Changed email
			// Check for not used email
			var emailTaken = Users.findOne({ 'emails.address': dataAttr.email, '_id': { $ne: currentUser } });
			if(emailTaken) {
				errors.email = Bisia.Login.messages.emailInUse + "|exc";
			} else {
				Users.update({ '_id': currentUser }, { $set: { 'emails': [{ address: dataAttr.email, 'verified': false }] } });
				// Send verification link through email
				Accounts.sendVerificationEmail(currentUser);
				// Logout user
				Meteor.users.update(currentUser, { $set: { "profile.online": false } });
			}
		}

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		// Check password
		if (Bisia.Validation.notEmpty('password', dataAttr)) {
			Accounts.setPassword(currentUser, dataAttr.password, { logout: false });
			Meteor.users.update(currentUser, { $set: { "profile.online": false } });
		}

		return true;
	},
	saveQuestion: function(questionObj) {
		var currentUser = Meteor.userId();
		if (questionObj && currentUser) {
			Users.upsert(currentUser, { $set: { 'profile.question': questionObj }});
		}
		return true;
	},
	saveLoveHate: function(questionObj) {
		var currentUser = Meteor.userId();
		if (questionObj && currentUser) {
			Users.upsert(currentUser, { $set: { 'profile.lovehate': questionObj }});
		}
		return true;
	}
});