
// Audio

Bisia.Audio = {

	justPlayed: false,

	notyAudio: null,
	presentAudio: null,

	notyFile: 'noty.mp3',
	presentFile: 'present.mp3',

	init: function() {
		var notyPath = this.getFilePath(this.notyFile);
		var presentPath = this.getFilePath(this.presentFile);

		this.notyAudio = new Audio(notyPath);
		this.notyAudio.setAttribute('preload', true);

		this.presentAudio = new Audio(presentPath);
		this.presentAudio.setAttribute('preload', true);

		return this;
	},

	playNoty: function() {
		if (this.notyAudio && Bisia.User.notifyAudio && ! this.justPlayed) {
			this.notyAudio.play();
			this.justPlayed = true;
		}
	},

	playPresent: function() {
		if (this.presentAudio && Bisia.User.notifyAudio) {
			this.presentAudio.play();
		}
	},

	getFilePath: function(audioFile) {
		return Meteor.absoluteUrl('audio/' + audioFile);
	}
}