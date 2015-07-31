// Bisia Menu

Bisia.Menu = {

	structure: [
		{
			"key": "news",
			"icon": "fa-star",
			"label": "Novità da chi conosci",
			"path": "newsList",
			"nClass": "live"
		},
		{
			"key": "around",
			"icon": "fa-map-marker",
			"label": "Utenti geotaggati",
			"newLabel": "Utenti nei dintorni <small>(0.5km)</small>",
			"action": "around-you",
			"nClass": "live"
		},
		{
			"key": "message",
			"icon": "fa-envelope",
			"label": "Messaggi privati",
			"path": "getMessages",
			"nClass": "new",
		},
		{
			"key": "event",
			"icon": " fa-calendar",
			"label": "Eventi della settimana",
			"path": "eventList",
			"nClass": "new",
			"spacer": true
		},
		{
			"key": "birthday",
			"icon": " fa-birthday-cake",
			"label": "Compleanni di oggi",
			"path": "birthdayList",
			"nClass": "new"
		},
		{
			"key": "poker",
			"icon": " fa-usd",
			"label": "Crediti per il Bis-Poker",
			"path": "bisPoker",
			"nClass": "new"
		},
		{
			"key": "visit",
			"icon": "fa-exclamation-circle",
			"label": "Ti hanno visitato",
			"path": "visitsList",
			"nClass": "new",
			"spacer": true
		},
		{
			"key": "vote",
			"icon": "fa-thumbs-up",
			"label": "Voti ricevuti",
			"path": "votesList",
			"nClass": "new"
		},
		{
			"key": "friend",
			"icon": "fa-child",
			"label": "Ti conoscono",
			"path": "friendsList",
			"nClass": "new"
		},
		{
			"key": "youknow",
			"icon": "fa-user",
			"label": "Le tue conoscenze",
			"path": "youKnowList",
			"nClass": "new"
		}
	]
}