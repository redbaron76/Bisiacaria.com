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