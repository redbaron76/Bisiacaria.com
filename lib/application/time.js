
// Time

Bisia.Time = {

	beatTime: new ReactiveVar(),

	/**
	 * Week ago
	 * @type {Integer}
	 */
	msWeek: 1 * 1000 * 60 * 60 * 24 * 7,

	/**
	 * BeatTime available on server
	 * @type {Date}
	 */
	serverTime: null,

	//Set serverTimeOffset in past
	serverTimeOffset: 5 * 1000,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Get the separator in date string
	 * @param  {String} dateStr
	 * @return {String}
	 */
	getDateSeparator: function(dateStr) {
		if (_.isString(dateStr)) {
			if (dateStr.indexOf('-') < 0)
				return '/';
			if (dateStr.indexOf('/') < 0)
				return '-';
		}
		return '/';
	},

	/**
	 * Get birthdays of today
	 * @param  {Object} user
	 * @return {Object}
	 */
	getTodayBirthday: function(user) {
		var day = moment().format('DD');
		var month = moment().format('MM');
		return {
			'$regex': day + '-' + month
		}
	},

	/**
	 * Get date/time from form and return Date()
	 * @param  {Object} objDT
	 * @return {Date|Bool}
	 */
	formatFormDate: function(objDT) {
		var error, format, dateTime = '';
		var s = objDT.separator ? objDT.separator : '/';
		var date = objDT.date ? objDT.date : null;
		var time = objDT.time ? objDT.time : null;
		if (date && time) {
			format = 'DD'+s+'MM'+s+'YYYY HH:mm';
			dateTime = date + ' ' + time;
		}
		if (date && !time) {
			format = 'DD'+s+'MM'+s+'YYYY';
			dateTime = date;
		}
		if (!date && time) {
			format = 'HH:mm';
			dateTime = time;
		}
		var mDate = moment(dateTime, format, true);
		return (mDate.isValid() && dateTime) ? mDate.toDate() : false;
	},

	/**
	 * Format the birthday date
	 * @param  {Date} birthDate
	 * @return {String}
	 */
	formatBirthDate: function(birthDateObj) {
		var birthDate = this.formatFormDate(birthDateObj);
		if (birthDate && _.isDate(birthDate))
			return moment(birthDate).format('DD-MM-YYYY');
		return false;
	},

	/**
	 * Create from now object
	 * @return {Object}
	 */
	nowStart: function(setTime) {
		var time = setTime || this.now();
		return {
			$lte: time
		}
	},

	/**
	 * Create to now object
	 * @return {Object}
	 */
	nowStop: function(setTime) {
		var time = setTime || this.now();
		return {
			$gte: time
		}
	},

	/**
	 * Get now date time
	 * @return {Object}
	 */
	now: function() {
		if (this.beatTime && arguments[0] == 'server')
			return this.beatTime.get();
		if (arguments[0]) {
			return moment().format(arguments[0]);
		}
		return new Date();
	},

	/**
	 * Set date or set now if empty
	 * @param  {Object|String} objDT
	 * @return {Date|String}
	 */
	nowIfEmpty: function(objDT) {
		var dateTime = this.formatFormDate(objDT);
		if (!!dateTime) {
			if (_.isDate(dateTime))
				return dateTime;

			switch(dateTime.length) {
				case 5:
					return this.now('DD/MM/YYYY') + ' ' + dateTime;
				case 10:
					return dateTime + ' ' + this.now('HH:mm');
				case 16:
					return dateTime;
			}
		}
		return this.now('server');
	},

	/**
	 * Get a time ago date
	 * @param  {int} milliseconds
	 * @return {Date}
	 */
	timeAgo: function(ms) {
		return moment().subtract(ms, 'ms').toDate();
	},

	/**
	 * Get a time future date
	 * @param  {int} milliseconds
	 * @return {Date}
	 */
	timeFuture: function(ms) {
		return moment().add(ms, 'ms').toDate();
	},

	/**
	 * Get the start of today
	 * @return {Object}
	 */
	todayStart: function() {
		var now = this.now();
		now.setHours(0,0,0,0);
		return new Date(now);
	},

	/**
	 * Get the end of today
	 * @return {Object}
	 */
	todayEnd: function() {
		var now = this.now();
		now.setHours(23,59,59,9999);
		return new Date(now);
	},

	/**
	 * End of the week at midnight
	 * @return {Date}
	 */
	dayEnd: function(nDays) {
		var end = nDays || 7;
		return moment().add(end, 'd')
					   .set('hour', 23)
					   .set('minute', 59)
					   .set('second', 59)
					   .toDate();
	}

};