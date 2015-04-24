
// Bisia Validation

Bisia.Validation = {

	/**
	 * The minimum allowed age
	 * @type {Number}
	 */
	allowedAge: Meteor.settings.public.rules.minAllowedAge,

	/**
	 * Array of items to put in info list
	 * @type {Array}
	 */
	items: [],

	/**
	 * Reactive var for info items list
	 * @type {Object}
	 */
	reactItems: new ReactiveVar(),

	/**
	 * Reactive container for info title and class
	 * @type {ReactiveVar}
	 */
	reactInfos: new ReactiveVar({}),

	/**
	 * The form where to validate fields
	 * @type {jQuery Object}
	 */
	$form: null,

	/**
	 * Init function
	 * @return {Void}
	 */
	init: function() {

	},

	/**
	 * Generate a random number
	 * @return {Number}
	 */
	generateRandom: function() {
		var str, num = arguments[0] || 4;
		for (var i=0; i<num; i++) {
			str += _.random(0, 9);
		}
		return parseInt(str,10);
	},

	/**
	 * Check if a checkable element is checked
	 * @param  {String}
	 * @return {Boolean}
	 */
	isChecked: function(val) {
		return val !== undefined;
	},

	/**
	 * Check if string is empty
	 * @param  {String}
	 * @param  {Object}
	 * @return {Boolean}
	 */
	isEmpty: function(str, obj) {
		return this.notValid(str, obj, 'empty');
	},

	/**
	 * Check if a checkable element is NOT checked
	 * @param  {String}
	 * @return {Boolean}
	 */
	notChecked: function(val) {
		return ! this.isChecked(val);
	},

	/**
	 * Check if string is not empty
	 * @param  {String}
	 * @param  {Object}
	 * @return {Boolean}
	 */
	notEmpty: function(str, obj) {
		return ! this.isEmpty(str, obj);
	},

	/**
	 * Check not equality between values
	 * @param  {String}
	 * @param  {String}
	 * @param  {Object}
	 * @return {Boolean}
	 */
	notMatch: function(str1, str2, obj) {
		return obj[str1] !== obj[str2];
	},

	/**
	 * Test validity against regEx expressions
	 * @param  {String}
	 * @param  {Object}
	 * @return {Boolean}
	 */
	notValid: function(str, obj) {
		var regEx = arguments[2] || str;
		if (obj && obj[str]) {
			return !this.regEx(regEx).test(obj[str]);
		}
		return true;
	},

	/**
	 * Usable regEx expressions
	 * @param  {String}
	 * @return {String}
	 */
	regEx: function(str) {
		if (str) {
			switch(str) {
				case 'empty':
					return /^\s*\S+.*/;
					break;
				case 'username':
					return /^[a-z0-9A-Z._-]{3,15}$/;
					break;
				case 'email':
					return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
					break;
				case 'password':
					return /^.{8,}$/;
					break;
			}
		}
	},

	/**
	 * Format message text and icon class
	 * @param  {String} msgStr
	 * @return {Object}
	 */
	formatMsgIco: function(msgStr) {
		var msgIco = {};
		var strArr = msgStr.split('|');
		msgIco.msg = strArr[0];
		if (strArr[1]) {
			switch(strArr[1]) {
				case 'err':
					msgIco.icon = 'fa-times';
					break;
				case 'exc':
					msgIco.icon = 'fa-exclamation-triangle';
					break;
				default:
					msgIco.icon = 'fa-times';
			}
		} else {
			msgIco.icon = 'fa-times';
		}
		return msgIco;
	},

	/**
	 * Fill the this.items array of errors
	 * @param  {Object} itemObj
	 * @return {Array}
	 */
	fillErrors: function(itemObj) {
		for (var field in itemObj) {
			var error = {};
			var msgIco = this.formatMsgIco(itemObj[field]);
			error.id = Bisia.Form.formIds[field];
			error.msg = msgIco.msg;
			error.icon = msgIco.icon;
			this.items.push(error);
		}
		return this.items;
	},

	/**
	 * Check if fields are valid
	 * @param  {Object} inputObj
	 * @param  {String} execute
	 * @return {Bool}
	 */
	fieldsAreValid: function(inputObj, execute) {
		// if there's no validation -> true
		if (!!!execute)
			return true;
		this.items = [];
		var parent = this;
		var itemObj = this[execute].call(this, inputObj);
		this.items = this.fillErrors(itemObj);
		if (! _.isEmpty(this.items)) {
			this.updateItemList(this.items)
				.openInfoList('Errori da correggere!', 'error')
				.loadingRemove();
			return false;
		}
		return true;
	},

	/**
	 * Update error list reactively
	 * @param  {Object} itemObj
	 * @return {Bisia.Validation}
	 */
	updateItemList: function(itemObj) {
		if (_.isArray(itemObj) && _.isEmpty(this.reactError)) {
			this.reactItems.set(itemObj);
		} else if (_.isArray(itemObj) && !_.isEmpty(this.reactError)) {
			var merged = this.items.concat(itemObj);
			this.reactItems.set(merged);
		} else if (_.isObject(itemObj)) {
			this.items.push(itemObj);
			this.reactItems.set(this.items);
		}
		return Bisia.Ui;
	},

	/**
	 * Validate a date format
	 * @param  {String} dateStr DD/MM/YYYY
	 * @param  {Bool} mandatory?
	 * @return {Bool}
	 */
	validDate: function(dateStr, mandatory) {
		var mand = mandatory || false;
		var s = Bisia.Time.getDateSeparator(dateStr);
		var format = 'DD' + s + 'MM' + s + 'YYYY';

		if (mand || !!dateStr) {
			var mDate = moment(dateStr, format, true);
			return mDate.isValid();
		}
		return true;
	},

	/**
	 * Validate a time format
	 * @param  {String} dateStr DD/MM/YYYY
	 * @param  {Bool} mandatory?
	 * @return {Bool}
	 */
	validTime: function(timeStr, mandatory) {
		var mand = mandatory || false;
		var format = 'HH:mm';

		if (mand || !!timeStr) {
			var mDate = moment(timeStr, format, true);
			return mDate.isValid();
		}
		return true;
	},

	/**
	 * Validate the birthday
	 * @param  {String}
	 * @return {Boolean}
	 */
	validBirthDate: function(birthdayDate) {
		var s = Bisia.Time.getDateSeparator(birthdayDate);
		var format = 'DD' + s + 'MM' + s + 'YYYY';
		var bDay = moment(birthdayDate, format, true);

		if (!birthdayDate || !bDay.isValid())
			return false;

		var validDate = moment().subtract(this.allowedAge, 'y');
		var maxDate = moment().subtract(100, 'y');
		if (bDay.toDate() >= validDate.toDate())
			return 'age18';
		if (bDay.toDate() <= maxDate.toDate())
			return 'ageHigh';
		return true;
	},

	/**
	 * [prepareValidation description]
	 * @param  {[type]} formObj [description]
	 * @param  {[type]} rename  [description]
	 * @return {[type]}         [description]
	 */
	prepareValidation: function(formObj, rename) {
		var flatObj = Bisia.flattenObject(formObj, {});
		if (!_.isEmpty(rename)) {
			for (var key in rename) {
				if (!flatObj[rename[key]]) {
					flatObj[rename[key]] = flatObj[key];
					flatObj = _.omit(flatObj, key);
				}
			}
		}
		return flatObj;
	},

	/**
	 * Validate loginUser template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateLogin: function(login) {
		var errors = {};

		if (this.notValid('email', login))
			errors.email = "L'indirizzo e-mail inserito non sembra essere scritto in modo corretto.|err";

		if (this.notValid('password', login))
			errors.password = "La password inserita è troppo corta e deve contenere almeno 8 caratteri alfanumerici.|err";

		return errors;
	},


	/**
	 * Validate userSettings Profile Data form
	 * @param  {Object}
	 * @return {Object}
	 */
	validateProfileData: function(user) {
		var errors = {};
		var obj = this.prepareValidation(user, {
			'date': 'birthday'
		});

		if (this.notValid('username', user))
			errors.username = "Il nickname deve essere compreso tra i 3 e i 15 caratteri e può contenere lettere maiuscole e minuscole, numeri e i caratteri - _ .|exc";

		if (! this.validDate(obj.birthday, true))
			errors.birthday = "La data di nascita non sembra essere inserita in un formato valido.|err";

		if (this.validBirthDate(obj.birthday) == 'age18')
			errors.birthday = "Per restare su Bisiacaria.com, come da Regolamento, devi aver compiuto i "+this.allowedAge+" anni d'età.|exc";

		if (this.validBirthDate(obj.birthday) == 'ageHigh')
			errors.birthday = "Hai impostato una data di nascita inverosimile.|exc";

		if (this.notValid('birthday', obj, 'empty'))
			errors.birthday = "La data di nascita non può essere vuota.|exc";

		if (this.notValid('city', obj, 'empty'))
			errors.city = "Il tuo luogo di origine non può essere vuoto.|err";

		if (this.notChecked(obj.status))
			errors.status = "Devi impostare lo stato sentimentale.|err";

		return errors;
	},

	/**
	 * Validate userSettings Account Data form
	 * @param  {Object}
	 * @return {Object}
	 */
	validateAccountData: function(user) {
		var errors = {};
		var obj = this.prepareValidation(user);

		if (this.notValid('email', obj))
			errors.email = "L'indirizzo e-mail inserito non sembra essere scritto in modo corretto.|err";

		if (this.isEmpty('email', obj))
			errors.email = "L'indirizzo e-mail non può essere lasciato vuoto.|err";

		if (this.notEmpty('password', obj) && this.notValid('password', obj))
			errors.password = "La password inserita è troppo corta e deve contenere almeno 8 caratteri alfanumerici.|err";

		if (this.notEmpty('password', obj) && this.notMatch('password', 'passwordConfirmed', obj))
			errors.passwordConfirmed = "Le due password non sono corrispondenti.|err";

		if (this.notEmpty('password', obj) && this.notEmpty('passwordConfirmed', obj))
			errors.passwordConfirmed = "Per impostare una nuova password, devi scriverla e ripeterla negli appositi campi testuali.|exc";

		return errors;
	},

	/**
	 * Validate new Post form
	 * @param  {Object} post
	 * @return {Object}
	 */
	validateNewPost: function(post) {
		var errors = {};
		var obj = this.prepareValidation(post);

		if (this.isEmpty('text', obj))
			errors.text = "Non è possibile pubblicare un post senza contenuto.|exc";

		if ( ! this.validDate(obj.date))
			errors.datePost = "La data di pubblicazione non sembra essere inserita in modo corretto.|err";

		if ( ! this.validTime(obj.time))
			errors.timePost = "L'orario di pubblicazione non sembra essere inserito in modo corretto.|err";

		return errors;
	},

	/**
	 * Validate a new event
	 * @param  {Object} event
	 * @return {Object}
	 */
	validateNewEvent: function(event) {
		var errors = {};
		var obj = this.prepareValidation(event);

		if (this.isEmpty('titleEvent', obj))
			errors.titleEvent = "Devi specificare un titolo per il tuo evento.|exc";

		if (this.isEmpty('locationEvent', obj))
			errors.locationEvent = "Devi specificare il luogo in cui si svolgerà il tuo evento.|exc";

		if (( ! arguments[1] && ! this.validDate(obj.date, true)) || (arguments[1] && ! _.isDate(obj.dateTimeEvent)))
			errors.dateEvent = "La data inserita non sembra essere valida.|err";

		if (( ! arguments[1] && this.isEmpty('date', obj)) || (arguments[1] && ! _.isDate(obj.dateTimeEvent)))
			errors.dateEvent = "Devi specificare la data in cui si svolgerà il tuo evento.|exc";

		if ( ! this.validTime(obj.time))
			errors.timeEvent = "L'orario inserito non sembra essere valido.|err";

		return errors;
	},

	/**
	 * Validate recoverPassword template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateRecover: function(recover) {
		var errors = {};
		var obj = this.prepareValidation(recover);

		if (this.notValid('email', obj))
			errors.email = "L'indirizzo e-mail inserito non sembra essere scritto in modo corretto.|err";

		if (this.isEmpty('email', recover))
			errors.email = "Devi specificare l'indirizzo e-mail con il quale ti sei iscritto a Bisiacaria.com|exc";

		return errors;
	},

	/**
	 * Validate the registerUser template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateRegister: function(user) {
		var errors = {};
		var obj = this.prepareValidation(user, {
			'date': 'birthday'
		});

		if (this.notValid('email', obj))
			errors.email = "L'indirizzo e-mail non sembra essere inserito in modo corretto.|err";

		if (this.notValid('password', obj))
			errors.password = "La password inserita è troppo corta e deve contenere almeno 8 caratteri alfanumerici.|err";

		if (this.notMatch('password', 'passwordConfirmed', obj))
			errors.passwordConfirmed = "Le due password non sono corrispondenti.|err";

		if (this.isEmpty('passwordConfirmed', obj))
			errors.passwordConfirmed = "La password di conferma non può essere vuota.|err";

		if (this.notValid('username', obj))
			errors.username = "Il nickname deve essere compreso tra i 3 e i 15 caratteri e può contenere lettere maiuscole e minuscole, numeri e i caratteri - _ .|exc";

		if (! this.validDate(obj.birthday, true))
			errors.birthday = "La data di nascita non sembra essere inserita in un formato valido.|err";

		if (this.validBirthDate(obj.birthday) == 'age18')
			errors.birthday = "Per iscriverti a Bisiacaria.com, come da Regolamento, devi aver compiuto i "+this.allowedAge+" anni d'età.|exc";

		if (this.validBirthDate(obj.birthday) == 'ageHigh')
			errors.birthday = "Hai impostato una data di nascita inverosimile.|exc";

		if (this.isEmpty('birthday', obj))
			errors.birthday = "Devi impostare la tua data di nascita.|exc";

		if (this.notChecked(obj.gender))
			errors.gender = "Devi selezionare se sei uomo o donna.|exc";

		return errors;
	},

	/**
	 * Validate the resetPassword template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateReset: function(reset) {
		var errors = {}
		var obj = this.prepareValidation(reset);

		if (this.notValid('password', obj))
			errors.password = "La password inserita è troppo corta e deve contenere almeno 8 caratteri alfanumerici.|err";

		if (this.isEmpty('passwordConfirmed', obj))
			errors.passwordConfirmed = "La password deve essere confermata.|err";

		if (this.notMatch('password', 'passwordConfirmed', obj))
			errors.passwordConfirmed = "Le due password non sono corrispondenti.|err";

		return errors;
	}
};