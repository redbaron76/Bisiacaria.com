
// Form

Bisia.Form = {

	$form: null,

	formIds: {},

	formFields: [],

	checkboxes: {},

	/**
	 * Clean all fields in the submitted form
	 * @param  {String} postAction
	 * @return {Void}
	 */
	cleanFormFields: function(postAction) {
		var parent = this;
		_.each(this.$form, function(form) {
			form.reset();
		});
		if(!_.isEmpty(postAction)) {
			if (postAction.call) {
				_.each(postAction.call, function(func, index) {
					Bisia.executeFunctionByName(func, window);
				});
			}
		}
		this.formFields = [];
	},

	/**
	 * Create loc object to extend the main object
	 * @param  {Object} position
	 * @return {Object}
	 */
	createMapLoc: function(position) {
		return {
			loc: [parseFloat(position.lat), parseFloat(position.lng)]
		};
	},

	/**
	 * Transform the id to a Mongo property
	 * @param  {String} idValue
	 * @return {String}
	 */
	formatIdField: function(idValue) {
		var parent = this;
		var str, values = idValue.replace('_', '-').split('-');
		_.each(values, function(el, index) {
			if ($.inArray(idValue, parent.formFields) < 0) {
				parent.formFields.push(idValue);
			}
			if (index == 0) {
				str = el;
			} else {
				str += el.charAt(0).toUpperCase() + el.slice(1);
			}
		});
		this.formIds[str] = idValue;
		return str;
	},

	/**
	 * Get a formatted object from form submission
	 * @param  {$Object} $form
	 * @param  {Object} validation
	 * @param  {Object} mapping
	 * @param  {Object} adds
	 * @param  {Object} transforms
	 * @return {Object|Bool}
	 */
	getFields: function($form, validation, mapping, adds, transforms, remapping) {
		var parent = this;
		var inputs = {};
		var obj = {};
		this.$form = $form;
		this.$form.find('input[type!=file], select, textarea').each(function() {
			var $this = $(this);
			var type = $this.attr('type');
			var id = $this.attr('id');
			var field = $this.data('create') ? $this.data('create') : parent.formatIdField(id);
			if (type == 'radio' || type == 'checkbox') {
				//parent.checkboxes = {};
				field = $this.attr('name');
				if ($this.is(':checked')) {
					if (type == 'checkbox') {
						if ( ! _.has(parent.checkboxes, field)) {
							parent.checkboxes[field] = [];
						}
						parent.checkboxes[field].push($this.val());
					} else {
						inputs[field] = $this.val();
					}
				}
			} else {
				inputs[field] = $this.val();
			}
		});

		if (!_.isEmpty(this.checkboxes)) {
			for (var checkbox in this.checkboxes) {
				inputs[checkbox] = this.checkboxes[checkbox];
			}
		}

		if(!_.isEmpty(mapping)) {
			for (var key in mapping) {
				Bisia.createNestedObject(inputs, mapping[key].split('.'), inputs[key], true);
				inputs = _.omit(inputs, key);
			}
		}

		if (!_.isEmpty(adds)) {
			for (var key in adds) {
				var objArray = key.split('.');
				var targetObj = objArray[0];
				if (targetObj.indexOf('?') > -1) {
					targetObj = targetObj.replace('?', '');
					if (!_.isEmpty(inputs[targetObj])) {
						objArray = key.replace('?', '').split('.');
						Bisia.createNestedObject(inputs, objArray, adds[key]);
					}
				} else {
					if ( ! Bisia.checkNestedObject(inputs, key)) {
						Bisia.createNestedObject(inputs, objArray, adds[key], true);
					}
				}
			}
		}

		if (!_.isEmpty(validation)) {
			if (Bisia.Validation.fieldsAreValid(inputs, validation)) {
				if (!_.isEmpty(transforms)) {
					for (var key in transforms) {
						inputs[key] = Bisia.executeFunctionByName(transforms[key], window, inputs[key]);
					}
				}
				if (!_.isEmpty(remapping)) {
					for (var key in remapping) {
						Bisia.createNestedObject(inputs, key.split('.'), inputs[remapping[key]], true);
						inputs = _.omit(inputs, remapping[key]);
					}
				}
				parent.checkboxes = {};
				return inputs;
			} else {
				return false;
			}
		} else {
			parent.checkboxes = {};
			return inputs;
		}
	},

	/**
	 * Strip aout html code except allowed
	 * @param  {[type]} text [description]
	 * @return {[type]}      [description]
	 */
	sanitizeHTML: function(text) {
		if (text) {
			return sanitizeHtml(text, {
				allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
				allowedAttributes: {
					'a': [ 'href' ]
				}
			});
		}
		return text;
	},

	triggerSubmit: function(e) {
		var $btn = $(e.currentTarget);
		var target = $btn.data('target');
		var $form = $('#'+target);
		var $submit = $form.find('[type=submit]');

		if ($submit.length > 0) {
			$submit.trigger('click');
		} else {
			$form.submit();
		}
	},

	formatEmoj: function(str) {
		var parent = this;
		var found, string = str;
		var asciiList = this.getAsciiEmoj();

		_.each(asciiList, function(smiley, emoj) {
			var s = parent.regExpEscape(emoj)
			var pattern = '('+s+')(?=\s|$)';
			// var pattern = '(^|)('+s+')(?=\s|$)';
			found = new RegExp(pattern, 'gm');
			string = string.replace(found, smiley);
		});

		console.log(string.replace(/&amp;/g, '&'));
		return string;
	},

	regExpEscape: function(text) {
		return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	},

	getAsciiEmoj: function() {
		var asciiList = {
			'<3':':heart:',
			'</3':':broken_heart:',
			':D':':smiley:',
			':-D':':smiley:',
			'=D':':smiley:',
			':)':':smile:',
			':-)':':smile:',
			'=]':':smile:',
			'=)':':smile:',
			':]':':smile:',
			';)':':wink:',
			';-)':':wink:',
			';-]':':wink:',
			';]':':wink:',
			';D':':wink:',
			':*':':kissing_heart:',
			':-*':':kissing_heart:',
			'X-P':':stuck_out_tongue_winking_eye:',
			'x-p':':stuck_out_tongue_winking_eye:',
			':-(':':disappointed:',
			':(':':disappointed:',
			':-[':':disappointed:',
			':[':':disappointed:',
			':@':':angry:',
			';(':':cry:',
			';-(':':cry:',
			'X)':':dizzy_face:',
			'X-)':':dizzy_face:',
			'O:-)':':innocent:',
			'0:-)':':innocent:',
			'0:)':':innocent:',
			'O:)':':innocent:',
			'O;-)':':innocent:',
			'O=)':':innocent:',
			'0;-)':':innocent:',
			'B-)':':sunglasses:',
			'B)':':sunglasses:',
			'8)':':sunglasses:',
			'8-)':':sunglasses:',
			'B-D':':sunglasses:',
			'8-D':':sunglasses:',
			':-/':':confused:',
			':/':':confused:',
			':L':':confused:',
			':P':':stuck_out_tongue:',
			':-P':':stuck_out_tongue:',
			':-p':':stuck_out_tongue:',
			':p':':stuck_out_tongue:',
			':-b':':stuck_out_tongue:',
			':b':':stuck_out_tongue:',
			':-0':':open_mouth:',
			':0':':open_mouth:',
			':-o':':open_mouth:',
			':o':':open_mouth:',
			':O':':open_mouth:',
			':-O':':open_mouth:',
			':-X':':no_mouth:',
			':X':':no_mouth:',
			':x':':no_mouth:',
			':-x':':no_mouth:',
			'!3': ':thumbsup:',
			'(Y)': ':thumbsup:',
			'(N)': ':thumbsdown:'
		};
		return asciiList;
	}

};