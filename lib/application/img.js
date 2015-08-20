
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
	 * The input type file
	 * @type {jQuery Object}
	 */
	$uploadButton: null,

	/**
	 * [invalidUrls description]
	 * @type {Array}
	 */
	invalidUrls: [],

	/**
	 * [invalidUrls description]
	 * @type {ReactiveVar}
	 */
	invalidReactiveUrls: new ReactiveVar([]),

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	buildApi: function() {
		var c = Meteor.settings.cloudinary;
		var baseUrl = c.apiProtocol + c.apiKey +
					  ':' + c.apiSecret +
					  '@' + c.apiBase +
					  c.apiResource;

		return baseUrl;
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

	/**
	 * Get the publicId from path
	 * @param  {String} imgUrl [description]
	 * @return {String}          [description]
	 */
	getImagePublicId: function(imgUrl) {
		if (imgUrl) {
			var chunks = _.last(imgUrl.split('/'), 2);
			var publicId = chunks[0] + '/' + chunks[1];
			if (publicId.indexOf('.') > 0) {
				publicId = _.first(publicId.split('.'));
			}
			return publicId;
		}
		return null;
	},

	getYoutubeId: function(url) {
		var regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+(?:&|&#38;);v=))((?:\w|-|_){11})(?:(?:\?|&|&#38;)index=((?:\d){1,3}))?(?:(?:\?|&|&#38;)list=((?:\w|-|_){24}))?(?:\S+)?/;
		var match = url.match(regExp);
		if (match && match[1].length == 11) {
		    return match[1];
		}
		return false;
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
		Bisia.Img.$uploadButton = $(e.target);
		$('#attached-image > .indicator').addClass('loading');
		$('#attached-image > .fa').removeClass().addClass('fa fa-refresh fa-spin');
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
			$('#attached-image > .fa').removeClass().addClass('fa fa-picture-o');
			Bisia.Img.setAttachedImage(url);
		}
	},

	/**
	 * Callback on addImageCloudinaryDone
	 * @param {String} url
	 */
	setAttachedImage: function(url) {
		this.$uploadButton.hide();
		this.$imgButton = $('#attached-image');
		this.$imgButton.attr('data-action', 'remove');
		this.$imgButton.find('i').toggleClass('fa-picture-o fa-times');
		this.$imgButton.find('span').html('Rimuovi l\'immagine');

		// var img = $('<img/>', {src: url, id: 'attached-image-preview'});
		var img = $('<img/>', {src: url});
		var imgWrapper = $('<div/>', {class: 'thumbimg preview', id: 'attached-image-preview'}).append(img);
		// this.$imgButton.before(img).fadeIn();
		this.$imgButton.before(imgWrapper).fadeIn();

		var input = $('<input/>', {type: 'hidden', name: 'image', value: url, id: 'image-url'});
		this.$imgButton.parent('form').append(input);
	},

	/**
	 * Removes the attached image
	 * @return {Void}
	 */
	removeAttachedImage: function() {
		if (this.$imgButton) {
			// get the imageUrl already uploaded
			var imageUrl = this.$imgButton.parent('form').find('#image-url').val();
			// remove form elements
			this.$uploadButton.show();
			this.$imgButton.attr('data-action', 'add');
			this.$imgButton.find('i').toggleClass('fa-times fa-picture-o');
			this.$imgButton.find('span').html('Aggiungi un\'immagine');
			this.$imgButton.parent('form').find('#image-url').remove();
			// this.$imgButton.prev('img').fadeOut().remove();
			this.$imgButton.prev('#attached-image-preview').fadeOut().remove();

			if (imageUrl.length > 0) {
				Meteor.call('cloudinary_delete', Bisia.Img.getImagePublicId(imageUrl), function(error, result) {
					if (error) {
						console.log(error);
					}
				});
			}
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
			var oldPicture = Meteor.user()['profile']['picture'];
			Bisia.Img.tpl.$('.uploader > .indicator').removeClass('loading').css('height', 0).find('span').html('');
			Users.update({ '_id': Meteor.userId() }, { $set: { 'profile.avatar': url, 'profile.picture': data.result.secure_url }});

			// public post with new image
			/*if (data.result && data.result.secure_url) {
				var obj = {
					text: '',
					category: 'ha una nuova immagine del profilo',
					dateTimePost: Bisia.Time.now(),
					imageUrl: data.result.secure_url,
					position: {},
					tagId: ''
				};
				Meteor.call('saveNewPost', obj);
			}*/

			if (oldPicture && oldPicture.length > 0) {
				Meteor.call('cloudinary_delete', Bisia.Img.getImagePublicId(oldPicture), function(error, result) {
					if (error) {
						console.log(error);
					}
					Posts.remove({ 'imageUrl': oldPicture });
				});
			}
		}
	},

	/**
	 * Check if image is invalid - REACTIVE DATA SOURCE
	 * @param  {[type]} url [description]
	 * @return {[type]}     [description]
	 */
	imageIsInvalid: function(url) {
		return _.contains(this.invalidReactiveUrls.get(), url);
	},

	/**
	 * Trigger img placeholder if not available
	 * @param {Object} img
	 */
	addToInvalidUrls: function(img) {
		this.invalidUrls.push(img.src);
		this.invalidReactiveUrls.set(this.invalidUrls);
	},

	checkPortrait: function(img) {
		var $img = $(img);
		var w = $img.width();
		var h = $img.height();
		if (h > (w/4*3)) {
			$img.parent('.thumbimg').addClass('portrait');
		}
	}
};