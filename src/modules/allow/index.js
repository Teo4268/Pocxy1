// Danh sách IP:HOST được phép
var allowed_ip = require('../../../allowed');

function checkAllowed(info, next) {
	var target = info.req.url.substr(1);
	var from   = info.req.connection.remoteAddress;

	// Reject nếu không nằm trong danh sách
	if (allowed_ip.length && allowed_ip.indexOf(target) < 0) {
		console.log("Reject requested connection from '%s' to '%s'.", from, target);
		next(false);
		return;
	}

	next(true);
}

module.exports = {
	verify: checkAllowed
}
