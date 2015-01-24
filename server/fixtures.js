// Fixture USERS data

if (Users.find().count() === 0) {
	var now = new Date().getTime();

	var b = moment("1976-08-13", "YYYY-MM-DD", true);

	var redbaron76Id = Accounts.createUser({
		username: 'redbaron76',
		email: 'f.fumis@gmail.com',
		password: 'ciaociao',
		profile: {
			avatar: '/img/redbaron76.jpg',
			birthday: b.toDate(),
			bio: 'Freelance Web Developer e Fondatore di Bisiacaria.com',
			city: 'Monfalcone',
			gender: 'male',
			status: 'free',
			online: false,
			loggedWith: 'password'
		}
	});

	Bisia.log(b.toDate());

	var b = moment("1981-09-10", "YYYY-MM-DD", true);

	var nikymedId = Accounts.createUser({
		username: 'nikymed',
		email: 'redbaron76@me.com',
		password: 'ciaociao',
		profile: {
			avatar: '/img/nikymed.jpg',
			birthday: b.toDate(),
			bio: "Medico internista presso l'Ospedale di Gorizia",
			city: 'Monfalcone',
			gender: 'female',
			status: 'busy',		// busy, none, free
			online: false,
			loggedWith: 'password'
		}
	});

	Bisia.log(b.toDate());
}