const client = require('prom-client');

client.collectDefaultMetrics();

const httpRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'Tong so HTTP request',
    labelNames: ['method', 'route', 'status'],
});

const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Thoi gian xu ly HTTP request (giay)',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
});

const SKIP = new Set(['/metrics', '/health', '/ready']);

const metricsMiddleware = (req, res, next) => {
    if (SKIP.has(req.path)) return next();
    const end = httpDuration.startTimer();
    res.on('finish', () => {
        const route = req.route && req.route.path ? req.route.path : 'unmatched';
        const labels = { method: req.method, route, status: String(res.statusCode) };
        httpRequests.inc(labels);
        end(labels);
    });
    next();
};

const metricsHandler = async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
};

module.exports = { metricsMiddleware, metricsHandler };
