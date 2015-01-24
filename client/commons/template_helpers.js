Template.registerHelper('log', function() {
	console.log(this);
});

Template.registerHelper('isCordova', function() {
	return Meteor.isCordova;
});

// Check if mobile environment
Template.registerHelper('isiOS', function() {
	if(Meteor.isCordova) {
		var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
		return !!iOS;
	}
});

// Check mobile and add class if not
Template.registerHelper('addClass', function(classes) {
	if (!Meteor.isCordova) {
		return ' ' + classes;
	}
});

Template.registerHelper('addMobile', function(classes) {
	if (Meteor.isCordova) {
		var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
		if (iOS) classes = classes + ' ios';
		return ' ' + classes;
	}
});

// Print the title string if in data context
Template.registerHelper('printTitle', function(title) {
	if (title) {
		return title;
	} else {
		return (this.title) ? this.title : 'Bisiacaria.com';
	}
});

Template.registerHelper('hasModal', function() {
	return this.modal;
});

Template.registerHelper('hasOverlay', function() {
	return this.overlay;
});


// PROFILE

Template.registerHelper('getAge', function() {
	var user = arguments[0] || this;
	var birthday = moment(Bisia.User.getProfile("birthday", user));
	return birthday.fromNow(true);
});

Template.registerHelper('getEmail', function() {
	var user = arguments[0] || this;
	return Bisia.User.getUser("emails", user)[0].address;
});

Template.registerHelper('getGender', function() {
	var user = arguments[0] || this;
	return Bisia.User.getProfile('gender', user);
});

Template.registerHelper('getProfileUrl', function() {
	var user = arguments[0] || this;
	return Meteor.absoluteUrl(Bisia.User.getUser('username', user));
});

Template.registerHelper('getStatus', function() {
	var user = arguments[0] || this;
	return 'status-' + Bisia.User.getProfile('status', user);;
});

Template.registerHelper('statusGender', function() {
	var user = arguments[0] || this;
	var status = Bisia.User.getProfile('status', user);
	var gender = Bisia.User.getProfile('gender', user);
	return 'status-' + status + ' ' + gender;
});

Template.registerHelper('withFacebook', function() {
	var user = arguments[0] || this;
	return Bisia.User.getProfile('loggedWith') === 'facebook';
});

Template.registerHelper('mf', function(val1, val2) {
	var gender = Bisia.User.getProfile('gender', this);
	return (gender === 'male') ? val1 : val2;
});

// USER

Template.registerHelper('isOnline', function() {
	var user = arguments[0] || this;
	return Users.find({ '_id': user._id, 'profile.online': true }).count() > 0;
});

Template.registerHelper('itsMe', function() {
	var user = arguments[0] || this;
	return Bisia.User.getUser('_id', user) === Meteor.userId();
});