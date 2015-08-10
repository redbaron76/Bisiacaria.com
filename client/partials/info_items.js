Template.infoClose.events({
	'click #info-close': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('info');
	}
});

Template.categoryItem.events({
	'click span': function(e, t) {
		e.preventDefault();
		var text = $(e.target).html();
		$('input#category').val('').val(text);
		Bisia.Ui.unsetReactive('info');
	},
	'click .fa-trash': function(e, t) {
		e.preventDefault();
		var $li = $(e.target).parent('li');
		var text = $li.find('span').html();
		Users.update({_id: Meteor.userId()}, { $pull: {'profile.categories': text} });
		$li.fadeOut('slow').remove();
	}
});

Template.infoConfirm.events({
	'click #confirm-no': function(e, t) {
		e.preventDefault();
		$('#info-close').trigger('click');
	},
	'click #confirm-yes': function(e, t) {
		e.preventDefault();
		Bisia.executeFunctionByName(this.method, window, this.event, this.context);
		Bisia.Ui.unsetReactive('info');
	}
});

Template.infoActions.helpers({
	hasTextToModify: function() {
		return (this.context.text || this.context.context.data.text);
	}
});

Template.infoActions.events({
	'click #edit-post': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('info');
		var context = (this.context.context) ? this.context.context.data : this.context;
		Bisia.Ui.setReactive('info', {
			template: 'infoEdit',
			context: context
		});
	},
	'click #delete-post': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('info');
		var item, art, context = (this.context.context) ? this.context.context.data : this.context;

		switch (context.action) {
			case 'event':
				art = 'L\' ';
				item = 'evento';
				break;
			case 'post':
				art = 'Il ';
				item = 'post';
				break;
			case 'comment':
			case 'commentEvent':
				art = 'Il ';
				item = 'commento';
				break;
		}

		var obj = _.extend(context, {
			infoTitle: "Eliminare questo "+item+"?",
			infoText: art + item + " da te inserito verrà definitivamente eliminato e non sarà più recuperabile."
		});

		switch (obj.action) {
			case 'event':
				Bisia.Ui.confirmDialog('Bisia.Delete.event', e, obj);
				break;
			case 'post':
				Bisia.Ui.confirmDialog('Bisia.Delete.post', e, obj);
				break;
			case 'comment':
				Bisia.Ui.confirmDialog('Bisia.Delete.postComment', e, obj);
				break;
			case 'commentEvent':
				Bisia.Ui.confirmDialog('Bisia.Delete.eventComment', e, obj);
				break;
		}
	}
});

Template.infoEdit.onRendered(function() {
	this.$('.autosize').textareaAutoSize();
});

Template.infoEdit.events({
	'submit #form-edit': function(e, t) {
		e.preventDefault();
		var $target = $(e.target);
		var context = this.context;

		var formObject = Bisia.Form.getFields($target, 'validateEditText');
		formObject = _.extend(formObject, {
			postId: context.postId || context.eventId || context._id,
			action: context.action,
			authorId: context.authorId,
			oldText: context.text
		});

		if(formObject) {
			Meteor.call('saveEditText', formObject, function(error, result) {
				if (error) {
					Bisia.log('saveEditText', error);
					Bisia.Ui.loadingRemove()
							.waitStop();
					return false;
				}

				if (result.errors)
					return Bisia.Ui.submitError(result.errors);

				if (result) {
					Bisia.Ui.loadingRemove()
							.waitStop()
							.submitSuccess('Il testo è stato modificato correttamente.', 'Modificato!', null, true);
				}
			});
		}

	}
});

Template.blockedItem.events({
	'click .fa-trash': function(e, t) {
		e.preventDefault();
		var $li = $(e.target).parents('li.blocked');
		var blockedId = this._id;
		Meteor.call('unblockUser', blockedId, function(error, result) {
			if (result)
				$li.fadeOut('slow').remove();
		});
	}
});

Template.geotagList.events({
	'click #just-position': function(e, t) {
		e.preventDefault();
		if (this.position) {
			Bisia.Map.saveFlyPosition(this.position);
		} else {
			Bisia.Ui.unsetReactive('map');
			Bisia.Ui.unsetReactive('info');
		}
	}
});

Template.geotagItem.events({
	'click span.apply-tag': function(e, t) {
		e.preventDefault();
		if (this.save) {
			var position = {
				tagId: this.data._id,
				lat: this.data.lat,
				lng: this.data.lng,
				tag: this.data.tag
			};
			if (this.position.location) {
				position = _.extend(position, {
					location: this.position.location
				});
			}
			Bisia.Map.saveFlyPosition(position);
		} else {
			var $target = $(e.target);
			var text = $target.html();
			var tagId = $target.data('id');
			var location = $target.data('location');

			// Append tagId to form
			var $mapButton = $('#map-position');
			var input = $('<input/>', {type: 'hidden', name: 'tagId', value: tagId, id: 'tag-id'});
			$mapButton.parent('form').append(input);

			$('input#geotag, textarea#location-event').val('').val(text);
			Bisia.Ui.unsetReactive('map');
		}
		Bisia.Ui.unsetReactive('info');
	},
	'click .fa-trash': function(e, t) {
		e.preventDefault();
		var $li = $(e.target).parent('li');
		var placeId = $(e.target).data('id');
		Bisia.Ui.confirmDialog('Bisia.User.deletePlace', e, {
			placeId: placeId,
			liItem: $li,
			infoTitle: 'Eliminre la posizione salvata?'
		});
	}
});

Template.welcomeNewUser.helpers({
	checkFacebook: function(user) {
		return {
			isFB: user.profile.loggedWith === 'facebook'
		}
	}
});

Template.welcomeNewUser.events({
	'click #go-settings': function(e, t) {
		e.preventDefault();
		Bisia.Ui.unsetReactive('info');
		$('#settings-link').trigger('click');
		Router.go('userSettings');
	},
	'change #set-newuserhint': function(e, t) {
		var status = e.currentTarget.checked;
		Users.update(Meteor.userId(), {'$set': {'profile.flags.newUserHint': status}});
	},
});