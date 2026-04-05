const logger = require('../config/logger');
const { Counter, Histogram } = require('prom-client');

const httpRequestCounter = new Counter({
  name: 'placement_tracker_http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'placement_tracker_http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

exports.requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;

    httpRequestCounter.labels(req.method, route, res.statusCode).inc();
    httpRequestDuration.labels(req.method, route).observe(duration);

    if (process.env.NODE_ENV !== 'test') {
      logger.debug(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}s`);
    }
  });

  next();
};
