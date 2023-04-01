const   path = require('path'),
        fs   = require('fs');


const logAndError = (err, res) => {
    console.log(err);
    res.status(500).send('Internal server error!');
}

class Handler {
    static async uploadVideo(req, res){
        try{
            if(req.file){
                res.status(200).send('Uploaded.');
            }
            else{
                res.status(400).send('Proper video file not provided with.');
            }
        } catch(err){
            logAndError(err, res);
        }
    }
    static async downloadVideo(req, res){
        try{
            const fileName   = `${req.params.videoId}.mp4`,
                  filePath   = path.join(__dirname, `../../../uploads/${fileName}`),
                  fileStream = fs.createReadStream(filePath);

            res.setHeader('Content-disposition', `attachment; filename=${req.params.videoId}`);
            res.setHeader('Content-type', 'video/mp4');
            fileStream.pipe(res);
        } catch(err){
            logAndError(err, res);
        }
    }
    static async streamVideo(req, res){
        try{
            const fileName  = `${req.params.videoId}.mp4`,
                  filePath  = path.join(__dirname, `../../../uploads/${fileName}`),
                  stat      = fs.statSync(filePath),
                  range     = req.headers.range || 'bytes=0-',
                  positions = rangeParser(stat.size, range, { combine: true });

            if (Array.isArray(positions)) {
                return res.status(416).send('Requested range not satisfiable');
            }
            const start = positions.start,
                    end = ( positions.end === Infinity ? stat.size - 1 : positions.end ),
                    length = end - start + 1,
                    headers = {
                    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': length,
                    'Content-Type': 'video/mp4'
                };

            res.writeHead(206, headers);
            const stream = fs.createReadStream(filePath, { start, end });
            stream.pipe(res);
        } catch(err){
            logAndError(err, res);
        }
    }
}

module.exports = Handler;