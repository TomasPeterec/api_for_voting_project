const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('../config'); // Import config

const protocolsSwitchServer = (app) => {
  if (!config.app.useHttps) {
    return http.createServer(app).listen(config.app.port, () => {
      console.log(`Server is running on http://localhost:${config.app.port}`);
    });
  } else {
    const privateKey = fs.readFileSync(path.resolve(config.ssl.keyPath), 'utf8');
    const certificate = fs.readFileSync(path.resolve(config.ssl.certPath), 'utf8');
    const ca = fs.readFileSync(path.resolve(config.ssl.certPath), 'utf8');

    const httpsOptions = {
      key: privateKey,
      cert: certificate,
      ca,
      requestCert: false,
      rejectUnauthorized: false,
    };

    return https.createServer(httpsOptions, app).listen(config.app.port, () => {
      console.log(`HTTPS Server is running on port ${config.app.port}`);
    });
  }
};

module.exports = protocolsSwitchServer;
