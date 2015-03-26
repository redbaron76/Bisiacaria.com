// BUBBLE WRAPPER

Template.bubbleWrapper.helpers({
	hasBubble: function() {
		return Bisia.Ui.bubble.get();
	}
});

// INFO WRAPPER

Template.infoWrapper.helpers({
	hasInfo: function() {
		return Bisia.Ui.info.get();
	}
});

// MAP WRAPPER

Template.mapWrapper.helpers({
	hasMap: function() {
		return Bisia.Ui.map.get();
	},
});

Template.mapWrapper.events({
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
	}
});

// POPUP WRAPPER

Template.popupWrapper.helpers({
	hasPopup: function() {
		return Bisia.Ui.popup.get();
	},
});

