
// Bisia Validation

Bisia.Validation = {

	/**
	 * The minimum allowed age
	 * @type {Number}
	 */
	allowedAge: 18,

	/**
	 * Check icon
	 * @type {jQuery Object}
	 */
	// $check: null,

	/**
	 * The field under validation
	 * @type {jQuery Object}
	 */
	// $field: null,

	/**
	 * The form where to validate fields
	 * @type {jQuery Object}
	 */
	$form: null,

	/**
	 * The group that wraps a field
	 * @type {jQuery Object}
	 */
	// $group: null,

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
		return !this.regEx(regEx).test(obj[str]);
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
	 * Validate the birthday
	 * @param  {String}
	 * @return {Boolean}
	 */
	validBirthDate: function(birthdayDate) {
		var bDay = moment(birthdayDate, "DD-MM-YYYY", true);
		if (!birthdayDate || !bDay.isValid())
			return false;
		// Valid date 18 years ago
		var validDate = moment().subtract(this.allowedAge, 'y');
		var maxDate = moment().subtract(100, 'y');
		if (bDay.toDate() >= validDate.toDate())
			return 'age18';
		if (bDay.toDate() <= maxDate.toDate())
			return 'ageHigh';
		return true;
	},

	/**
	 * Validate loginUser template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateLogin: function(login) {
		var errors = {};

		if (this.notValid('email', login))
			errors.email = "L'indirizzo e-mail non sembra essere valido";

		if (this.notValid('password', login))
			errors.password = "La password deve contenere almeno 8 caratteri alfanumerici";

		return errors;
	},

	/**
	 * Validate userSettings Profile Data form
	 * @param  {Object}
	 * @return {Object}
	 */
	validateProfileData: function(user) {
		var errors = {};

		if (this.notValid('username', user))
			errors.username = "Deve contenere tra 3 e 15 caratteri";

		if (_.isNull(user.profile.birthday))
			errors.birthday = "La data inserita non è valida";

		if (this.validBirthDate(user.profile.birthday) == 'age18')
			errors.birthday = "Per iscriverti devi aver compiuto "+this.allowedAge+" anni";

		if (this.validBirthDate(user.profile.birthday) == 'ageHigh')
			errors.birthday = "Hai superato i limiti d'età consentiti";

		if (this.notValid('city', user.profile, 'empty'))
			errors.city = "La posizione non può essere vuota";

		if (this.notChecked(user.profile.status))
			errors.status = "Devi impostare lo stato sentimentale";

		return errors;
	},

	/**
	 * Validate userSettings Account Data form
	 * @param  {Object}
	 * @return {Object}
	 */
	validateAccountData: function(user) {
		var errors = {};

		if (this.notValid('email', user))
			errors.email = "L'indirizzo e-mail non sembra essere valido";

		if (this.notEmpty('password', user) && this.notValid('password', user))
			errors.password = "La password deve contenere almeno 8 caratteri";

		if (this.notEmpty('password', user) && this.notMatch('password', 'passwordConfirmed', user))
			errors.passwordConfirmed = "Le due password non sono corrispondenti";

		if (this.notEmpty('password', user) && this.notValid('passwordConfirmed', user, 'empty'))
			errors.passwordConfirmed = "La password non può essere vuota";

		return errors;
	},

	/**
	 * Validate recoverPassword template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateRecover: function(recover) {
		var errors = {};
		if (this.notValid('emailRecover', recover, 'email'))
			errors.emailRecover = "L'indirizzo mail non sembra essere valido";

		return errors;
	},

	/**
	 * Validate the registerUser template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateRegister: function(user) {
		var errors = {};

		if (this.notValid('username', user))
			errors.username = "Deve contenere tra 3 e 15 caratteri";

		if (this.notChecked(user.profile.gender))
			errors.gender = "Devi impostare se sei uomo o donna";

		if (_.isNull(user.profile.birthday))
			errors.birthday = "La data inserita non è valida";

		if (this.validBirthDate(user.profile.birthday) == 'age18')
			errors.birthday = "Per iscriverti devi aver compiuto "+this.allowedAge+" anni";

		if (this.validBirthDate(user.profile.birthday) == 'ageHigh')
			errors.birthday = "Hai superato i limiti d'età consentiti";

		if (this.notValid('email', user))
			errors.email = "L'indirizzo e-mail non sembra essere valido";

		if (this.notValid('password', user))
			errors.password = "La password deve contenere almeno 8 caratteri";

		if (this.notMatch('password', 'passwordConfirmed', user))
			errors.passwordConfirmed = "Le due password non sono corrispondenti";

		if (this.notValid('passwordConfirmed', user, 'empty'))
			errors.passwordConfirmed = "La password non può essere vuota";

		return errors;
	},

	/**
	 * Validate the resetPassword template
	 * @param  {Object}
	 * @return {Object}
	 */
	validateReset: function(reset) {
		var errors = {};

		if (this.notValid('password', reset))
			errors.password = "La nuova password deve contenere almeno 8 caratteri";

		if (this.notMatch('password', 'passwordConfirmed', reset))
			errors.passwordConfirmed = "Le due password non sono corrispondenti";

		if (this.notValid('passwordConfirmed', reset, 'empty'))
			errors.passwordConfirmed = "La password non può essere vuota";

		return errors;
	}
};