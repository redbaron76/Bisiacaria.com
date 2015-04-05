
// Image

Bisia.Img = {			// global Bisia in /lib/application/bisia.js

	/**
	 * [cloudName description]
	 * @type {String}
	 */
	cloudName: 'bisiacaria-com',

	/**
	 * [tpl description]
	 * @type {[type]}
	 */
	tpl: null,

	/**
	 * [settings description]
	 * @type {Object}
	 */
	settings: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Upload piture to Cloudinary
	 * @param  {String} el          Element that triggers the form
	 * @param  {String} preset     	Cloudinary unsigned uploading preset
	 * @param  {Object} settings
	 * @param  {Object} bindings
	 * @param  {Object} tpl        	Template instance
	 * @return {Void}
	 */
	cloudinaryUpload: function(el, preset, settings, bindings, tpl) {
		Bisia.Img.tpl = tpl;
		this.settings = _.extend(settings, {
			cloud_name: Bisia.Img.cloudName
		});

		Bisia.Img.tpl.$(el).unsigned_cloudinary_upload(
			preset, {
				cloud_name: Bisia.Img.cloudName,
				tags: Bisia.Img.getTags()
			}, {
				multiple: false
			}
		)
		.bind('cloudinarystart', Bisia.Img[bindings.start])
		.bind('cloudinaryprogress', Bisia.Img[bindings.progress])
		.bind('cloudinarydone', Bisia.Img[bindings.done]);
	},

	deleteImage: function(options) {
		HTTP.del('https://api.cloudinary.com/v1_1/demo/image/destroy',
			options
		);
	},

	/**
	 * Returns a list of tag for Cloudinary upload
	 * @return {String}
	 */
	getTags: function() {
		var str = moment().format('YYYYMMDDHHmm').toString() + ',';
		var keys = ['_id', 'username'];
		_.each(keys, function(el, index) {
			str += Bisia.User.getUser(el) + ',';
		});
		return str.substring(0, str.length - 1);
	},

	/**
	 * Convert online image to base64 string
	 * @param  {String}
	 * @param  {Function}
	 * @param  {String}
	 * @return {String}
	 *
	 * Example:
	 * convertImgToBase64('http://goo.gl/AOxHAL', function(base64Img){
	 *		console.log('IMAGE:',base64Img);
	 * })
	 */
	convertImgToBase64: function(url, callback, outputFormat) {
		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		var img = new Image;

		img.crossOrigin = 'Anonymous';

		img.onload = function() {
			canvas.height = img.height;
			canvas.width = img.width;
		  	ctx.drawImage(img,0,0);
		  	var dataURL = canvas.toDataURL(outputFormat || 'image/png');
		  	callback.call(this, dataURL);

	        // Clean up
		  	canvas = null;
		};

		img.src = url;
	},

	/**
	 * START binding on addImage
	 * @param  {Object} e
	 * @return {Void}
	 */
	addImageCloudinaryStart: function(e) {
		$('#attached-image > .indicator').addClass('loading');
	},

	/**
	 * PROGRESS binding on addImage
	 * @param  {Object} e
	 * @param  {Object} data
	 * @return {Void}
	 */
	addImageCloudinaryProgress: function(e, data) {
		var width = Math.round((data.loaded * 100.0) / data.total);
		$('#attached-image > .indicator').css('width', width + '%');
	},

	/**
	 * DONE binding on addImage
	 * @param  {Object} e
	 * @param  {Object} data
	 * @return {Void}
	 */
	addImageCloudinaryDone: function(e, data) {
		var url = $.cloudinary.url(
			data.result.public_id,
			Bisia.Img.settings
		);
		if (url) {
			$('#attached-image > .indicator').removeClass('loading').css('width', 0);
			Bisia.Img.setAttachedImage(url);
		}
	},

	/**
	 * Callback on addImageCloudinaryDone
	 * @param {String} url
	 */
	setAttachedImage: function(url) {
		this.$imgButton = $('#attached-image');
		this.$imgButton.attr('data-action', 'remove');
		this.$imgButton.find('i').toggleClass('fa-picture-o fa-times');
		this.$imgButton.find('span').html('Rimuovi l\'immagine');

		var img = $('<img/>', {src: url, id: 'attached-image-preview'});
		this.$imgButton.before(img).fadeIn();

		var input = $('<input/>', {type: 'hidden', name: 'image', value: url, id: 'image-url'});
		this.$imgButton.parent('form').append(input);
	},

	/**
	 * Removes the attached image
	 * @return {Void}
	 */
	removeAttachedImage: function() {
		if (this.$imgButton) {
			this.$imgButton.attr('data-action', 'add');
			this.$imgButton.find('i').toggleClass('fa-times fa-picture-o');
			this.$imgButton.find('span').html('Aggiungi un\'immagine');
			this.$imgButton.parent('form').find('#image-url').remove();
			this.$imgButton.prev('img').fadeOut().remove();
		}
	},

	/**
	 * START binding on settings
	 * @param  {Object} e
	 * @return {Void}
	 */
	settingsCloudinaryStart: function(e) {
		Bisia.Img.tpl.$('.uploader > .indicator').addClass('loading');
	},

	/**
	 * PROGRESS binding on settings
	 * @param  {Object} e
	 * @param  {Object} data
	 * @return {Void}
	 */
	settingsCloudinaryProgress: function(e, data) {
		var height = Math.round((data.loaded * 100.0) / data.total);
		Bisia.Img.tpl.$('.uploader > .indicator').css('height', height + '%').find('span').html(height);
	},

	/**
	 * DONE binding on settings
	 * @param  {Object} e
	 * @param  {Object} data
	 * @return {Void}
	 */
	settingsCloudinaryDone: function(e, data) {
		var url = $.cloudinary.url(
			data.result.public_id,
			Bisia.Img.settings
		);
		if (url) {
			Bisia.Img.tpl.$('.uploader > .indicator').removeClass('loading').css('height', 0).find('span').html('');
			Users.update({ '_id': Meteor.userId() }, { $set: { 'profile.avatar': url }});
		}
	}
};