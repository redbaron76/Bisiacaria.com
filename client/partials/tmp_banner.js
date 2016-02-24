Template.tmpBanner.helpers({
	banner: function() {
		var config = Meteor.settings.public.banner;
		if (moment().isBetween(config.showFrom, config.showTo)) {
			return {
				link: config.link,
				img: config.imgPath
			}
		}
		return false;
	}
});