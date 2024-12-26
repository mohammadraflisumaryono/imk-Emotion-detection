
// backend/utils/processImage.js
const { spawn } = require('child_process');
const path = require('path');

function processImage(imagePath) {
    return new Promise((resolve, reject) => {
        const pythonScript = path.join(__dirname, '..', 'python', 'emotion_detection.py');
        const process = spawn('python', [pythonScript, imagePath]);

        let emotion = '';

        process.stdout.on('data', (data) => {
            emotion += data.toString();
        });

        process.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}`));
                return;
            }
            resolve(emotion.trim());
        });
    });
}

module.exports = { processImage };

