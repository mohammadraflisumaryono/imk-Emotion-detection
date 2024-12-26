
// backend/routes/emotion.js
const express = require('express');
const router = express.Router();
const { processImage } = require('../utils/processImage');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

router.post('/analyze-emotion', async (req, res) => {
    try {
        const { image, participantId } = req.body;

        // Save base64 image to temp file
        const imagePath = path.join(__dirname, '..', 'temp', `${participantId}.jpg`);
        const base64Data = image.replace(/^data:image\/jpeg;base64,/, '');

        fs.writeFileSync(imagePath, base64Data, 'base64');

        // Process image with Python script
        const emotion = await processImage(imagePath);

        // Clean up temp file
        fs.unlinkSync(imagePath);

        res.json({ success: true, emotion });
    } catch (error) {
        console.error('Error processing emotion:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
