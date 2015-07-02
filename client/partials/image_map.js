// Template.addImageForm.onRendered(function() {
Template.addImage.onRendered(function() {

	var instance = this;

	// UPLOAD IMAGE TO CLOUDINARY
	var settings = {
		/*format: 'jpg',
		width: 200,
		height: 200,
		crop: 'thumb',
		gravity: 'faces:center'*/
	}
	var bindings = {
		start: 'addImageCloudinaryStart',
		progress: 'addImageCloudinaryProgress',
		done: 'addImageCloudinaryDone'
	}
	Bisia.Img.cloudinaryUpload('#add-image-upload', 'eventpost', settings, bindings, instance);

});

Template.addImage.events({
	'click [data-action=remove]': function(e, t) {
		e.preventDefault();
		Bisia.Img.removeAttachedImage();
	}
});

Template.addMap.events({
	'click [data-action=add]': function(e, t) {
		e.preventDefault();
		Bisia.Map.triggerMapCreation('map-wrapper', true, null, false);
	},
	'click [data-action=remove]': function(e, t) {
		e.preventDefault();
		Bisia.Map.removeMapPosition();
	}
});