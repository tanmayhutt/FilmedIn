// Vercel serverless entry point — imports Express app and lets Vercel handle HTTP
const app = require('../backend/src/server');
module.exports = app;
