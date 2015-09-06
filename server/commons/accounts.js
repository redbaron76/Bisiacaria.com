// Check Bisia Page like
var isBisiaLiked = function(accessToken) {
	var bisia = Meteor.http.get('https://graph.facebook.com/me/likes/112762045472584', {
		params: { access_token: accessToken }
	});

	console.log(bisia);

	return (bisia.data[0] && bisia.data[0].id == '112762045472584') ? true: false;
}

// Triggered whenever a login is attempted
Accounts.validateLoginAttempt(function(attempt) {
	if (attempt.user && attempt.user.emails && !attempt.user.emails[0].verified ) {
		throw new Meteor.Error('invalid-login', 'Indirizzo e-mail non ancora verificato via mail');
		// the login is aborted
	}

	/*if (attempt.type == 'facebook' && Meteor.settings.public.sitePreview) {
		var user = attempt.user;
		var accessToken = user.services.facebook.accessToken;
		// Check like Bisiacaria.com
		var likeBisia = isBisiaLiked(accessToken);

		if (!likeBisia) {
			Users.update(user._id, { '$set': { 'profile.likeBisia': likeBisia } });
			throw new Meteor.Error('no-like', 'Clicca su "Mi piace" nella Pagina Facebook di Bisiacaria.com per poter utilizzare questo Beta-Test.');
		}
	}*/

	return true;
});

// Triggered on create user
Accounts.onCreateUser(function(options, user) {

	// Register with user account
	if (user.services.password) {
		if (options.profile) {
			// Copy options.profile to user.profile
			user.profile = options.profile;

			// Send verification email
			Meteor.setTimeout(function() {
				Accounts.sendVerificationEmail(user._id);
			}, 2 * 1000);
		}
	}

	// Register with facebook
	if (user.services.facebook) {
		var accessToken = user.services.facebook.accessToken;
		// Get facebook info
		//result = Meteor.http.get('https://graph.facebook.com/me?fields=id,name,username,gender,email,birthday,bio,hometown,picture', {
		var result = Meteor.http.get('https://graph.facebook.com/me', {
			params: {
				access_token: accessToken
			}
		});

		// log(result);
		if (result.error)
			Bisia.log(result.error);

		if (result.data) {

			var cleanUsername = Bisia.normalizeUsername(result.data.name);

			// check duplicates
			anotherUsername = Users.find({ 'username': { '$regex': '^'+cleanUsername+'$', '$options': 'i' }});
			if (anotherUsername.count() > 0) {
				cleanUsername = cleanUsername + (anotherUsername.count() + 1);
			}

			user.username = cleanUsername;

			var profile = {};

			profile.gender 		= result.data.gender;
			profile.status 		= 'none'		// busy | none | free
			profile.birthday	= (result.data.birthday) ? moment(result.data.birthday).format('DD-MM-YYYY') : null;
			profile.birthdate	= (result.data.birthday) ? moment(result.data.birthday, 'DD-MM-YYYY', true).toDate() : null;
			profile.city 		= (result.data.hometown) ? result.data.hometown.name : "Facebook";
			profile.bio			= (result.data.bio) ? result.data.bio : null;

			var fbId 			= result.data.id;

			if (fbId) {
				profile.avatar = 'http://res.cloudinary.com/bisiacaria-com/image/facebook/w_200,h_200,c_fill,g_faces/'+fbId+'.jpg';
				profile.picture = 'http://res.cloudinary.com/bisiacaria-com/image/facebook/'+fbId+'.jpg';
			} else {
				profile.avatar = '';
				profile.picture = '';
			}

			profile.loggedWith	= 'facebook';
			user.profile = profile;

			// Create emails property
			var emails = [];
			var email = {};
			email.address 		= result.data.email;
			email.verified		= true;
			emails.push(email);
			user.emails = emails;
		}
	}

	// Set blocked array
	user.blocked = [];

	// add audio and mail notification true by default
	user.profile.notifyAudio = true;
	user.profile.notifyMail = true;

	return user;
});
