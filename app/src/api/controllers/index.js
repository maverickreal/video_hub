const router  = require('express').Router(),
      Handler = require('../handlers/'),
      upload  = require('../../logic/upload/');

router.post('/api/upload', upload.single('video'), Handler.uploadVideo);
router.get('/api/download/:videoId', Handler.downloadVideo);
router.get('/api/stream/:videoId', Handler.streamVideo);

module.exports = router;