// BUBBLE WRAPPER

Template.bubbleWrapper.helpers({
	hasBubble: function() {
		return Bisia.Ui.bubble.get();
	}
});

Template.bubbleWrapper.events({
	'click .close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('bubble');
	}
});

// INFO WRAPPER

Template.infoWrapper.helpers({
	hasInfo: function() {
		return Bisia.Ui.info.get();
	}
});

// IMG WRAPPER

Template.imgWrapper.helpers({
	imgUrl: function() {
		return Bisia.Ui.img.get();
	},
});

Template.imgWrapper.events({
	'click #img-close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('img');
	}
});

// MAP WRAPPER


Template.mapWrapper.helpers({
	hasMap: function() {
		return Bisia.Ui.map.get();
	},
});

Template.mapContainer.onCreated(function() {
	// only when map is for people near you
	var parent = this;
	if (parent.data.instance) {
		Meteor.setTimeout(function() {
			Bisia.Map.templateInstance(parent);
		},1000);
	}
});

Template.mapContainer.events({
	'click #map-set': function(e, t) {
		e.preventDefault();
		Bisia.Map.setMapPosition();
	},
	'click #map-close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('map');
	},
	'click #map-center': function(e, t) {
		e.preventDefault();
		Bisia.Map.backToYourPosition();
	},
	'click .write-message': function(e, t) {
		e.preventDefault();
		var target = $(e.currentTarget).data('target');
		var gender = $(e.currentTarget).data('gender');
		var username = $(e.currentTarget).data('username');

		var msgObj = {
			template: 'messagePopup',
			targetId: target,
			username: username,
			gender: gender
		};
		Bisia.Ui.setReactive('popup', msgObj);
	}
});

// POPUP WRAPPER

Template.popupWrapper.helpers({
	hasPopup: function() {
		return Bisia.Ui.popup.get();
	},
});

