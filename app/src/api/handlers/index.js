const   path = require('path'),
        fs   = require('fs'),
        mime = require('mime-types'),
 rangeParser = require('range-parser');

const logAndError = (err, res) => {
    console.log(err);
    res.status(500).send({error : 'Internal server error!'});
}

const getFilePath = fileName => {
    try{
        const folderPath = path.join(__dirname, '../../../uploads'),
              files      = fs.readdirSync(folderPath),
              fileRegex  = new RegExp(`^${fileName}.*$`),
              fileMatch  = files.find(file => fileRegex.test(file)),
                filePath = path.join(folderPath, fileMatch);
        return filePath;
    }
    catch(err){
        console.log(err);
        return null;
    }
}

class Handler {
    static async uploadVideo(req, res){
        try{
            if(req.file){
                res.status(200).send({videoId : req.videoId});
            }
            else{
                res.status(400).send({error : 'Proper video file not provided with.'});
            }
        } catch(err){
            logAndError(err, res);
        }
    }
    static async downloadVideo(req, res){
        try{
            const fileName = req.params.videoId,
                  filePath = getFilePath(fileName);

            if (filePath && fs.existsSync(filePath)) {
                const fileStream = fs.createReadStream(filePath),
                      mimetype = mime.lookup(filePath);
            
                res.setHeader('Content-Type', mimetype);
                res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
                fileStream.pipe(res);
            }
            else{
                res.status(404).send({error : 'File not found.'});
            }       
        } catch(err){
            logAndError(err, res);
        }
    }    
    static async streamVideo(req, res){
        try{
            const fileName  = req.params.videoId,
                   filePath = getFilePath(fileName);

            if(filePath && fs.existsSync(filePath)){
                const stat    = fs.statSync(filePath),
                    range     = req.headers.range || 'bytes=0-',
                    positions = rangeParser(stat.size, range, { combine: true });

                if (Array.isArray(positions) && positions.length > 1) {
                    return res.status(416).send({error : 'Requested range not satisfiable'});
                }
                const start = positions[0].start,
                        end = ( positions[0].end === Infinity ? stat.size - 1 : positions[0].end ),
                     length = end - start + 1,
                    headers = {
                        'Content-Range'  : `bytes ${start}-${end}/${stat.size}`,
                        'Accept-Ranges'  : 'bytes',
                        'Content-Length' : length,
                        'Content-Type'   : 'video/mp4'
                    };

                res.writeHead(206, headers);
                const stream = fs.createReadStream(filePath, { start, end });
                stream.pipe(res);
            }
            else{
                res.status(404).send({error : 'File not found.'});
            }
        } catch(err){
            logAndError(err, res);
        }
    }
}

module.exports = Handler;