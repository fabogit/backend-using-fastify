const fastify = require('fastify');

const app = fastify({
	logger: {
		// fatal, error, warn, info, debug, trace, silent
		level: 'debug'
	},
	// test for http2 run $ npx h2url http://localhost:3000
	http2: true,
});

// request lifecycle/application lifecycle hooks

// The onRoute event acts when you add an endpoint to the server instance
app.addHook('onRoute', function inspector(routeOptions) {
	app.log.info(routeOptions);
});

// The onRegister event is unique as it performs when a new encapsulated context is created
app.addHook('onRegister', function inspector(plugin, pluginOptions) {
	app.log.info(plugin, pluginOptions);
});

// The onReady event runs when the application is ready to start listening for incoming HTTP requests
app.addHook('onReady', function preLoading(done) {
	app.log.info('onReady');
	done();
});

// whenever a Fastify interface exposes a done or next argument,
// you can omit it and provide an async function instead
app.addHook('onReady', async function preLoadingAsync() {
	app.log.info('async onReady');
	// the done argument is gone!
});

//  The onClose event executes when the server is stopping
app.addHook('onClose', function manageClose(done) {
	app.log.info('onClose');
	done();
});

// Register route
app.route({
	method: 'GET',
	url: '/hi',
	handler: function myHandler(request, reply) {
		reply.send('hi there');
	}
});

app.get('/hello', async function myHandler(request, reply) {
	return 'hello'; // simple returns of a payload
});

function business(request, reply) {
	// `this` is the Fastify application instance
	// reply.send({ helloFrom: this.server.address() });
	return { helloFrom: this.server.address() };
}
app.get('/server', business);

// Start
async function startServer() {
	try {
		await app.listen({
			// set port to 0 to let the operating system assign an unused host’s port
			port: 3001,
			host: '0.0.0.0',
		});

		const { port } = app.server.address();
		app.log.info('HTTP Server port is %i', port);
		app.log.debug(app.initialConfig, 'Fastify listening with the config:');

	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
};

startServer();
