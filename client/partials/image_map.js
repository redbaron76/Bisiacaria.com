Template.addImage.events({
	'click #add-image': function(e, t) {
		e.preventDefault();

	}
});

Template.addMap.events({
	'click #add-map-position': function(e, t) {
		e.preventDefault();
		Bisia.Map.triggerMapCreation('map-wrapper');
	}
});