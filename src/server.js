/**
 * Dependencies
 */
const http    = require('http');
const https   = require('https');
const fs      = require('fs');
const ws      = require('ws');
const modules = require('./modules');
const mes     = require('./message');
const Proxy   = require('./proxy'); // Proxy constructor

/**
 * Initiate a server
 */
const Server = function Init(config) {
	const opts = {
		clientTracking: false,
		verifyClient:   onRequestConnect
	};

	if (config.ssl) {
		opts.server = https.createServer({
			key: fs.readFileSync(config.key),
			cert: fs.readFileSync(config.cert),
		}, (req, res) => {
			res.writeHead(200);
			res.end("Secure wsProxy running...\n");
		});

		opts.server.listen(config.port);
		mes.status("Starting a secure wsProxy on port %s...", config.port);
	} else {
		opts.server = http.createServer((req, res) => {
			res.writeHead(200);
			res.end("wsProxy running...\n");
		});

		opts.server.listen(config.port);
		mes.status("Starting wsProxy on port %s...", config.port);
	}

	const WebSocketServer = new ws.Server(opts);

	// ✅ Phải khai báo (ws, req) để lấy req.url
	WebSocketServer.on('connection', onConnection);

	return this;
};

/**
 * Xác minh trước khi cho kết nối vào
 */
function onRequestConnect(info, callback) {
	modules.method.verify(info, (res) => {
		callback(res);
	});
}

/**
 * Khi đã xác minh xong, tạo kết nối Proxy
 */
function onConnection(ws, req) {
	modules.method.connect(ws, (res) => {
		new Proxy(ws, req); // ✅ Truyền thêm `req`
	});
}

/**
 * Exports
 */
module.exports = Server;
