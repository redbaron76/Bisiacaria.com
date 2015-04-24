
// Audio

Bisia.Audio = {

	notyAudio: null,

	init: function(audioFile) {
		var path = Meteor.absoluteUrl('audio/' + audioFile);
		this.notyAudio = new Audio(path);
		this.notyAudio.setAttribute('preload', true);
		return this;
	},

	playNoty: function() {
		if (this.notyAudio) {
			this.notyAudio.play();
		}
		return this;
	}
}