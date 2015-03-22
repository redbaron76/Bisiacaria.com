
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
	 * [bindings description]
	 * @type {[type]}
	 */
	bindings: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Upload piture to Cloudinary
	 * @param  {Object} tpl        	Template instance
	 * @param  {String} preset     	Cloudinary unsigned uploading preset
	 * @return {Void}
	 */
	cloudinaryUpload: function(tpl, preset, settings, bindings) {
		this.tpl = tpl;
		this.bindings = bindings;
		this.settings = _.extend(settings, {
			cloud_name: Bisia.Img.cloudName
		});

		this.tpl.$('#image-form').unsigned_cloudinary_upload(
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
		var keys = ['_id', 'username'], str = '';
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