
/* frontend/js/app.js */
document.addEventListener('DOMContentLoaded', () => {
    const domain = '8x8.vc';
    const options = {
        roomName: 'vpaas-magic-cookie-6c22b6b66b974fcdbd18e4437dcadec7/SampleAppRoundCutsProposeHourly',
        parentNode: document.querySelector('#jaas-container')
    };

    const api = new JitsiMeetExternalAPI(domain, options);
    initEmotionDetection(api);
});
