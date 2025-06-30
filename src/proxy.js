const CryptoJS = require('crypto-js');

/**
 * Dependencies
 */
const net = require('net');
const mes = require('./message');
const secretKey = "64df901bab326cd3215f381da1f960d5f279b4d62442981dff7d12725f55dfa0";

// Function to encrypt a message
function encrypt(message) {
	const encrypted = CryptoJS.AES.encrypt(message, secretKey).toString();
	return Buffer.from(encrypted);
}

// Function to decrypt a message
function decrypt(message) {
	const bytes = CryptoJS.AES.decrypt(message, secretKey);
	return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Constructor
 */
const Proxy = function Constructor(ws, req) {
	const toBase64 = req.url.substring(1); // lấy phần sau dấu `/`
	this._from = req.socket.remoteAddress;

	try {
		this._to = Buffer.from(toBase64, 'base64').toString();
	} catch (e) {
		console.error("Lỗi decode base64 từ URL:", toBase64);
		ws.close();
		return;
	}

	this._tcp = null;
	this._ws = ws;

	// Bind WebSocket events
	this._ws.on('message', this.clientData.bind(this));
	this._ws.on('close', this.close.bind(this));
	this._ws.on('error', (error) => {
		console.log(error);
	});

	// Connect to TCP server
	const args = this._to.split(':');
	mes.info("Requested connection from '%s' to '%s' [ACCEPTED].", this._from, this._to);
	this._tcp = net.connect(args[1], args[0]);

	this._tcp.setTimeout(0);
	this._tcp.setNoDelay(true);

	this._tcp.on('data', this.serverData.bind(this));
	this._tcp.on('close', this.close.bind(this));
	this._tcp.on('error', function (error) {
		console.log(error);
	});

	this._tcp.on('connect', this.connectAccept.bind(this));
};

/**
 * OnClientData
 * Client -> Server
 */
Proxy.prototype.clientData = function (data) {
	if (!this._tcp) return;

	try {
		const msg = decrypt(data.toString());
		this._tcp.write(msg);
	} catch (e) {
		console.error("Decrypt client data lỗi:", e);
	}
};

/**
 * OnServerData
 * Server -> Client
 */
Proxy.prototype.serverData = function (data) {
	const msg = encrypt(data.toString());
	this._ws.send(msg, (error) => {
		if (error) {
			console.error("Send to client lỗi:", error);
		}
	});
};

/**
 * OnClose
 */
Proxy.prototype.close = function () {
	if (this._tcp) {
		mes.info("Connection closed from '%s'.", this._to);
		this._tcp.end();
		this._tcp = null;
	}
	if (this._ws) {
		mes.info("Connection closed from '%s'.", this._from);
		this._ws.close();
		this._ws = null;
	}
};

/**
 * On server accepts connection
 */
Proxy.prototype.connectAccept = function () {
	mes.status("Connection accepted from '%s'.", this._to);
};

/**
 * Exports
 */
module.exports = Proxy;
