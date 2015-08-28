
// User Interface

Bisia.Ui = {			// global Bisia in /lib/application/bisia.js

	$document: $(document),

	$clicked: null,			// button clicked
	$clickedIcon: null,		// the icon to spin
	iconClasses: null,		// list of icon classes
	clickedContent: null,	// content to save and replace

	$content: null,		// the cntent wrapper
	$target: null,		// the target object clicked
	$ultools: null,		// the ultool open
	$prolinks: null,
	$wrapper: null,		// the main wrapper

	/**
	 * keep trigger status of the UI
	 * @type {Boolean}
	 */
	uiActivated: false,

	/**
	 * pageReady on subscriptions
	 * @type {Object}
	 */
	pageReady: null,

	/**
	 * Lock sidebar trigger when in movement
	 * @type {Boolean}
	 */
	sidebarLock: false,

	/**
	 * [title description]
	 * @type {String}
	 */
	topTitle: new ReactiveVar(),

	/**
	 * [title description]
	 * @type {String}
	 */
	browserTitle: new ReactiveVar(),

	/**
	 * [$modal description]
	 * @type {[type]}
	 */
	$modal: null,

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
	img: new ReactiveVar(),

	/**
	 * Popup reactive variable
	 * @type {ReactiveVar}
	 */
	map: new ReactiveVar(),

	/**
	 * Modal reactive variable
	 * @type {ReactiveVar}
	 */
	modal: new ReactiveVar(),

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

	autocompleteListener: function(e) {
		var $area = $(e.currentTarget);
		var content = $area.val();
		var token = content.split(' ').slice(-1);
		if (content.length == 0) this.uiActivated = false;

		// console.log(e.keyCode);

		if (token == '@' && !this.uiActivated) {
			this.uiActivated = true;
			this.autocompleteDialog(e);
		} else {
			this.uiActivated = false;
		}
	},

	autocompleteDialog: function(event) {
		var context = {};
		context.infoTitle = 'Tagga un nick!';
		Bisia.Ui.setReactive('info', {
			template: 'infoAutocompleteNick',
			context: context,
			event: event
		});
		return this;
	},

	/**
	 * [checkOnline description]
	 * @return {[type]} [description]
	 */
	blockIfNotConnected: function() {
		var isOnline = Bisia.Session.connStatus.get();
		// console.log('blockIfNotConnected', isOnline);
		if (! isOnline) {
			this.setReactive('info', {
				template: 'currentOffline'
			});
		} else {
			this.unsetReactive('info');
		}
	},

	/**
	 * Chenge the device
	 * @param  {Object} e
	 * @return {Bisia.Ui}
	 */
	changeDevice: function(e) {
		$el = $(e.currentTarget);
		var newDevice = $el.data('device');
		var deviceClass = 'show-' + newDevice;
		var deviceArr = ['show-desktop-full', 'show-phone-v', 'show-phone-h', 'show-tablet-v', 'show-tablet-h'];
		var $body = $('body');
		// var $wrapper = $('.wrapper');
		// var $device = $('.device');
		_.each(deviceArr, function(el, i) {
			$body.removeClass(el);
			// $wrapper.removeClass(el);
			// $device.removeClass(el);
		});
		$body.addClass(deviceClass);
		Session.set('layout', deviceClass);
		// $wrapper.addClass(deviceClass);
		// $device.addClass(deviceClass);
		return this;
	},

	/**
	 * Transform cite to link
	 * @param  {String} text [description]
	 * @return {String}      [description]
	 */
	citeToLink: function(text) {
		if (text) {
			// var usernames = text.match(/(\s+)?@(.+?)(?=[\r\n\s,:?!]|$)/gmi);
			var usernames = text.match(/\B@[\w\d.]+\b/igm);
			if (!_.isEmpty(usernames)) {
				_.each(_.uniq(usernames), function(citename) {
					citename = citename.trim().replace(/(\r\n|\n|\r)/gim, '');
					if (citename.substr(citename.length-1) == '.') {
						citename = citename.substr(0, citename.length-1);
					}
					var url = citename.trim().replace('@', '');
					var link = '<a href="/' + url + '" class="cite-inline">' + citename + '</a>';
					var regExp = new RegExp(citename, 'g');
					text = text.replace(regExp, link);
				});
			}
		}
		return text;
	},

	/**
	 * Transform url to link
	 * @param  {[type]} text [description]
	 * @return {[type]}      [description]
	 */
	urlToLink: function(text) {
		if (text) {
			var urls = text.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=&amp;]*)/gi);
			if (!_.isEmpty(urls)) {
				_.each(_.uniq(urls), function(url) {
					// var link = $('<div />').html(url).text();
					var domain = Bisia.extractDomain(url);
					var link = domain;
					var checkUrl = url.toLowerCase();
					if (checkUrl.indexOf('youtube.com') > -1 || checkUrl.indexOf('youtu.be') > -1) {
						var ytId = Bisia.Img.getYoutubeId(url);
						if (ytId) {
							var embed = '<div class="video-wrapper"><iframe src="//www.youtube-nocookie.com/embed/'
    									+ ytId + '" frameborder="0" allowfullscreen></iframe></div>';
    						text = text.replace(url, embed);
						} else {
							link = '<a href="' + url + '" class="cite-inline link" target="_blank">' + link + '</a>';
							text = text.replace(url, link);
						}
					} else {
						link = '<a href="' + url + '" class="cite-inline link" target="_blank">' + link + '</a>';
						text = text.replace(url, link);
					}
				});
			}
		}
		return text;
	},

	/**
	 * Open confirm dialog and set triggers on buttons
	 * @param  {String} method
	 * @param  {Object} event
	 * @param  {Object} object
	 * @return {Bisia.Ui}
	 */
	confirmDialog: function(method, event, context) {
		if (!context.infoTitle)
			context.infoTitle = 'Vuoi procedere?';
		Bisia.Ui.setReactive('info', {
			template: 'infoConfirm',
			method: method,
			context: context,
			event: event
		});
		return this;
	},

	/**
	 * Get true when page is ready
	 * @return {Boolean}
	 */
	getPageReady: function() {
		if (this.pageReady && !_.isArray(this.pageReady))
			return this.pageReady.ready();
		if (this.pageReady && _.isArray(this.pageReady)) {
			var nHandles = this.pageReady.length;
			for (var i = 0; i < nHandles; ) {
				while (this.pageReady[i]) {
					Bisia.log(this.pageReady[i]);
					i++;
					if (i == nHandles)
						return true;
				}
			}
		}
		return false;
	},

	/**
	 * Get object to inject into tab
	 * @param  {Object} tabObj
	 * @param  {String} template
	 * @return {Object}
	 */
	getTabObject: function(tabObj, template) {
		return _.extend(tabObj, {
			template: template
		});
	},

	/**
	 * Scroll content to bottom
	 * @return {Bisia.Ui}
	 */
	goBottom: function() {
		this.$content = $('.content');
		var height = this.$content[0] ? this.$content[0].scrollHeight : 0;
		this.$content.animate({ scrollTop: height }, 'fast');
		return this;
	},

	/**
	 * Go to top quickly
	 * @return {Bisia.Ui}
	 */
	goFirst: function() {
		this.$content = $('.content');
		this.$content.animate({ scrollTop: 0 }, 'fast');
		return this;
	},

	/**
	 * Scroll content on top with animation
	 * @param  {Object}
	 * @return {Bisia.Ui}
	 */
	goTop: function(e) {
		e.preventDefault();
		this.$content = (arguments[1]) ? $(arguments[1]) : this.$content;
		this.$content.animate({ scrollTop: 0 }, 1000);
		return this;
	},

	/**
	 * Hide an element
	 * @param  {String} className
	 * @param  {String} target
	 * @return {Bisia.Ui}
	 */
	hideElement: function(className, target) {
		$(className).removeClass(target);
		return this;
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
	 * @return {Bisia.Ui}
	 */
	loadingAdd: function(e) {
		if (this.$target) this.loadingRemove();
		this.$target = $(e.currentTarget);
		this.$target.css('pointer-events', 'none');
		if (this.$target.has('i.fa').length) {
			// this is the icon
			this.$targetIcon = this.$target.find('i.fa');
			// save iconClasses
			this.iconTargetClasses = this.$targetIcon.attr('class');
			// change icon with spinning
			this.$targetIcon.removeClass().addClass('fa fa-refresh fa-spin');
		} else {
			this.$target.addClass('loading');
		}
		return this;
	},

	/**
	 * Remove a loding icon class
	 * @return {Bisia.Ui}
	 */
	loadingRemove: function() {
		if (this.$target) {
			this.$target.removeClass('loading');
			this.$target.css('pointer-events', 'auto');
			this.$target = null;

			// remove spinner by default and apply original classes
			if (this.$targetIcon) {
				this.$targetIcon.removeClass().addClass(this.iconTargetClasses);
			}
			// set clicked icon to null
			this.$targetIcon = null;
			this.iconTargetClasses = null;
		}
		return this;
	},

	/**
	 * Manage Tab functionality
	 * @param  {Object} e
	 * @param  {Object} obj this
	 * @return {Bisia.Ui}
	 */
	manageTab: function(e, obj) {
		e.preventDefault();
		var $target = $(e.target);
		$target.siblings('[data-change=tab]').removeClass('selected');
		var tabObj = this.getTabObject(obj, $target.data('show'));
		this.setReactive('tab', tabObj);
		$target.addClass('selected');
		return this;
	},

	/**
	 * Reset class and set selected to the first
	 * @return {Bisia.Ui}
	 */
	resetTab: function($wrapper) {
		$wrapper.find('[data-change=tab]')
				.removeClass('selected')
				.first()
				.addClass('selected');
		return this;
	},

	/**
	 * Open the error list and track autorun
	 * @return {Bisia.Ui}
	 */
	openInfoList: function(title, infoClass) {
		var infos = {
			title: title,
			infoClass: infoClass
		};
		Bisia.Validation.reactInfos.set(infos);
		Tracker.autorun(function() {
			Bisia.Ui.setReactive('info', {
				infoTitle: Bisia.Validation.reactInfos.get().title,
				infoClass: Bisia.Validation.reactInfos.get().infoClass,
				template: 'infoList',
				items: Bisia.Validation.reactItems.get()
			});
		});
		return this;
	},

	/**
	 * Open reactive popup on error submission
	 * @param  {String} message
	 * @return {Bool}
	 */
	submitError: function(message) {
		var title = (arguments[1]) ? arguments[1] : 'Errori da correggere!';
		var icon = (arguments[2]) ? arguments[2] : 'fa-exclamation-triangle';
		var errors = [];

		if(_.isObject(message)) {
			errors = Bisia.Validation.fillErrors(message);
		} else {
			errors.push({ id: '', msg: message, icon: icon });
		}

		this.submitReactive(errors, title, 'error');
		return false;
	},

	/**
	 * Open reactive popup on success submission
	 * @param  {String} message
	 * @return {Bool}
	 */
	submitSuccess: function(message) {
		var parent = this;
		var title = (arguments[1]) ? arguments[1] : 'Operazione riuscita!';
		var icon = (arguments[2]) ? arguments[2] : 'fa-check';
		var autoClose = arguments[3] || false;
		var success = [{
			id: '',
			msg: message,
			icon: icon
		}];
		if (autoClose) {
			this.runAfter(function() {
				parent.submitReactive(success, title, 'success');
			}, function() {
				parent.unsetReactive('info');
			}, 3);
		} else {
			parent.submitReactive(success, title, 'success');
		}
		return true;
	},

	/**
	 * Open info popup reactively
	 * @param  {Object} itemObj
	 * @param  {String} title
	 * @param  {String} infoClass
	 * @return {Bisia.Ui}
	 */
	submitReactive: function(itemObj, title, infoClass) {
		Bisia.Validation.updateItemList(itemObj)
						.openInfoList(title, infoClass)
						.loadingRemove()
						.waitStop();
		return this;
	},

	/**
	 * Remove a class from a target after a timeout
	 * @param  {String}
	 * @param  {String}
	 * @return {Bisia.Ui}
	 */
	removeClassAfter: function(className, target) {
		var parent = this;
		var timeout = arguments[2] || 500;
		if( ! (target instanceof jQuery))
			target = $(target);
		Meteor.setTimeout( function() {
			target.removeClass(className);
			parent.sidebarLock = false;
		}, timeout);
		return this;
	},

	/**
	 * Run second after xx seconds from first
	 * @param  {Function} runFirst
	 * @param  {Function} runSecond
	 * @param  {Int} timeout   seconds
	 * @return {Bisia.Ui}
	 */
	runAfter: function(runFirst, runSecond, timeout) {
		runFirst();
		Meteor.setTimeout(function() {
			runSecond();
		}, timeout * 1000);
		return this;
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
	 * Set browser title
	 * @return {Void}
	 */
	setBrowserTitle: function() {
		var parent = this;
		// Tracker.autorun(function () {
			var title = parent.browserTitle.get();
			var total = Bisia.Notification.total.get();
			// Add notifications number
			if (total > 0) {
				title = '('+total+') ' + title;
			}
			$('title').html(title);
		// });
	},

	/**
	 * Set a reactive variable
	 * @param {String} which bubble | popup
	 * @param {Bisia.Ui} obj
	 */
	setReactive: function(which, obj) {
		this.unsetReactive(which);
		this[which].set(obj);
		return this;
	},

	/**
	 * Unset a reactive variable
	 * @param  {String} which
	 * @return {Bisia.Ui}
	 */
	unsetReactive: function(which) {
		this[which].set();
		return this;
	},

	/**
	 * Swipe open actions in list
	 * @param  {Object} e
	 * @return {Bisia.Ui}
	 */
	swipeUserListItem: function(e, parent, itemClass) {
		$el = $(e.target).parents(parent);
		/*if ($el[0].localName != 'li') {
			$el = $el.parents('li');
		}*/
		$el.siblings(parent).removeClass(itemClass);
		$el.toggleClass(itemClass);
		return this;
	},

	/**
	 * Toggle the active class
	 * @param  {Object}
	 * @return {Bisia.Ui}
	 */
	toggleActive: function(e) {
		var $el = $(e.target);
		$el.toggleClass('active');
		$el.siblings('a, button').removeClass('active');
		return this;
	},

	/**
	 * Toggle a class on/off when target reach bottom of scroll
	 * @param  {Object}
	 * @param  {String}
	 * @param  {String}
	 * @return {Bisia.Ui}
	 */
	toggleAtBottom: function(e, element, className) {
		this.$content = $(e.target);
		var $el = this.$content.next(element);	//find
		var c = e.currentTarget;

		// console.log(c.offsetHeight + c.scrollTop, c.scrollHeight, this.$document.height());

		// Enable only if content is twice browser height
		if (c.scrollHeight >= (this.$document.height() * 2) || $('.load-more').length > 0) {
			if (c.offsetHeight + c.scrollTop >= c.scrollHeight - 50) {
				this.$content.addClass(className);
				$el.addClass(className);
			} else {
				this.$content.removeClass(className);
				$el.removeClass(className);
			}
		}
		return this;
	},

	/**
	 * Toggle a class in target when a offset is reached
	 * @param  {Object}
	 * @param  {String}
	 * @param  {String}
	 * @param  {String}
	 * @return {Bisia.Ui}
	 */
	toggleAtOffset: function(e, target, limit, className) {
		this.$content = $(e.target);

		var $target = this.$content.next(target);
		var offsetTop = this.$content.scrollTop() - this.$content.offset().top;

		// add 15 if isCordova (padding top navbar)
		if (Meteor.isCordova) offsetTop = offsetTop + 15;

		if (offsetTop > limit) {
			$target.addClass(className);
		} else {
			$target.removeClass(className);
		}
		return this;
	},

	/**
	 * Toggle a class in a Template
	 * @param  {String}
	 * @param  {String}
	 * @param  {Object}
	 * @return {Bisia.Ui}
	 */
	toggleClass: function(className, target, template) {
		var $target = $(template.find(target));
		$target.toggleClass(className);
		return this;
	},

	/**
	 * Toggle a modal window
	 * @param  {Object}
	 * @return {Bisia.Ui}
	 */
	toggleModal: function(e, modalTemplate) {
		var parent = this;
		var id = $(e.currentTarget).attr('id');

		if (this.$modal) {
			this.$modal.toggleClass('md-open');
			this.$modal.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function() {
				parent.unsetReactive('modal');
				parent.$modal = null;
			});
		} else {
			Bisia.Ui.setReactive('modal', {
				template: modalTemplate,
				data: arguments[2] || this
			});

			Meteor.setTimeout(function() {
				parent.$modal = $('[data-content='+id+']');
				parent.$modal.toggleClass('md-open');
				$('.autosize').textareaAutoSize();
			}, 100);
		}
		return this;
	},

	/**
	 * Toggle classes in wrapper for sidebar animation open/close
	 * @param  {String}
	 * @return {Bisia.Ui}
	 */
	toggleSidebar: function(className) {
		var self = this;
		var timeout = 450;
		var closing;

		self.$wrapper = $('.wrapper');
		self.$ultools = $('.tools-open');
		self.$prolinks = $('.links-open');

		if (! this.sidebarLock || ! className) {

			if (className) this.sidebarLock = true;

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

			if (self.$ultools.length > 0) {
				self.$ultools.removeClass('tools-open');
			}

			if (self.$prolinks.length > 0) {
				self.$prolinks.removeClass('links-open');
			}

			self.$wrapper.find('.body-wrapper').one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(event) {
				if (event.originalEvent.propertyName == 'opacity') {
					self.sidebarLock = false;
				}
			});
		}

		return this;
	},

	/**
	 * Trigger image in fullscreen
	 * @param  {Object} e
	 * @return {Void}
	 */
	triggerFullScreenImage: function(e) {
		var url = $(e.currentTarget).data('img');
		if (url)
			Bisia.Ui.setReactive('img', url);
	},

	/**
	 * Start loading and disable double clicks
	 * @param  {[type]} e      [description]
	 * @param  {[type]} action [description]
	 * @return {[type]}        [description]
	 */
	waitStart: function(e, action) {
		e.preventDefault();
		var actionToDo = action || 'replace';

		// check if is already something running
		if (this.$clicked) {
			// stop other process
			this.waitStop();
		}
		// the clicked object
		this.$clicked = $(e.currentTarget);
		// get actionToDo if in attribute data-icon
		if (this.$clicked.attr('data-icon')) {
			actionToDo = this.$clicked.attr('data-icon');
		}
		// save clicked content in memory
		this.clickedContent = this.$clicked.html();
		// unbind click event
		this.$clicked.css('pointer-events', 'none');

		// check clicked has icon
		if (this.$clicked.has('i.fa').length) {
			// this is the icon
			this.$clickedIcon = this.$clicked.find('i.fa');
			// save iconClasses
			this.iconClasses = this.$clickedIcon.attr('class');
			// change icon with spinning
			this.$clickedIcon.removeClass().addClass('fa fa-refresh fa-spin');
			// dont replace original content / auto update
			if (action == 'auto') this.clickedContent = null;
		} else if (this.$clicked.prev('i.fa').length) {
			// this is the icon
			this.$clickedIcon = this.$clicked.prev('i.fa');
			// save iconClasses
			this.iconClasses = this.$clickedIcon.attr('class');
			// change icon with spinning
			this.$clickedIcon.removeClass().addClass('fa fa-refresh fa-spin');
			// dont replace original content / auto update
			if (action == 'auto') this.clickedContent = null;
		} else {
			// create spinner
			var $spinner = $('<i/>', { 'class': 'fa fa-refresh fa-spin' });
			// insert spinner
			switch(actionToDo) {
				case 'auto':
					this.clickedContent = null;
				case 'append':
					this.$clicked.append($spinner);
					break;
				case 'prepend':
					this.$clicked.prepend($spinner);
					break;
				default:
					this.$clicked.html($spinner);
			}
		}

		// check if parent is a form
		if (this.$clicked.parents().is('form')) {
			var $form = this.$clicked.parents('form');
			$form.submit();
		}

		return this;
	},

	/**
	 * Stops loading procedure
	 * @return {[type]} [description]
	 */
	waitStop: function() {
		// re-set original html
		if (this.clickedContent)
			this.$clicked.html(this.clickedContent);
		// remove spinner by default and apply original classes
		if (this.iconClasses && this.$clickedIcon) {
			this.$clickedIcon.removeClass().addClass(this.iconClasses);
		} else {
			// remove contained spinner
			if (this.$clicked)
				this.$clicked.find('.fa-spin').remove();
		}
		// bind click back again
		if (this.$clicked)
			this.$clicked.css('pointer-events', 'auto');
		// reset content
		this.clickedContent = null;
		// set back to null
		this.$clicked = null;
		// set clicked icon to null
		this.$clickedIcon = null;
		// return
		return this;
	}
};