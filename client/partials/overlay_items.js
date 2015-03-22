
// MAP WRAPPER

Template.mapWrapper.helpers({
	hasMap: function() {
		return Bisia.Ui.map.get();
	},
});

Template.mapWrapper.events({
	'click #map-close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('map');
	},
	'click #map-center': function(e, t) {
		e.preventDefault();
		Bisia.Map.centerMapPosition();
	}
});

// POPUP WRAPPER

Template.popupWrapper.helpers({
	hasPopup: function() {
		return Bisia.Ui.popup.get();
	},
});

// BUBBLE WRAPPER

Template.bubbleWrapper.helpers({
	hasBubble: function() {
		return Bisia.Ui.bubble.get();
	}
});