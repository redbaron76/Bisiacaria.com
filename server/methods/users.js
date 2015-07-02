// Users Methods
Meteor.methods({
	getIp: function() {
		return headers.methodClientIP(this);
	},
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
			verifyKey: String,
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

		var blockPreviuser = false, userVerified = false;

		// Check name or nick
		if (Meteor.settings.public.sitePreview) {
			if (userAttr.verifyKey) {
				var oldDate = null;
				var key = userAttr.verifyKey.replace(/ /g, '').toUpperCase();
				var previuser = Previusers.findOne({
					'checkedAt': { '$exists': false },
					'$or': [
						{ 'name': key },
						{ 'nickname': key }
					]
				});

				if (previuser) {
					// flag the check date
					Previusers.update(previuser._id, { '$set': { 'username': userAttr.username, 'checkedAt': new Date() } });
					if (previuser.date) {
						userAttr['profile']['memberFrom'] = moment(previuser.date, 'YYYYMMDD HH:mm:ss', true).toDate();
					}
					blockPreviuser = false;
					userVerified = true;
				}

				// Check newsletter code
				if (key == Meteor.settings.public.newsletterCode) {
					var previuser = Previusers.findOne({
						'checkedAt': { '$exists': false },
						'email': userAttr.email
					});

					if (previuser) {
						Previusers.update(previuser._id, { '$set': { 'username': userAttr.username, 'checkedAt': new Date() } });
						blockPreviuser = false;
						userVerified = true;
					}
				}

				blockPreviuser = true;
			}
			blockPreviuser = true;
		}

		// Extend userAttr with now flags
		userAttr['profile']['loginSince'] = new Date();
		userAttr['profile']['birthdate'] = moment(userAttr.profile.birthday, 'DD-MM-YYYY', true).toDate();

		var errors = Bisia.Validation.validateRegister(userAttr);

		if (blockPreviuser && ! userVerified)
			errors.previuser =  "Non è stato possibile autorizzare la tua iscrizione con il NOME e COGNOME o il NICKNAME immesso.<br><br>" +
								"Assicurati di aver usato lo stesso NICKNAME o lo stesso NOME e COGNOME che ci hai comunicato su GROWISH o durante il contributo a mano.<br><br>" +
								"Contattaci per chiarimenti su bisiacaria@gmail.com o sulla Pagina Facebook di Bisiacaria.com|exec";

		var usernameTaken = Users.findOne({ 'username': userAttr.username });
		if (usernameTaken)
			errors.username = Bisia.Login.messages.nicknameInUse + "|exc";

		var emailTaken = Users.findOne({ 'emails.address': userAttr.email });
		if(emailTaken)
			errors.email = Bisia.Login.messages.emailInUse + "|exc";

		if (Bisia.has(errors)) return Bisia.serverErrors(errors);

		var userId = Accounts.createUser(userAttr);

		Bisia.Log.info('register user', userAttr);

		return true;
	},
	saveProfileData: function(dataAttr, currentUsername) {
		check(currentUsername, String);
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

		var profileObj = {
			'username': dataAttr.username,
			'profile.bio': dataAttr.profile.bio,
			'profile.birthday': dataAttr.profile.birthday,
			'profile.birthdate': moment(dataAttr.profile.birthday, 'DD-MM-YYYY', true).toDate(),
			'profile.city': dataAttr.profile.city,
			'profile.status': dataAttr.profile.status,
			'profile.lastUpdate': new Date()
		};

		var userId = Users.update(currentUser, { $set: profileObj });

		// Log profile update
		Bisia.Log.info('profile data', profileObj);

		if (currentUsername != dataAttr.username && dataAttr._id == Meteor.userId()) {
			// nickname changed
			Bisia.Notification.notifyMyFollowers('note', 'nicknameChanged', profileObj, { nickname: currentUsername });
		} else {
			Bisia.Notification.notifyMyFollowers('note', 'profileData', profileObj, {});
		}


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
			Bisia.Log.info('profile questions', questionObj);
			Bisia.Notification.notifyMyFollowers('note', 'question', questionObj, {});
		}
		return true;
	},
	saveLoveHate: function(questionObj) {
		var currentUser = Meteor.userId();
		if (questionObj && currentUser) {
			Users.upsert(currentUser, { $set: { 'profile.lovehate': questionObj }});
			Bisia.Log.info('profile lovehate', questionObj);
			Bisia.Notification.notifyMyFollowers('note', 'loveHate', questionObj, {});
		}
		return true;
	},
	unblockUser: function(unblockId) {
		check(this.userId, String);
		check(unblockId, String);
		// Delete from blocked user
		Users.update(unblockId, { $pull: { 'blockBy': this.userId } });
		// Delete blocked from user
		Users.update(this.userId, { $pull: { 'blocked': unblockId } });
		return true;
	},
	blockUser: function(chatId) {
		check(this.userId, String);
		check(chatId, String);

		// get userId to block
		var message = Messages.findOne({ 'chatId': chatId });
		var blockId = (message.targetId == this.userId) ? message.userId : message.targetId;

		// Insert to blocked user
		Users.update(blockId, { $addToSet: { 'blockBy': this.userId }, $pull: { 'followers': this.userId, 'following': this.userId } });
		// Insert blocked to user
		Users.update(this.userId, { $addToSet: { 'blocked': blockId }, $pull: { 'followers': blockId, 'following': blockId } });
		// Remove me from blocked followed
		Friends.remove({ 'targetId': this.userId, 'userId': blockId });
		// Remove blocked from my following
		Friends.remove({ 'targetId': blockId, 'userId': this.userId });

		Bisia.Log.info('block user', blockId);

		return true;
	},
	deleteUser: function() {
		check(this.userId, String);
		Users.update(this.userId, { $set: { 'scheduledDelete': Bisia.Time.now() } })
		return true;
	}
});