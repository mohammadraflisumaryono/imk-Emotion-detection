function debugCapture(videoElement, participant) {
    console.group('Debug Capture - Participant:', participant.displayName);
    console.log('Video Element:', videoElement);
    console.log('Video Dimensions:', {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight
    });

    // Debug canvas capture
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');

    try {
        ctx.drawImage(videoElement, 0, 0);
        console.log('Canvas capture successful');
        // Display captured image in debug div
        const debugDiv = getDebugDiv();
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/jpeg');
        img.style.width = '200px';
        debugDiv.appendChild(img);
    } catch (error) {
        console.error('Canvas capture failed:', error);
    }

    console.groupEnd();
}

function getDebugDiv() {
    let debugDiv = document.getElementById('debug-container');
    if (!debugDiv) {
        debugDiv = document.createElement('div');
        debugDiv.id = 'debug-container';
        debugDiv.style.position = 'fixed';
        debugDiv.style.left = '10px';
        debugDiv.style.top = '10px';
        debugDiv.style.zIndex = '9999';
        debugDiv.style.background = 'rgba(0,0,0,0.8)';
        debugDiv.style.padding = '10px';
        debugDiv.style.color = 'white';
        document.body.appendChild(debugDiv);
    }
    return debugDiv;
}

// Modify captureAndAnalyze function to include debugging
async function captureAndAnalyze(videoElement, participant) {
    debugCapture(videoElement, participant);

    try {
        const response = await fetch('http://localhost:3000/api/analyze-emotion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: imageData,
                participantId: participant.participantId,
                displayName: participant.displayName
            })
        });

        const result = await response.json();
        console.log('API Response:', result);

        if (!result.success) {
            throw new Error(result.error);
        }

        updateEmotionDisplay(participant.participantId, result.emotion);
    } catch (error) {
        console.error('Analysis Error:', error);
        updateDebugStatus(`Error: ${error.message}`);
    }
}

function updateDebugStatus(message) {
    const debugDiv = getDebugDiv();
    const status = document.createElement('div');
    status.textContent = `${new Date().toISOString()}: ${message}`;
    debugDiv.insertBefore(status, debugDiv.firstChild);

    // Keep only last 10 messages
    while (debugDiv.children.length > 10) {
        debugDiv.removeChild(debugDiv.lastChild);
    }
}