
// Image

Bisia.Img = {			// global Bisia in /lib/application/bisia.js

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

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
	}
};