
// User Interface

Bisia.Ui = {			// global Bisia in /lib/application/bisia.js

	$content: null,		// the cntent wrapper
	$target: null,		// the target object clicked
	$ultools: null,		// the ultool open
	$wrapper: null,		// the main wrapper

	/**
	 * pageReady on subscriptions
	 * @type {Object}
	 */
	pageReady: null,

	/**
	 * Popup reactive variable
	 * @type {ReactiveVar}
	 */
	bubble: new ReactiveVar(),

	/**
	 * Info reactive variable
	 * @type {ReactiveVar}
	 */
	info: new ReactiveVar(),

	/**
	 * Popup reactive variable
	 * @type {ReactiveVar}
	 */
	map: new ReactiveVar(),

	/**
	 * Popup reactive variable
	 * @type {ReactiveVar}
	 */
	popup: new ReactiveVar(),

	/**
	 * [tab description]
	 * @type {ReactiveVar}
	 */
	tab: new ReactiveVar(),

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Chenge the device
	 * @param  {Object} e
	 * @return {Void}
	 */
	changeDevice: function(e) {
		$el = $(e.currentTarget);
		var newDevice = $el.data('device');
		var deviceClass = 'show-' + newDevice;
		var deviceArr = ['show-phone-v', 'show-phone-h', 'show-tablet-v', 'show-tablet-h'];
		var $wrapper = $('.wrapper');
		var $device = $('.device');
		_.each(deviceArr, function(el, i) {
			$wrapper.removeClass(el);
			$device.removeClass(el);
		});
		$wrapper.addClass(deviceClass);
		$device.addClass(deviceClass);
	},

	/**
	 * Get true when page is ready
	 * @return {Boolean}
	 */
	getPageReady: function() {
		if(this.pageReady) {
			return this.pageReady.ready();
		}
		return false;
	},

	/**
	 * Get object to inject into tab
	 * @param  {[type]} tabObj   [description]
	 * @param  {[type]} template [description]
	 * @return {[type]}          [description]
	 */
	getTabObject: function(tabObj, template) {
		var user = _.pick(tabObj.user, '_id', 'username', 'profile', 'friends');
		return {
			template: template,
			userId: user._id,
			username: user.username,
			gender: user.profile.gender,
			friends: user.friends
		};
	},

	/**
	 * Scroll content to bottom
	 * @return {Void}
	 */
	goBottom: function() {
		this.$content = $('.content');
		this.$content.animate({ scrollTop: 10000000 }, 'fast');
	},

	/**
	 * Go to top quickly
	 * @return {Void}
	 */
	goFirst: function() {
		this.$content = $('.content');
		this.$content.animate({ scrollTop: 0 }, 'fast');
	},

	/**
	 * Scroll content on top with animation
	 * @param  {Object}
	 * @return {Void}
	 */
	goTop: function(e) {
		e.preventDefault();
		this.$content = (arguments[1]) ? $(arguments[1]) : $(e.target).parents('.content');
		this.$content.animate({ scrollTop: 0 }, 1000);
	},

	hideElement: function(className, target) {
		$(className).removeClass(target);
	},

	/**
	 * Check or not radio/checkbox
	 * @param  {String}
	 * @param  {String}
	 * @return {Boolean}
	 */
	isChecked: function(val1, val2) {
		return (val1 === val2) ? 'checked' : '';
	},

	/**
	 * Add a loading icon class
	 * @param  {Object}
	 * @return {Void}
	 */
	loadingAdd: function(e) {
		this.$target = $(e.target);
		this.$target.addClass('loading');
	},

	/**
	 * Remove a loding icon class
	 * @return {Void}
	 */
	loadingRemove: function() {
		if (this.$target) {
			this.$target.removeClass('loading');
			this.$target = null;
		}
	},

	/**
	 * Manage Tab functionality
	 * @param  {Object} e
	 * @param  {Object} obj this
	 * @return {Void}
	 */
	manageTab: function(e, obj) {
		e.preventDefault();
		var $target = $(e.target);
		$target.siblings('button').removeClass('selected');
		var tabObj = this.getTabObject(obj, $target.data('show'));
		this.setReactive('tab', tabObj);
		$target.addClass('selected');
	},

	/**
	 * Remove a class from a target after a timeout
	 * @param  {String}
	 * @param  {String}
	 * @return {Void}
	 */
	removeClassAfter: function(className, target) {
		var timeout = arguments[2] || 500;
		Meteor.setTimeout( function() {
			target.removeClass(className);
		}, timeout);
	},

	/**
	 * Send message animation and unset target
	 * @return {Void}
	 */
	sendMessage: function() {
		var parent = this;
		$('.md-message').removeClass('bounceIn')
						.addClass('bounceOutRight')
						.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
							parent.unsetReactive('popup');
						});
	},

	/**
	 * Reset all form messages
	 * @return {Void}
	 */
	resetFormMessages: function() {
		Session.set('formErrors', {});
		Session.set('formSuccess', {});
		this.loadingRemove();
	},

	/**
	 * Set a reactive variable
	 * @param {String} which bubble | popup
	 * @param {Void} obj
	 */
	setReactive: function(which, obj) {
		this.unsetReactive(which);
		this[which].set(obj);
	},

	/**
	 * Unset a reactive variable
	 * @param  {String} which
	 * @return {Void}
	 */
	unsetReactive: function(which) {
		this[which].set();
	},

	/**
	 * Swipe open actions in list
	 * @param  {Object} e
	 * @return {Void}
	 */
	swipeUserListItem: function(e) {
		$el = $(e.target);
		if ($el[0].localName != 'li') {
			$el = $el.parents('li');
		}
		$el.siblings('li').removeClass('tools-open');
		$el.toggleClass('tools-open');
	},

	/**
	 * Toggle the active class
	 * @param  {Object}
	 * @return {Void}
	 */
	toggleActive: function(e) {
		var $el = $(e.target);
		$el.toggleClass('active');
		$el.siblings('a, button').removeClass('active');
	},

	/**
	 * Toggle a class on/off when target reach bottom of scroll
	 * @param  {Object}
	 * @param  {String}
	 * @param  {String}
	 * @param  {String}
	 * @return {Void}
	 */
	toggleAtBottom: function(e, target, element, className) {
		this.$content = $(e.target);

		var $el = this.$content.find(element);
		var $target = this.$content.find(target);

		if ($target.offset()) {
			var offsetTop = $target.offset().top;

			// add 15 if isCordova (padding top navbar)
			if (Meteor.isCordova) offsetTop = offsetTop - 15;

			if (this.$content.height() > offsetTop) {
				$el.addClass(className);
			} else {
				$el.removeClass(className);
			}
		}
	},

	/**
	 * Toggle a class in target when a offset is reached
	 * @param  {Object}
	 * @param  {String}
	 * @param  {String}
	 * @param  {String}
	 * @return {Void}
	 */
	toggleAtOffset: function(e, target, limit, className) {
		this.$content = $(e.target);

		var $target = this.$content.find(target);
		var offsetTop = this.$content.scrollTop() - this.$content.offset().top;

		// add 15 if isCordova (padding top navbar)
		if (Meteor.isCordova) offsetTop = offsetTop + 15;

		if (offsetTop > limit) {
			$target.addClass(className);
		} else {
			$target.removeClass(className);
		}
	},

	/**
	 * Toggle a class in a Template
	 * @param  {String}
	 * @param  {String}
	 * @param  {Object}
	 * @return {Void}
	 */
	toggleClass: function(className, target, template) {
		var $target = $(template.find(target));
		$target.toggleClass(className);
	},

	/**
	 * Toggle a modal window
	 * @param  {Object}
	 * @return {Void}
	 */
	toggleModal: function(e) {
		e.preventDefault();
		var id = $(e.currentTarget).attr('id');
		$('[data-content='+id+']').toggleClass('md-open');
	},

	/**
	 * Toggle classes in wrapper for sidebar animation open/close
	 * @param  {String}
	 * @return {Void}
	 */
	toggleSidebar: function(className) {
		var self = this;
		var timeout = 450;
		var closing;

		self.$wrapper = $('.wrapper');
		self.$ultools = $('.tools-open');

		if (className) {
			if (self.$wrapper.is('.sidebar-open-left, .sidebar-open-right')) {
				self.$wrapper.removeClass('sidebar-open-left sidebar-open-right');
			} else {
				self.$wrapper.toggleClass(className);
			}
			closing = className === 'sidebar-open-left' ? 'closing-left' : 'closing-right';
		} else {
			self.$wrapper.removeClass('sidebar-open-left sidebar-open-right');
		}

		if (self.$wrapper.hasClass('closing-left')) {
			self.removeClassAfter('closing-left', self.$wrapper, 450);
		} else if (self.$wrapper.hasClass('closing-right')) {
			self.removeClassAfter('closing-right', self.$wrapper, 450);
		} else {
			if (closing)
				self.$wrapper.addClass(closing);
		}

		if (self.$ultools.length > 0)
			self.$ultools.removeClass('tools-open');
	}
};