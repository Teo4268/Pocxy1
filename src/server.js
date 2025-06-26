/**
 * Dependencies
 */
var http    = require('http');
var https   = require('https');
var fs      = require('fs');
var ws      = require('ws');
var modules = require('./modules');
var mes     = require('./message');

/**
 * Proxy constructor
 */
var Proxy = require('./proxy');

// ⬇️ Thêm biến lưu danh sách client WebSocket đang kết nối
var clients = new Set();

/**
 * Initiate a server
 */
var Server = function Init(config) {
	var opts = {
		clientTracking: false,
		verifyClient:   onRequestConnect
	};

	if(config.ssl) {
		opts.server = https.createServer({
			key: fs.readFileSync( config.key ),
			cert: fs.readFileSync( config.cert ),
		}, function(req, res) {
			res.writeHead(200);
			res.end("Secure wsProxy running...\n");
		});

		opts.server.listen(config.port);
		mes.status("Starting a secure wsProxy on port %s...", config.port);
	}
	else {
		opts.server = http.createServer(function(req, res) {
			res.writeHead(200);
			res.end("wsProxy running...\n");
		});

		opts.server.listen(config.port);
		mes.status("Starting wsProxy on port %s...", config.port);
	}

	var WebSocketServer = new ws.Server(opts);

	WebSocketServer.on('connection', onConnection);

	// 🕒 Ghi log số kết nối mỗi 3 giây
	setInterval(() => {
		mes.status("Hiện có %s kết nối đang hoạt động.", clients.size);
	}, 3000);

	return this;
};


/**
 * Before establishing a connection
 */
function onRequestConnect(info, callback) {
	modules.method.verify(info, function(res) {
		callback(res);
	});
}


/**
 * Connection passed through verify, let's initiate a proxy
 */
function onConnection(ws) {
	clients.add(ws); // 🟢 Khi có client kết nối

	ws.on('close', () => {
		clients.delete(ws); // 🔴 Khi client đóng
	});

	modules.method.connect(ws, function(res) {
		new Proxy(ws);
	});
}


/**
 * Exports
 */
module.exports = Server;
