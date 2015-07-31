
// Time

Bisia.Time = {

	/**
	 * Get the time of the hearth
	 * @type {ReactiveVar}
	 */
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
	 * Get all today
	 * @return {Object}
	 */
	getToday: function() {
		return {
			'$gte': this.todayStart(),
			'$lte': this.todayEnd()
		}
	},

	/**
	 * Check if date is today
	 * @param  {String}  date
	 * @param  {String}  format
	 * @return {Boolean}
	 */
	isToday: function(date, format) {
		var f = format || 'YYYYMMDD';
		return moment(date, f, true).isSame(moment(), 'day');
	},

	/**
	 * Check if date is tomorrow
	 * @param  {String}  date
	 * @param  {String}  format
	 * @return {Boolean}
	 */
	isTomorrow: function(date, format) {
		var f = format || 'YYYYMMDD';
		return moment(date, f, true).isSame(moment().add(1, 'd'), 'day');
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
	 * Get the server time
	 * @return {Date}
	 */
	getServerTime: function() {
		return (this.serverTime) ? this.serverTime : this.now();
	},

	/**
	 * Set time of insert and set beatTime +2 seconds
	 * @return {Date}
	 */
	setServerTime: function() {
		var seconds = arguments[0] || 5;
		var now = this.now();
		var less = moment(now).subtract(seconds, 'seconds').toDate();
		this.beatTime.set(less);
		return now;
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
	 * days ago start date
	 * @return {Date}
	 */
	daysAgoStart: function() {
		var ago = arguments[0] || 1;
		var what = arguments[1] || 'day';
		return moment().subtract(ago, what)
					   .startOf('day')
		               .toDate();
	},

	/**
	 * days ago end date
	 * @return {Date}
	 */
	daysAgoEnd: function() {
		var ago = arguments[0] || 1;
		var what = arguments[1] || 'day';
		return moment().subtract(ago, what)
					   .endOf('day')
					   .toDate();
	},

	/**
	 * days future start date
	 * @return {Date}
	 */
	daysFutureStart: function() {
		var future = arguments[0] || 1;
		return moment().add(future, 'day')
					   .startOf('day')
		               .toDate();
	},

	/**
	 * days ago end date
	 * @return {Date}
	 */
	daysFutureEnd: function() {
		var future = arguments[0] || 1;
		return moment().add(future, 'day')
					   .endOf('day')
					   .toDate();
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
	},

	/**
	 * Create from now object
	 * @return {Date}
	 */
	pokerWeekStart: function() {
		return moment().startOf('week').toDate();
	},

	/**
	 * Create to now object
	 * @return {Date}
	 */
	pokerWeekStop: function(setTime) {
		return moment().endOf('week').toDate();
	},

};