// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Endpoint untuk analisis emosi
app.post('/analyze-emotion', async (req, res) => {
    const { image } = req.body;

    try {
        // Simpan image ke file temporary
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        const tempFile = path.join(tempDir, `image_${Date.now()}.jpg`);
        fs.writeFileSync(tempFile, image.replace(/^data:image\/jpeg;base64,/, ''), 'base64');

        // Jalankan Python script
        const pythonProcess = spawn('python', ['emotion_detection.py', tempFile]);

        let result = '';

        pythonProcess.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            // Hapus file temporary
            fs.unlinkSync(tempFile);

            if (code !== 0) {
                return res.status(500).json({ error: 'Failed to process image' });
            }

            try {
                const emotions = JSON.parse(result);
                res.json({ success: true, emotions });
            } catch (e) {
                res.status(500).json({ error: 'Invalid response format' });
            }
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});