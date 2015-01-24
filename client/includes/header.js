Template.header.helpers({
	activeRouteClass: function(/* route names */) {				// parametri passati andrebbero qua ma "arguments" me li riassume tutti in un array
		var args = Array.prototype.slice.call(arguments, 0);	// Copia "arguments" in un array partendo dal primo elemento (0)
		args.pop();												// Rimuove l'ultimo elemento dall'array

		var active = _.any(args, function(name) {				// Ciascun elemento in args (che è diventato un array grazie a Array.prototype.slice)
			return Router.current() && Router.current().route.getName() === name	// TRUE se c'è una rotta attuale e il nome dell'attuale rotta è quello passato
		});

		return active && 'active';
	}
});