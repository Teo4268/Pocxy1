/**
 * Đơn giản hoá: chạy 1 process duy nhất (không dùng cluster)
 */
var Main = module.exports = function Init(config) {
    // Gọi trực tiếp Server khởi tạo WebSocket proxy
    var Server = require('./server');
    var server = new Server(config);
};
