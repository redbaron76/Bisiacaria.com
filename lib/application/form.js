
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
		_.each(this.formFields, function(el, index) {
			parent.$form.find('#'+el).val('');
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
		this.$form.find('input, select, textarea').each(function() {
			var $this = $(this);
			var type = $this.attr('type');
			var id = $this.attr('id');
			var field = $this.data('create') ? $this.data('create') : parent.formatIdField(id);
			if (type == 'radio' || type == 'checkbox') {
				field = $this.attr('name');
				if ($this.is(':checked')) {
					if (type == 'checkbox') {
						if (!parent.checkboxes[field]) {
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
			return inputs;
		} else {
			return false;
		}

	},

	triggerSubmit: function(e) {
		var $btn = $(e.currentTarget);
		var target = $btn.data('target');
		var $form = $('#'+target);
		$form.find('[type=submit]').trigger('click');
	}

};