// CHI DUNG DE DEMO CANARY: ep moi response (tru probe/metrics) tra HTTP 500.
// Ghi de statusCode o tang http nen middleware metrics van dem dung loi 5xx.
const http = require('http');

const PASS = new Set(['/health', '/ready', '/metrics']);
const originalWriteHead = http.ServerResponse.prototype.writeHead;

http.ServerResponse.prototype.writeHead = function (statusCode, ...rest) {
    const path = ((this.req && this.req.url) || '').split('?')[0];
    if (!PASS.has(path)) statusCode = 500;
    return originalWriteHead.call(this, statusCode, ...rest);
};
