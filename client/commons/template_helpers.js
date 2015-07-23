Template.registerHelper('sitePreview', function() {
	return Meteor.settings.public.sitePreview;
});

Template.registerHelper('log', function(val) {
	var value = val || 'log';
	console.log(value, this);
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

Template.registerHelper('addDevice', function() {
	switch(true) {
		case Meteor.Device.isTV():
			return ' tv';
		case Meteor.Device.isTablet():
			return ' tablet';
		case Meteor.Device.isPhone():
			return ' phone';
		case Meteor.Device.isDesktop():
			return ' desktop';
		case Meteor.Device.isBot():
			return ' bot';
	}
});

Template.registerHelper('showLayoutVersion', function() {
	if (!Session.get('layout')) {
		if (Meteor.Device.isDesktop())
			return 'show-desktop-full';
	} else {
		return Session.get('layout');
	}
});

// Print the title string if in data context
Template.registerHelper('printTitle', function(title) {
	var fullTitle;
	var topTitle = Meteor.settings.public.topTitle;
	var browserTitle = Meteor.settings.public.browserTitle;

	if (title) {
		return title;
	} else {
		if (this.title) {
			topTitle = this.title
			fullTitle = this.title + browserTitle;
			Bisia.Ui.browserTitle.set(fullTitle);
			Bisia.Ui.topTitle.set(this.title);
		} else {
			fullTitle = topTitle + browserTitle;
			Bisia.Ui.browserTitle.set(fullTitle);
			Bisia.Ui.topTitle.set(topTitle);
		}
		Bisia.Ui.setBrowserTitle();
	}
	return Bisia.Ui.topTitle.get();
});

Template.registerHelper('hasModal', function() {
	return this.modal;
});

Template.registerHelper('hasOverlay', function() {
	return this.overlay;
});

// HELPERS

Template.registerHelper('lowercase', function(text) {
	return text.toLowerCase();
});

Template.registerHelper('titleBuilder', function(text, placeholder) {
	var p = placeholder.replace(':', '');
	var replacer = this[p];
	return _.extend(this, {
		sectionTitle: text.replace(placeholder, replacer)
	});
});

Template.registerHelper('genericCounter', function(count, singLabel, plurLabel) {
	var label = (count == 1) ? singLabel : plurLabel;
	return count + ' ' + label;
});

Template.registerHelper('dateNow', function() {
	return moment().format('DD/MM/YYYY');
});

Template.registerHelper('timeNow', function() {
	return moment().format('HH:mm');
});

Template.registerHelper('timeAgo', function() {
	if (this.createdAt) {
		var dateAgo = moment(this.createdAt);
		if(dateAgo.toDate() < moment(Bisia.Time.now('server')).subtract(24, 'hour').toDate()) {
			return dateAgo.format('ddd DD MMM HH:mm');
		} else {
			// return dateAgo.from(Bisia.Time.beatTime.get());
			return dateAgo.fromNow();
		}
	}
	return '--:--';
});

Template.registerHelper('timeFormat', function() {
	if (this.createdAt) {
		var format = arguments[0] || 'ddd DD MMMM YYYY HH:mm';
		return moment(this.createdAt).format(format);
	}
	return '--:--';
});

Template.registerHelper('distance', function(lat, lng) {
	var dist = Bisia.Map.distInMeters(lat, lng);
	return parseFloat(dist).toFixed(2);
});

Template.registerHelper('onlyCity', function(location) {
	if (location && location != 'Posizione sconosciuta') {
		return '- ' + _.last(location.split(', '));
	}
});

// PROFILE

Template.registerHelper('getUserAuthor', function(userId) {
	var obj = arguments[1] || {};
	if (userId) {
		var user = Users.findOne({ '_id': userId }, { 'fields': {
			'username': 1,
			'profile.city': 1,
			'profile.gender': 1,
			'profile.status': 1,
			'profile.avatar': 1,
			'profile.online': 1,
			'profile.birthday': 1
		}});
		return _.extend(user, obj);
	}
	return obj;
});

Template.registerHelper('getAge', function() {
	var user = arguments[0] || this;
	var birthday = moment(Bisia.User.getProfile("birthday", user), 'DD-MM-YYYY', true);
	if (birthday.isValid()) {
		return moment().diff(birthday, 'years') + ' anni';
	}
	return '--';
});

Template.registerHelper('getEmail', function() {
	var user = arguments[0] || this;
	return Bisia.User.getUser("emails", user)[0].address;
});

Template.registerHelper('getGender', function() {
	var user = arguments[0] || this;
	return Bisia.User.getProfile('gender', user);
});

Template.registerHelper('getCity', function() {
	var user = arguments[0] || this;
	var city = Bisia.User.getProfile('city', user);
	var position = Bisia.User.getProfile('position', user);
	if (position) {
		return (position.tag) ? position.tag : _.last(position.location.split(', '));
	} else {
		return city
	}
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

Template.registerHelper('linkedFacebook', function() {
	var user = arguments[0] || this;
	var services = Bisia.User.getUser('services');
	return (!!services && !!services['facebook']) ? true : false;
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

Template.registerHelper('itsMine', function() {
	var user = arguments[0] || this;
	return Bisia.User.getUser('authorId', user) === Meteor.userId();
});

Template.registerHelper('iFollowYou', function() {
	var user = arguments[0] || this;
	var followers = Bisia.User.getUser('followers');
	return _.contains(followers, Meteor.userId());
});

// AUDIO

Template.registerHelper('playNoty', function() {
	Bisia.Audio.playNoty();
});

// TEXT

Template.registerHelper('abstract', function(text, len) {
	var content = text;
	if (content.length > len) {
		content = content.substr(0, len - 3) + "...";
	}
	content = content.replace(/(\r\n|\n|\r)/gm, ' ');
	return content;
});

Template.registerHelper('shortText', function(text, len, icon) {
	var content = text;
	if (content.length > len) {
		content = content.substr(0, len - 3) + "...";
	}
	if(icon) {
		content = HTML.Raw(emojione.toImage(content)).value;
	}
	content = Bisia.Ui.citeToLink(content);
	content = Bisia.Ui.urlToLink(content);
	content = content.replace(/(\r\n|\n|\r)/gm, '<br>');
	return content;
});

Template.registerHelper('br', function(text) {
	var view = this;
	var content = text;
	content = HTML.Raw(emojione.toImage(content)).value;
	content = Bisia.Ui.citeToLink(content);
	content = Bisia.Ui.urlToLink(content);
	content = content.replace(/(\r\n|\n|\r)/gm, '<br>');
	return content;
});