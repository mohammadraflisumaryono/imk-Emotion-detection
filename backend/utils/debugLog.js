// Add to backend/utils/debugLog.js
const fs = require('fs');
const path = require('path');

class DebugLog {
    constructor() {
        this.logPath = path.join(__dirname, '../logs');
        if (!fs.existsSync(this.logPath)) {
            fs.mkdirSync(this.logPath);
        }
    }

    request(req) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body
        };

        this.writeLog('requests.log', logEntry);
    }

    error(error) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack
        };

        this.writeLog('errors.log', logEntry);
    }

    writeLog(filename, data) {
        const logFile = path.join(this.logPath, filename);
        const logLine = JSON.stringify(data) + '\n';

        fs.appendFile(logFile, logLine, (err) => {
            if (err) console.error('Logging failed:', err);
        });
    }
}

module.exports = new DebugLog();
