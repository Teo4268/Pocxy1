const http = require('http');
const https = require('https');
const fs = require('fs');
const ws = require('ws');
const modules = require('./modules');
const Proxy = require('./proxy');

const clients = new Set();

const Server = function Init(config) {
	const opts = {
		clientTracking: false,
		verifyClient: onRequestConnect,
	};

	if (config.ssl) {
		opts.server = https.createServer(
			{
				key: fs.readFileSync(config.key),
				cert: fs.readFileSync(config.cert),
			},
			(req, res) => {
				if (req.url === '/stats') {
					res.writeHead(200, { 'Content-Type': 'application/json' });
					res.end(JSON.stringify({ connections: clients.size }));
				} else {
					res.writeHead(200);
					res.end();
				}
			}
		);
		opts.server.listen(config.port);
	} else {
		opts.server = http.createServer((req, res) => {
			if (req.url === '/stats') {
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ connections: clients.size }));
			} else {
				res.writeHead(200);
				res.end();
			}
		});
		opts.server.listen(config.port);
	}

	const WebSocketServer = new ws.Server(opts);
	WebSocketServer.on('connection', onConnection);

	// Log định kỳ
	// Log định kỳ số kết nối mỗi 10 giây
	setInterval(() => {
		console.log(`[STATS] Current WebSocket connections: ${clients.size}`);
	}, 10000);

	return this;
};

function onRequestConnect(info, callback) {
	modules.method.verify(info, (res) => {
		callback(res);
	});
}

function onConnection(ws) {
	clients.add(ws);
	ws.on('close', () => clients.delete(ws));
	modules.method.connect(ws, () => new Proxy(ws));
}

module.exports = Server;
