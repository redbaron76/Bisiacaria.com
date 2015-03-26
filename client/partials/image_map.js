/*Template.addImage.rendered = function() {
	Bisia.Img.addImgInstance = this;
}
*/
Template.addImageForm.rendered = function() {

	// var addImgInstance = Bisia.Img.addImgInstance;
	var instance = this;
	// Bisia.log(addImgInstance);

	// UPLOAD IMAGE TO CLOUDINARY
	var settings = {
		format: 'jpg',
		width: 200,
		height: 200,
		crop: 'thumb',
		gravity: 'faces:center'
	}
	var bindings = {
		start: 'addImageCloudinaryStart',
		progress: 'addImageCloudinaryProgress',
		done: 'addImageCloudinaryDone'
	}
	Bisia.Img.cloudinaryUpload('#image-upload', 'bisia-upload', settings, bindings, instance);
}

Template.addImage.events({
	'click [data-action=add]': function(e, t) {
		e.preventDefault();
		var $button = $(e.currentTarget);
		var $input = $button.parents('form').next('form').find('input');
		$input.trigger('click');
		return false;

	},
	'click [data-action=remove]': function(e, t) {
		e.preventDefault();
		Bisia.Img.removeAttachedImage();
	}
});

Template.addMap.events({
	'click [data-action=add]': function(e, t) {
		e.preventDefault();
		Bisia.Map.triggerMapCreation('map-wrapper');
	},
	'click [data-action=remove]': function(e, t) {
		e.preventDefault();
		Bisia.Map.removeMapPosition();
	}
});