// Template.addImageForm.onRendered(function() {
Template.addImage.onRendered(function() {

	/*var instance = this;

	// UPLOAD IMAGE TO CLOUDINARY
	var settings = {
		/!*format: 'jpg',
		width: 200,
		height: 200,
		crop: 'thumb',
		gravity: 'faces:center'*!/
	}
	var bindings = {
		start: 'addImageCloudinaryStart',
		progress: 'addImageCloudinaryProgress',
		done: 'addImageCloudinaryDone'
	}
	Bisia.Img.cloudinaryUpload('#add-image-upload', 'eventpost', settings, bindings, instance);*/

});

Template.addImage.events({
	'click [data-action=remove]': function(e, t) {
		e.preventDefault();
		var fileId = $(e.currentTarget).data('id');
		var version = $(e.currentTarget).data('version');
		Bisia.Img.removeAttachedImage(version, fileId);
	},
	'change #add-image-upload': function(e, instance) {
		var version = $(e.currentTarget).data('version');
		var display = $(e.currentTarget).data('display');
		var file = e.currentTarget.files[0];
		Bisia.Upload.startUpload(file, version, function() {
			// onBeforeUpload
			Bisia.Img.$uploadButton = $(e.target);
			instance.$('#attached-image > .indicator').addClass('loading');
			instance.$('#attached-image > .fa').removeClass().addClass('fa fa-refresh fa-spin');
		}, function(fileObj) {
			// onAfterUpload
			Bisia.Upload.updateUserPostEvent(version, display, fileObj, function(pictureUrl, thumbUrl) {
				Meteor.setTimeout(function() {
					instance.$('#attached-image > .indicator').removeClass('loading').css('width', 0);
					instance.$('#attached-image > .fa').removeClass().addClass('fa fa-picture-o');
					instance.$('#attached-image').attr('data-id', fileObj._id).attr('data-version', version);
					Bisia.Img.setAttachedImage(thumbUrl, pictureUrl);
					Bisia.Upload.progress.set(null);
				}, 2 * 1000);
			});
		});
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